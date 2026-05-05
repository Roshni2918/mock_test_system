import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const students = await db.collection('users')
      .find({ role: 'student' })
      .project({ name: 1, email: 1, batch: 1, exam_type: 1, roll_no: 1, created_at: 1 })
      .sort({ created_at: -1 })
      .toArray();

    res.status(200).json(students.map(s => ({ ...s, id: s._id })));
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAdmin(handler);
