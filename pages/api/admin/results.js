import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const results = await db.collection('student_exams')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'student_id',
            foreignField: '_id',
            as: 'student'
          }
        },
        {
          $lookup: {
            from: 'exams',
            localField: 'exam_id',
            foreignField: '_id',
            as: 'exam'
          }
        },
        {
          $project: {
            _id: 1,
            score: 1,
            status: 1,
            time_taken: 1,
            submitted_at: 1,
            student_name: { $arrayElemAt: ['$student.name', 0] },
            exam_name: { $arrayElemAt: ['$exam.name', 0] },
            exam_id: { $arrayElemAt: ['$exam._id', 0] }
          }
        },
        { $sort: { submitted_at: -1 } }
      ])
      .toArray();

    res.status(200).json(results.map(r => ({ ...r, id: r._id })));
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAdmin(handler);
