import { connectToDatabase } from '../../../../lib/mongodb';
import { requireAdmin } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
  const { id } = req.query;

  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid exam ID' });
  }

  try {
    const { db } = await connectToDatabase();
    const examId = new ObjectId(id);

    if (req.method === 'PUT') {
      const { name, type, batch, duration, scheduled_time } = req.body;

      if (!name || !type || !batch || !duration || !scheduled_time) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const updateResult = await db.collection('exams').updateOne(
        { _id: examId },
        { 
          $set: {
            name,
            type,
            batch,
            duration: Number(duration),
            scheduled_time: new Date(scheduled_time),
            updated_at: new Date()
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      return res.status(200).json({ message: 'Exam updated successfully' });
    }

    if (req.method === 'DELETE') {
      // Delete exam and related data
      await db.collection('exams').deleteOne({ _id: examId });
      await db.collection('questions').deleteMany({ exam_id: examId });
      await db.collection('options').deleteMany({ exam_id: examId });
      
      return res.status(200).json({ message: 'Exam deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Error handling exam:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default requireAdmin(handler);
