import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    // Check if we can connect to MongoDB
    const examCount = await db.collection('exams').countDocuments();
    const questionCount = await db.collection('questions').countDocuments();
    
    res.status(200).json({
      message: 'Upload API diagnostic',
      database: 'Connected',
      counts: {
        exams: examCount,
        questions: questionCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
}
