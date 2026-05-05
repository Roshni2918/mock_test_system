import { connectToDatabase } from '../../../../lib/mongodb';
import { requireAdmin } from '../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = require('mongodb');

    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id),
      role: 'student'
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
}

export default requireAdmin(handler);
