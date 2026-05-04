import { connectToDatabase } from '../../../lib/mongodb';
import { requireAuth, requireAdmin, requireStudent } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = req.user;

  try {
    const { db } = await connectToDatabase();
    let query = {};

    if (user.role === 'student') {
      query = { batch: user.batch, type: user.exam_type };
    }

    const exams = await db.collection('exams')
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    // Get question counts for each exam
    const examsWithCounts = await Promise.all(exams.map(async (exam) => {
      const count = await db.collection('questions').countDocuments({ exam_id: exam._id });
      return { ...exam, id: exam._id, total_questions: count };
    }));

    res.status(200).json(examsWithCounts);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAuth(handler);
