import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    // Count all collections
    const examCount = await db.collection('exams').countDocuments();
    const userCount = await db.collection('users').countDocuments();
    const questionCount = await db.collection('questions').countDocuments();
    
    res.status(200).json({
      message: 'Database Status (No Auth Required)',
      counts: {
        exams: examCount,
        users: userCount,
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
