import { connectToDatabase } from '../../../lib/mongodb';
import { requireStudent } from '../../../lib/auth';
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

  try {
    const { db } = await connectToDatabase();

    const exams = await db.collection('exams')
      .find({ batch: user.batch, type: user.exam_type })
      .sort({ created_at: -1 })
      .toArray();

    const currentTime = new Date();
    const processedResults = await Promise.all(exams.map(async (exam) => {
      const scheduledTime = new Date(exam.scheduled_time);
      const isAccessible = currentTime >= scheduledTime;
      const timeRemaining = scheduledTime - currentTime;
      const timeRemainingText = formatTimeRemaining(timeRemaining);

      const count = await db.collection('questions').countDocuments({ exam_id: exam._id });

      return {
        ...exam,
        id: exam._id,
        total_questions: count,
        is_accessible: isAccessible,
        time_remaining: timeRemainingText,
        scheduled_time: exam.scheduled_time
      };
    }));

    res.status(200).json(processedResults);
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireStudent(handler);
