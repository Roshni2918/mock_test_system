import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { student_name, batch_name, exam_type, admission_year, mobile_no, password_hash } = req.body;

  if (!student_name || !batch_name || !password_hash) {
    return res.status(400).json({ message: 'Please fill all required fields!' });
  }

  try {
    const { db } = await connectToDatabase();

    // Get last roll number
    const lastStudent = await db.collection('users')
      .findOne({ role: 'student', roll_no: { $ne: null } }, { sort: { _id: -1 } });

    let nextRollNumber = 1001;
    if (lastStudent && lastStudent.roll_no) {
      const lastRoll = parseInt(lastStudent.roll_no);
      if (!isNaN(lastRoll)) {
        nextRollNumber = lastRoll + 1;
      }
    }

    const roll_no = nextRollNumber.toString();
    const firstName = student_name.split(' ')[0].toLowerCase();
    const generatedEmail = `${firstName}${roll_no}@vijeta.com`;
    const hashedPassword = await bcrypt.hash(password_hash, 10);

    const result = await db.collection('users').insertOne({
      name: student_name,
      email: generatedEmail,
      password: hashedPassword,
      role: 'student',
      batch: batch_name,
      exam_type: exam_type || null,
      roll_no: roll_no,
      mobile_no: mobile_no || null,
      admission_year: admission_year || null,
      created_at: new Date()
    });

    res.status(200).json({
      message: 'Student added successfully!',
      student_id: result.insertedId,
      roll_no: roll_no,
      email: generatedEmail
    });
  } catch (error) {
    console.error('Error adding student:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Student email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
}

export default requireAdmin(handler);
