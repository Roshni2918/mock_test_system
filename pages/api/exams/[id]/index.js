import { connectToDatabase } from '../../../../lib/mongodb';
import { requireAuth } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = req.user;
  const examId = req.query.id;

  try {
    const { db } = await connectToDatabase();
    let query = { _id: new ObjectId(examId) };

    if (user.role === 'student') {
      query.batch = user.batch;
      query.type = user.exam_type;
    }

    const exam = await db.collection('exams').findOne(query);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or access denied' });
    }

    res.status(200).json({ ...exam, id: exam._id });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
