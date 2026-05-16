import { connectToDatabase } from '../../../../lib/mongodb';
import { requireStudent } from '../../../../lib/auth';
import { ObjectId } from 'mongodb';

function formatTimeRemaining(ms) {
  if (ms <= 0) return '';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = req.user;
  const examId = req.query.id;

  try {
    const { db } = await connectToDatabase();

    const exam = await db.collection('exams').findOne({
      _id: new ObjectId(examId),
      $or: [
        { batch: user.batch },
        { type: user.exam_type }
      ]
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const currentTime = new Date();
    const scheduledTime = new Date(exam.scheduled_time);
    const isAccessible = currentTime >= scheduledTime;
    const timeRemaining = scheduledTime - currentTime;
    const timeRemainingText = formatTimeRemaining(timeRemaining);

    res.status(200).json({
      accessible: isAccessible,
      exam: {
        id: exam._id,
        name: exam.name,
        type: exam.type,
        batch: exam.batch,
        duration: exam.duration,
        scheduled_time: exam.scheduled_time
      },
      time_remaining: timeRemainingText,
      message: isAccessible ? 'Exam is accessible' : `Exam not accessible. Time remaining: ${timeRemainingText}`
    });
  } catch (error) {
    console.error('Error checking exam access:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireStudent(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
