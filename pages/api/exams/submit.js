import { connectToDatabase } from '../../../lib/mongodb';
import { requireStudent } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = req.user;
  const { examId, answers, time_taken } = req.body;

  if (!examId || !answers || typeof answers !== 'object') {
    return res.status(400).json({ message: 'Exam ID and answers are required' });
  }

  try {
    const { db } = await connectToDatabase();

    // Check if already submitted
    const existing = await db.collection('student_exams').findOne({
      student_id: new ObjectId(user.id),
      exam_id: new ObjectId(examId)
    });

    if (existing) {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    // Check if exam exists and student has access
    const exam = await db.collection('exams').findOne({
      _id: new ObjectId(examId),
      batch: user.batch,
      type: user.exam_type
    });

    if (!exam) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const currentTime = new Date();
    const scheduledTime = new Date(exam.scheduled_time);
    if (currentTime < scheduledTime) {
      return res.status(403).json({ message: 'Exam is not available yet' });
    }

    // Calculate score
    const optionIds = Object.values(answers).map(id => id.toString()).filter(Boolean);
    const optionDocs = await db.collection('options')
      .find({ _id: { $in: optionIds.map(id => new ObjectId(id)) }, is_correct: true })
      .toArray();

    const correctSet = new Set(optionDocs.map(opt => opt._id.toString()));
    const score = optionIds.reduce((sum, optionId) => sum + (correctSet.has(optionId) ? 1 : 0), 0);

    // Create submission
    await db.collection('student_exams').insertOne({
      student_id: new ObjectId(user.id),
      exam_id: new ObjectId(examId),
      score,
      answers,
      time_taken: time_taken || 0,
      status: 'completed',
      submitted_at: new Date()
    });

    res.status(200).json({ message: 'Exam submitted successfully', score });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireStudent(handler);
