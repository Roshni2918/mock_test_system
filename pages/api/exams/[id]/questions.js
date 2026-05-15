import { connectToDatabase } from '../../../../lib/mongodb';
import { requireStudent } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = req.user;
  const examId = req.query.id;

  try {
    const { db } = await connectToDatabase();

    // Check if student can access this exam (batch OR type must match)
    const exam = await db.collection('exams').findOne({
      _id: new ObjectId(examId),
      $or: [
        { batch: user.batch },
        { type: user.exam_type }
      ]
    });

    if (!exam) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const currentTime = new Date();
    const scheduledTime = new Date(exam.scheduled_time);
    if (currentTime < scheduledTime) {
      return res.status(403).json({ message: 'Exam is not available yet' });
    }

    // Get questions with options
    const questions = await db.collection('questions')
      .find({ exam_id: new ObjectId(examId) })
      .toArray();

    const questionIds = questions.map(q => q._id.toString());
    const options = await db.collection('options')
      .find({ question_id: { $in: questionIds.map(id => new ObjectId(id)) } })
      .toArray();

    // Group options by question
    const optionsByQuestion = {};
    options.forEach(opt => {
      const qId = opt.question_id.toString();
      if (!optionsByQuestion[qId]) optionsByQuestion[qId] = [];
      optionsByQuestion[qId].push({ id: opt._id, text: opt.option_text });
    });

    const groupedQuestions = questions.map(q => ({
      id: q._id,
      question: q.question_text || q.question,
      section: q.section_name || q.section,
      options: optionsByQuestion[q._id.toString()] || []
    }));

    res.status(200).json(groupedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireStudent(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
