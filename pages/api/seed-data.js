import { connectToDatabase } from '../../lib/mongodb';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = require('mongodb');

    const results = {
      students: [],
      exams: [],
      results: []
    };

    // 1. ADD SAMPLE STUDENTS
    const studentsData = [
      { name: 'Roshni Pawar', batch: '2026', exam_type: 'JEE', mobile_no: '9876543210' },
      { name: 'Mangesh Sonawane', batch: '2026', exam_type: 'NEET', mobile_no: '9876543211' },
      { name: 'Priya Sharma', batch: '2026', exam_type: 'JEE', mobile_no: '9876543212' },
      { name: 'Amit Kumar', batch: '2026', exam_type: 'UPSC', mobile_no: '9876543213' },
      { name: 'Sneha Patil', batch: '2026', exam_type: 'NDA', mobile_no: '9876543214' },
      { name: 'Rahul Desai', batch: '2026', exam_type: 'JEE', mobile_no: '9876543215' },
      { name: 'Anjali Gupta', batch: '2026', exam_type: 'NEET', mobile_no: '9876543216' },
      { name: 'Vikram Singh', batch: '2026', exam_type: 'Mock Test', mobile_no: '9876543217' },
      { name: 'Neha Joshi', batch: '2026', exam_type: 'JEE', mobile_no: '9876543218' },
      { name: 'Raj Malhotra', batch: '2026', exam_type: 'UPSC', mobile_no: '9876543219' }
    ];

    const hashedPassword = await bcrypt.hash('student123', 10);
    let rollNumber = 1001;

    for (const student of studentsData) {
      const firstName = student.name.split(' ')[0].toLowerCase();
      const email = `${firstName}${rollNumber}@vijeta.com`;
      const rollNo = rollNumber.toString();

      const existing = await db.collection('users').findOne({ email });
      if (!existing) {
        await db.collection('users').insertOne({
          name: student.name,
          email: email,
          password: hashedPassword,
          role: 'student',
          batch: student.batch,
          exam_type: student.exam_type,
          roll_no: rollNo,
          mobile_no: student.mobile_no,
          admission_year: '2024',
          created_at: new Date()
        });
        results.students.push({ name: student.name, email, roll_no: rollNo });
      }
      rollNumber++;
    }

    // 2. ADD SAMPLE EXAMS
    const examsData = [
      {
        name: 'JEE Main Mock Test 1',
        type: 'JEE',
        batch: '2026',
        duration: 180,
        total_questions: 90,
        scheduled_time: new Date('2024-12-15T10:00:00Z'),
        questions: [
          { question_text: 'What is the unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], correctOption: 0 },
          { question_text: 'What is the speed of light?', options: ['3 x 10^8 m/s', '3 x 10^6 m/s', '3 x 10^10 m/s', '3 x 10^4 m/s'], correctOption: 0 },
          { question_text: 'What is the atomic number of Carbon?', options: ['6', '8', '12', '14'], correctOption: 0 },
          { question_text: 'What is the pH of pure water?', options: ['7', '0', '14', '1'], correctOption: 0 },
          { question_text: 'What is the derivative of x^2?', options: ['2x', 'x', 'x^2', '2'], correctOption: 0 }
        ]
      },
      {
        name: 'NEET Biology Test',
        type: 'NEET',
        batch: '2026',
        duration: 180,
        total_questions: 180,
        scheduled_time: new Date('2024-12-16T10:00:00Z'),
        questions: [
          { question_text: 'What is the powerhouse of cell?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Golgi'], correctOption: 0 },
          { question_text: 'Which vitamin is produced by skin?', options: ['Vitamin D', 'Vitamin C', 'Vitamin A', 'Vitamin K'], correctOption: 0 },
          { question_text: 'What is the largest organ of human body?', options: ['Skin', 'Liver', 'Heart', 'Brain'], correctOption: 0 },
          { question_text: 'How many bones in adult human body?', options: ['206', '208', '210', '212'], correctOption: 0 },
          { question_text: 'What is the pH of blood?', options: ['7.4', '7.0', '8.0', '6.8'], correctOption: 0 }
        ]
      },
      {
        name: 'UPSC Prelims Practice',
        type: 'UPSC',
        batch: '2026',
        duration: 120,
        total_questions: 100,
        scheduled_time: new Date('2024-12-17T10:00:00Z'),
        questions: [
          { question_text: 'Who wrote the Indian Constitution?', options: ['Dr. Ambedkar', 'Nehru', 'Gandhi', 'Patel'], correctOption: 0 },
          { question_text: 'What is the capital of India?', options: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'], correctOption: 0 },
          { question_text: 'Which is the longest river in India?', options: ['Ganga', 'Yamuna', 'Brahmaputra', 'Godavari'], correctOption: 0 },
          { question_text: 'Who was the first President of India?', options: ['Dr. Rajendra Prasad', 'Nehru', 'Gandhi', 'Sardar Patel'], correctOption: 0 },
          { question_text: 'In which year India got independence?', options: ['1947', '1950', '1935', '1960'], correctOption: 0 }
        ]
      },
      {
        name: 'NDA Mathematics Test',
        type: 'NDA',
        batch: '2026',
        duration: 150,
        total_questions: 120,
        scheduled_time: new Date('2024-12-18T10:00:00Z'),
        questions: [
          { question_text: 'What is the value of sin(90°)?', options: ['1', '0', '∞', '-1'], correctOption: 0 },
          { question_text: 'What is the area of circle formula?', options: ['πr²', '2πr', 'πd', '2πr²'], correctOption: 0 },
          { question_text: 'What is the Pythagorean theorem?', options: ['a² + b² = c²', 'a + b = c', 'a × b = c', 'a - b = c'], correctOption: 0 },
          { question_text: 'What is the derivative of constant?', options: ['0', '1', 'constant', 'undefined'], correctOption: 0 },
          { question_text: 'What is the integral of 1/x?', options: ['ln|x|', 'x', '1/x²', '0'], correctOption: 0 }
        ]
      },
      {
        name: 'JEE Advanced Practice',
        type: 'JEE',
        batch: '2026',
        duration: 180,
        total_questions: 54,
        scheduled_time: new Date('2024-12-19T10:00:00Z'),
        questions: [
          { question_text: 'What is the Schrödinger equation used for?', options: ['Quantum mechanics', 'Classical mechanics', 'Thermodynamics', 'Optics'], correctOption: 0 },
          { question_text: 'What is the Heisenberg Uncertainty Principle about?', options: ['Position and momentum', 'Energy and time', 'Mass and velocity', 'Force and acceleration'], correctOption: 0 },
          { question_text: 'What is the chemical formula of benzene?', options: ['C6H6', 'C6H12', 'C2H6', 'CH4'], correctOption: 0 },
          { question_text: 'What is the integration of e^x?', options: ['e^x', 'xe^x', 'e^x/x', 'ln(e^x)'], correctOption: 0 },
          { question_text: 'What is the dimensional formula of force?', options: ['MLT⁻²', 'MLT²', 'ML²T⁻²', 'ML⁻¹T²'], correctOption: 0 }
        ]
      }
    ];

    for (const examData of examsData) {
      const existingExam = await db.collection('exams').findOne({ name: examData.name });
      if (!existingExam) {
        const examResult = await db.collection('exams').insertOne({
          name: examData.name,
          type: examData.type,
          batch: examData.batch,
          duration: examData.duration,
          total_questions: examData.questions.length,
          scheduled_time: examData.scheduled_time,
          created_at: new Date()
        });

        const examId = examResult.insertedId;

        // Add questions for this exam
        for (const q of examData.questions) {
          const questionResult = await db.collection('questions').insertOne({
            exam_id: examId,
            section_name: 'General',
            question_text: q.question_text,
            created_at: new Date()
          });

          const questionId = questionResult.insertedId;

          // Add options
          for (let i = 0; i < q.options.length; i++) {
            await db.collection('options').insertOne({
              question_id: questionId,
              option_text: q.options[i],
              is_correct: i === q.correctOption,
              created_at: new Date()
            });
          }
        }

        results.exams.push({ name: examData.name, type: examData.type, id: examId });
      }
    }

    // 3. ADD SAMPLE RESULTS
    const jeeStudents = await db.collection('users').find({ role: 'student', exam_type: 'JEE' }).limit(3).toArray();
    const jeeExam = await db.collection('exams').findOne({ type: 'JEE' });

    if (jeeStudents.length > 0 && jeeExam) {
      for (let i = 0; i < jeeStudents.length; i++) {
        const student = jeeStudents[i];
        const score = 65 + (i * 10); // 65, 75, 85

        const existingResult = await db.collection('results').findOne({
          student_id: student._id,
          exam_id: jeeExam._id
        });

        if (!existingResult) {
          await db.collection('results').insertOne({
            student_id: student._id,
            exam_id: jeeExam._id,
            student_name: student.name,
            exam_name: jeeExam.name,
            exam_type: jeeExam.type,
            score: score,
            total_questions: jeeExam.total_questions,
            attempted_questions: Math.floor(jeeExam.total_questions * 0.8),
            correct_answers: Math.floor(score * jeeExam.total_questions / 100),
            time_taken: jeeExam.duration * 60 * 0.85,
            status: 'completed',
            submitted_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
          });
          results.results.push({ student: student.name, exam: jeeExam.name, score });
        }
      }
    }

    res.status(200).json({
      message: 'Database seeded successfully! 🎉',
      summary: {
        studentsAdded: results.students.length,
        examsAdded: results.exams.length,
        resultsAdded: results.results.length
      },
      details: results
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed database', error: error.message });
  }
}

export default handler;
