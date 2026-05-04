import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    // Get distinct batches from exams
    const examBatches = await db.collection('exams')
      .distinct('batch', { batch: { $ne: null } });

    // Get distinct batches from students
    const studentBatches = await db.collection('users')
      .distinct('batch', { role: 'student', batch: { $ne: null } });

    // Combine and remove duplicates
    const allBatches = [...new Set([...examBatches, ...studentBatches])];

    res.status(200).json(allBatches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ error: error.message });
  }
}
