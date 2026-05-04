import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const exams = await db.collection('exams')
      .find()
      .sort({ created_at: -1 })
      .toArray();

    const examsWithCounts = await Promise.all(exams.map(async (exam) => {
      const count = await db.collection('questions').countDocuments({ exam_id: exam._id });
      return { ...exam, id: exam._id, total_questions: count };
    }));

    res.status(200).json(examsWithCounts);
  } catch (error) {
    console.error('Error fetching admin exams:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAdmin(handler);
