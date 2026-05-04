import { connectToDatabase } from '../../lib/mongodb';
import { requireAdmin } from '../../lib/auth';
import multer from 'multer';
import mammoth from 'mammoth';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

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

    // Detect question
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

    // Detect option
    const optionMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);
    if (optionMatch && currentQuestion) {
      currentQuestion.options.push({
        letter: optionMatch[1].toUpperCase(),
        text: optionMatch[2]
      });
      continue;
    }

    // Detect answer
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
    await runMiddleware(req, res, upload.single('file'));

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { name, type, batch, duration, scheduled_date } = req.body;

    if (!name || !type || !batch || !duration || !scheduled_date) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Parse Word file
    const buffer = fs.readFileSync(file.path);
    const result = await mammoth.extractRawText({ buffer });
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
        if (!q.text || q.options.length !== 4) continue;

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

    // Delete uploaded file
    fs.unlinkSync(file.path);

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
