import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();
    
    // Count exams
    const examCount = await db.collection('exams').countDocuments();
    
    // Get sample exams
    const exams = await db.collection('exams').find({}).limit(5).toArray();
    
    res.status(200).json({
      message: 'Database check',
      totalExams: examCount,
      sampleExams: exams.map(e => ({ 
        id: e._id?.toString(),
        name: e.name,
        type: e.type,
        mysql_id: e.mysql_id
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error checking database', 
      error: error.message 
    });
  }
}
