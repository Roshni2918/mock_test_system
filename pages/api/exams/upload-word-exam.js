import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';
import multer from 'multer';
import mammoth from 'mammoth';

// Use memory storage for Vercel serverless compatibility
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

function parseWordContent(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const sections = [];
  let currentSection = null;
  let currentQuestion = null;
  let questionNumber = 1;

  for (const line of lines) {
    // Detect section header
    if (line.toUpperCase().startsWith('SECTION:')) {
      if (currentQuestion) {
        if (!currentSection) {
          currentSection = { name: 'General', questions: [] };
          sections.push(currentSection);
        }
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      currentSection = {
        name: line.replace(/SECTION:/i, '').trim(),
        questions: []
      };
      sections.push(currentSection);
      continue;
    }

    // Detect question - MORE FLEXIBLE formats
    // Supports: 1., 1), Q1., Q1), 1:, Question 1, etc.
    const questionMatch = line.match(/^(?:Q(?:uestion)?\s*)?(\d+)[\.\):]\s*(.+)/i);
    if (questionMatch) {
      if (currentQuestion) {
        if (!currentSection) {
          currentSection = { name: 'General', questions: [] };
          sections.push(currentSection);
        }
        currentSection.questions.push(currentQuestion);
      }
      currentQuestion = {
        number: parseInt(questionMatch[1]),
        text: questionMatch[2],
        options: []
      };
      questionNumber = parseInt(questionMatch[1]) + 1;
      continue;
    }

    // Detect option - MORE FLEXIBLE formats
    // Supports: A), B), C), D), A., B., C., D., (A), (B), (C), (D), a), b), c), d)
    // Also supports numeric options: 1), 2), 3), 4), 1., 2., 3., 4.
    const optionMatch = line.match(/^(\(?[A-Da-d]\)?[\.\)]?\s*)\s*(.+)/i);
    const numericOptionMatch = line.match(/^([1-4])[\)\.\s]+(.+)/);
    
    if (optionMatch && currentQuestion) {
      const letter = optionMatch[1].replace(/[\(\)\.\)]/g, '').toUpperCase();
      if (letter.match(/^[A-D]$/)) {
        currentQuestion.options.push({
          letter: letter,
          text: optionMatch[2]
        });
      }
      continue;
    }
    
    if (numericOptionMatch && currentQuestion) {
      // Convert numeric option to letter (1->A, 2->B, 3->C, 4->D)
      const letterMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      currentQuestion.options.push({
        letter: letterMap[numericOptionMatch[1]],
        text: numericOptionMatch[2]
      });
      continue;
    }

    // Detect answer - MORE FLEXIBLE formats
    // Supports: Answer: A, Ans: A, Answer: A), Correct: A, Solution: A, etc.
    // Also supports numeric answers: Answer: 1, Ans: 2, etc.
    const answerMatch = line.match(/^(?:ANSWER|ANS|CORRECT|SOLUTION):?\s*[\(\)]?\s*([A-D])/i);
    const numericAnswerMatch = line.match(/^(?:ANSWER|ANS|CORRECT|SOLUTION):?\s*[\(\)]?\s*([1-4])/i);
    
    if (answerMatch && currentQuestion) {
      currentQuestion.answer = answerMatch[1].toUpperCase();
    }
    
    if (numericAnswerMatch && currentQuestion) {
      // Convert numeric answer to letter (1->A, 2->B, 3->C, 4->D)
      const letterMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      currentQuestion.answer = letterMap[numericAnswerMatch[1]];
    }

    // If line looks like a question (starts with number but no option format)
    // and we're not in a question, treat it as a question
    if (!currentQuestion && !optionMatch && line.match(/^\d+\./)) {
      const parts = line.split('.');
      if (parts.length > 1) {
        currentQuestion = {
          number: parseInt(parts[0]),
          text: parts.slice(1).join('.').trim(),
          options: []
        };
        continue;
      }
    }
  }

  // Add final question
  if (currentQuestion) {
    if (!currentSection) {
      currentSection = { name: 'General', questions: [] };
      sections.push(currentSection);
    }
    currentSection.questions.push(currentQuestion);
  }

  // If no questions found, try alternative parsing
  if (sections.length === 0 || sections.every(s => s.questions.length === 0)) {
    console.log('Primary parsing failed, trying alternative...');
    return parseWordContentAlternative(content);
  }

  return sections;
}

