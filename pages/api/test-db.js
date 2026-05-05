import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    res.status(200).json({ 
      status: 'connected', 
      userCount: users.length,
      adminExists: users.some(u => u.email === 'admin@example.com')
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      stack: error.stack 
    });
  }
}
