import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const lastStudent = await db.collection('users')
      .findOne({ role: 'student', roll_no: { $ne: null } }, { sort: { _id: -1 } });

    let nextRollNumber = 1001;
    if (lastStudent && lastStudent.roll_no) {
      const lastRoll = parseInt(lastStudent.roll_no);
      if (!isNaN(lastRoll)) {
        nextRollNumber = lastRoll + 1;
      }
    }

    res.status(200).json({ next_roll_no: nextRollNumber.toString() });
  } catch (error) {
    console.error('Error getting next roll:', error);
    res.status(500).json({ message: 'Failed to get next roll number' });
  }
}

export default requireAdmin(handler);