function parseWordContentAlternative(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const sections = [];
  let currentSection = { name: 'General', questions: [] };
  sections.push(currentSection);
  let currentQuestion = null;

  for (const line of lines) {
    // Very lenient question detection - any line that starts with a number
    const numberMatch = line.match(/^(\d+)[\.\)\s]+(.+)/);
    if (numberMatch && !currentQuestion) {
      currentQuestion = {
        number: parseInt(numberMatch[1]),
        text: numberMatch[2],
        options: []
      };
      continue;
    }

    // Very lenient option detection - supports both letter (A, B, C, D) and numeric (1, 2, 3, 4) options
    const letterMatch = line.match(/^([A-Da-d])[\.\)\s]+(.+)/);
    const numericOptionMatch = line.match(/^([1-4])[\)\.\s]+(.+)/);
    
    if (letterMatch && currentQuestion) {
      currentQuestion.options.push({
        letter: letterMatch[1].toUpperCase(),
        text: letterMatch[2]
      });
      continue;
    }
    
    if (numericOptionMatch && currentQuestion) {
      // Convert numeric option to letter (1->A, 2->B, 3->C, 4->D)
      const letterMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      currentQuestion.options.push({
        letter: letterMap[numericOptionMatch[1]],
        text: numericOptionMatch[2]
      });
      continue;
    }

    // If we have a question and the line doesn't look like an option, append to question text
    if (currentQuestion && !letterMatch && !numberMatch && !numericOptionMatch) {
      currentQuestion.text += ' ' + line;
      continue;
    }

    // If we have options and the next line is a number, save current question
    if (currentQuestion && currentQuestion.options.length > 0 && numberMatch) {
      currentSection.questions.push(currentQuestion);
      currentQuestion = {
        number: parseInt(numberMatch[1]),
        text: numberMatch[2],
        options: []
      };
    }
  }

  if (currentQuestion) {
    currentSection.questions.push(currentQuestion);
  }

  return sections;
}

async function handler(req, res) {
  try {
    // Use 'examFile' to match frontend field name
    await runMiddleware(req, res, upload.single('examFile'));

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, type, batch, duration, scheduled_date } = req.body;

    if (!name || !type || !batch || !duration || !scheduled_date) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Parse Word file from memory buffer
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    console.log('Word content length:', result.value.length);
    const sections = parseWordContent(result.value);
    console.log('Parsed sections:', sections.length);
    console.log('Total questions in sections:', sections.reduce((sum, s) => sum + s.questions.length, 0));

    const { db } = await connectToDatabase();

    // Create exam
    const examResult = await db.collection('exams').insertOne({
      name,
      type,
      batch,
      duration: parseInt(duration, 10),
      scheduled_time: new Date(scheduled_date),
      total_questions: 0,
      created_at: new Date()
    });

    const examId = examResult.insertedId;
    let totalQuestions = 0;

    // Add questions
    for (const section of sections) {
      console.log(`Processing section: ${section.name}, questions: ${section.questions.length}`);
      for (const q of section.questions) {
        if (!q.text || q.options.length < 2) {
          console.log('Skipping question - no text or less than 2 options');
          continue;
        }

        const questionResult = await db.collection('questions').insertOne({
          exam_id: examId,
          section_name: section.name,
          question_text: q.text,
          section: section.name,
          question: q.text,
          created_at: new Date()
        });

        const questionId = questionResult.insertedId;

        for (let i = 0; i < q.options.length; i++) {
          const opt = q.options[i];
          await db.collection('options').insertOne({
            question_id: questionId,
            option_text: opt.text,
            is_correct: q.answer === opt.letter,
            created_at: new Date()
          });
        }

        totalQuestions++;
      }
    }
    
    console.log('Total questions inserted:', totalQuestions);

    // Update exam with question count
    await db.collection('exams').updateOne(
      { _id: examId },
      { $set: { total_questions: totalQuestions } }
    );

    res.status(200).json({
      message: 'Exam uploaded successfully',
      exam_id: examId,
      total_questions: totalQuestions,
      sections: sections.map(s => ({ name: s.name, questionCount: s.questions.length }))
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload exam', error: error.message });
  }
}

export default requireAdmin(handler);
