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

    // Detect question - supports multiple formats
    const questionMatch = line.match(/^Q?(\d+)[\.\)]\s*(.+)/i);
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
      continue;
    }

    // Detect option - supports A), B), C), D) or A., B., C., D.
    const optionMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);
    if (optionMatch && currentQuestion) {
      currentQuestion.options.push({
        letter: optionMatch[1].toUpperCase(),
        text: optionMatch[2]
      });
      continue;
    }

    // Detect answer - supports "Answer: A", "Ans: A", "Answer: A)" formats
    const answerMatch = line.match(/^(?:ANSWER|ANS):?\s*([A-D])/i);
    if (answerMatch && currentQuestion) {
      currentQuestion.answer = answerMatch[1].toUpperCase();
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
    const sections = parseWordContent(result.value);

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
      for (const q of section.questions) {
        if (!q.text || q.options.length < 2) continue;

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
