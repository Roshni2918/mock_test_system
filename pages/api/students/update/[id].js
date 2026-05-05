import { connectToDatabase } from '../../../../lib/mongodb';
import { requireAdmin } from '../../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { student_name, batch_name, exam_type, mobile_no, email } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = require('mongodb');

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id), role: 'student' },
      {
        $set: {
          name: student_name,
          batch: batch_name,
          exam_type: exam_type || null,
          mobile_no: mobile_no || null,
          email: email,
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student', error: error.message });
  }
}

export default requireAdmin(handler);
