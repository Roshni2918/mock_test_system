import { connectToDatabase } from '../../lib/mongodb';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST to seed database' });
  }

  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = require('mongodb');

    const results = {
      admin: [],
      examTypes: [],
      subjects: [],
      students: [],
      exams: [],
      questions: [],
      results: []
    };

    // 1. ADD ADMIN
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminData = {
      admin_name: 'Mahesh Kulkarni',
      email: 'mahesh.kulkarni@vijetafoundation.in',
      mobile_no: '9876543210',
      password: hashedAdminPassword,
      role: 'admin',
      academy_name: 'Vijeta Foundation',
      city: 'Pune',
      state: 'Maharashtra',
      account_status: 'Active',
      created_at: new Date()
    };

    await db.collection('users').updateOne(
      { email: adminData.email },
      { $setOnInsert: adminData },
      { upsert: true }
    );
    results.admin.push({ name: adminData.admin_name, email: adminData.email });

    // 2. ADD EXAM TYPES
    const examTypesData = [
      { exam_type_name: 'SSB', description_text: 'Services Selection Board mock tests' },
      { exam_type_name: 'SSC', description_text: 'Staff Selection Commission mock tests' },
      { exam_type_name: 'NDA', description_text: 'National Defence Academy mock tests' },
      { exam_type_name: 'Police Constable', description_text: 'Police Constable recruitment mock tests' },
      { exam_type_name: 'Other', description_text: 'Other competitive exams' }
    ];

    for (const et of examTypesData) {
      await db.collection('exam_types').updateOne(
        { exam_type_name: et.exam_type_name },
        { $setOnInsert: et },
        { upsert: true }
      );
      results.examTypes.push(et.exam_type_name);
    }

    // 3. ADD SUBJECTS
    const subjectsData = [
      { subject_name: 'Mathematics', description_text: 'Mathematics section' },
      { subject_name: 'Physics', description_text: 'Physics section' },
      { subject_name: 'Chemistry', description_text: 'Chemistry section' },
      { subject_name: 'Reasoning', description_text: 'Reasoning section' },
      { subject_name: 'English', description_text: 'English language section' },
      { subject_name: 'General Knowledge', description_text: 'General Knowledge section' }
    ];

    for (const sub of subjectsData) {
      await db.collection('subjects').updateOne(
        { subject_name: sub.subject_name },
        { $setOnInsert: sub },
        { upsert: true }
      );
    }

    // 4. ADD 13 STUDENTS
    const hashedStudentPassword = await bcrypt.hash('1234', 10);
    const studentsData = [
      { name: 'Shrutika More', batch: 'NDA', roll_no: 'NDA101', mobile_no: '9000000001', email: 'shrutika.more@test.com', exam_type: 'NDA', city: 'Sangli', college_name: 'Annasaheb Dange College of Engineering and Technology, Ashta' },
      { name: 'Gayatri Sutar', batch: 'NDA', roll_no: 'NDA102', mobile_no: '9000000002', email: 'gayatri.sutar@test.com', exam_type: 'NDA', city: 'Kolhapur', college_name: 'ADCET Ashta' },
      { name: 'Roshni Pawar', batch: 'SSC', roll_no: 'SSC103', mobile_no: '9000000003', email: 'roshni.pawar@test.com', exam_type: 'SSC', city: 'Satara', college_name: 'ADCET Ashta' },
      { name: 'Sakshi Nalawade', batch: 'SSB', roll_no: 'SSB104', mobile_no: '9000000004', email: 'sakshi.nalawade@test.com', exam_type: 'SSB', city: 'Mumbai', college_name: 'ADCET Ashta' },
      { name: 'Samruddhi Bodhale', batch: 'NDA', roll_no: 'NDA105', mobile_no: '9000000005', email: 'samruddhi.bodhale@test.com', exam_type: 'NDA', city: 'Pune', college_name: 'ADCET Ashta' },
      { name: 'Srushti Thorat', batch: 'SSC', roll_no: 'SSC106', mobile_no: '9000000006', email: 'srushti.thorat@test.com', exam_type: 'SSC', city: 'Nashik', college_name: 'ADCET Ashta' },
      { name: 'Apurva Desai', batch: 'SSB', roll_no: 'SSB107', mobile_no: '9000000007', email: 'apurva.desai@test.com', exam_type: 'SSB', city: 'Nagpur', college_name: 'ADCET Ashta' },
      { name: 'Deepali Natkar', batch: 'NDA', roll_no: 'NDA108', mobile_no: '9000000008', email: 'deepali.natkar@test.com', exam_type: 'NDA', city: 'Solapur', college_name: 'ADCET Ashta' },
      { name: 'Rahul Patil', batch: 'NDA', roll_no: 'NDA109', mobile_no: '9000000009', email: 'rahul.patil@test.com', exam_type: 'NDA', city: 'Pune', college_name: 'ADCET Ashta' },
      { name: 'Amit Jadhav', batch: 'SSC', roll_no: 'SSC110', mobile_no: '9000000010', email: 'amit.jadhav@test.com', exam_type: 'SSC', city: 'Aurangabad', college_name: 'ADCET Ashta' },
      { name: 'Rohit Shinde', batch: 'SSB', roll_no: 'SSB111', mobile_no: '9000000011', email: 'rohit.shinde@test.com', exam_type: 'SSB', city: 'Thane', college_name: 'ADCET Ashta' },
      { name: 'Ankit Patil', batch: 'Police Constable', roll_no: 'PC112', mobile_no: '9000000012', email: 'ankit.patil@test.com', exam_type: 'Police Constable', city: 'Kolhapur', college_name: 'ADCET Ashta' },
      { name: 'Sandeep Yadav', batch: 'Police Constable', roll_no: 'PC113', mobile_no: '9000000013', email: 'sandeep.yadav@test.com', exam_type: 'Police Constable', city: 'Nagpur', college_name: 'ADCET Ashta' }
    ];

    for (const student of studentsData) {
      const studentDoc = {
        ...student,
        password: hashedStudentPassword,
        role: 'student',
        state: 'Maharashtra',
        admission_year: '2024',
        account_status: 'Active',
        created_at: new Date()
      };

      await db.collection('users').updateOne(
        { email: student.email },
        { $setOnInsert: studentDoc },
        { upsert: true }
      );
      results.students.push({ name: student.name, email: student.email, roll_no: student.roll_no });
    }

    // 5. ADD 3 EXAMS
    const examsData = [
      {
        name: 'NDA Mock Test 1',
        type: 'NDA',
        batch: '2026',
        total_questions: 3,
        total_marks: 12.00,
        duration: 60,
        exam_status: 'Scheduled',
        instructions_text: 'Read all instructions carefully. Do not close the application during the test. Tick I agree to rules before starting.',
        scheduled_time: new Date('2026-03-20T10:00:00Z'),
        created_at: new Date()
      },
      {
        name: 'SSC Mock Test 1',
        type: 'SSC',
        batch: '2026',
        total_questions: 2,
        total_marks: 8.00,
        duration: 45,
        exam_status: 'Scheduled',
        instructions_text: 'Read all instructions carefully and submit before time ends.',
        scheduled_time: new Date('2026-03-21T11:00:00Z'),
        created_at: new Date()
      },
      {
        name: 'Police Constable Mock Test 1',
        type: 'Police Constable',
        batch: '2026',
        total_questions: 2,
        total_marks: 8.00,
        duration: 30,
        exam_status: 'Scheduled',
        instructions_text: 'Follow all exam rules and start only after accepting instructions.',
        scheduled_time: new Date('2026-03-22T09:30:00Z'),
        created_at: new Date()
      }
    ];

    for (const exam of examsData) {
      await db.collection('exams').updateOne(
        { name: exam.name },
        { $setOnInsert: exam },
        { upsert: true }
      );
      results.exams.push({ name: exam.name, type: exam.type });
    }

    // 6. ADD 7 QUESTIONS WITH OPTIONS
    const questionsData = [
      {
        question_text: 'What is the value of 2 + 2 ?',
        exam_name: 'NDA Mock Test 1',
        marks: 4.00,
        explanation_text: '2 + 2 equals 4.',
        options: [
          { option_text: '3', is_correct: false },
          { option_text: '4', is_correct: true },
          { option_text: '5', is_correct: false },
          { option_text: '6', is_correct: false }
        ]
      },
      {
        question_text: 'What is the SI unit of speed?',
        exam_name: 'NDA Mock Test 1',
        marks: 4.00,
        explanation_text: 'The SI unit of speed is metre per second.',
        options: [
          { option_text: 'm/s²', is_correct: false },
          { option_text: 'kg', is_correct: false },
          { option_text: 'm/s', is_correct: true },
          { option_text: 'N', is_correct: false }
        ]
      },
      {
        question_text: 'Identify the odd one out: Apple, Banana, Mango, Car',
        exam_name: 'NDA Mock Test 1',
        marks: 4.00,
        explanation_text: 'Car is not a fruit.',
        options: [
          { option_text: 'Apple', is_correct: false },
          { option_text: 'Banana', is_correct: false },
          { option_text: 'Mango', is_correct: false },
          { option_text: 'Car', is_correct: true }
        ]
      },
      {
        question_text: 'Choose the synonym of the word "Large".',
        exam_name: 'SSC Mock Test 1',
        marks: 4.00,
        explanation_text: 'Large means Big.',
        options: [
          { option_text: 'Big', is_correct: true },
          { option_text: 'Small', is_correct: false },
          { option_text: 'Tiny', is_correct: false },
          { option_text: 'Short', is_correct: false }
        ]
      },
      {
        question_text: 'What is the capital of Maharashtra?',
        exam_name: 'SSC Mock Test 1',
        marks: 4.00,
        explanation_text: 'Mumbai is the capital of Maharashtra.',
        options: [
          { option_text: 'Pune', is_correct: false },
          { option_text: 'Mumbai', is_correct: true },
          { option_text: 'Nagpur', is_correct: false },
          { option_text: 'Nashik', is_correct: false }
        ]
      },
      {
        question_text: 'Find the next number in the series: 2, 4, 6, 8, ?',
        exam_name: 'Police Constable Mock Test 1',
        marks: 4.00,
        explanation_text: 'The pattern increases by 2, so next is 10.',
        options: [
          { option_text: '10', is_correct: true },
          { option_text: '11', is_correct: false },
          { option_text: '12', is_correct: false },
          { option_text: '13', is_correct: false }
        ]
      },
      {
        question_text: 'What is the full form of FIR?',
        exam_name: 'Police Constable Mock Test 1',
        marks: 4.00,
        explanation_text: 'FIR stands for First Information Report.',
        options: [
          { option_text: 'First Investigation Report', is_correct: false },
          { option_text: 'First Information Report', is_correct: true },
          { option_text: 'Fast Investigation Record', is_correct: false },
          { option_text: 'Final Information Report', is_correct: false }
        ]
      }
    ];

    for (const q of questionsData) {
      const exam = await db.collection('exams').findOne({ name: q.exam_name });
      if (exam) {
        const questionResult = await db.collection('questions').insertOne({
          exam_id: exam._id,
          question_text: q.question_text,
          marks: q.marks,
          explanation_text: q.explanation_text,
          created_at: new Date()
        });

        const questionId = questionResult.insertedId;

        for (let i = 0; i < q.options.length; i++) {
          await db.collection('options').insertOne({
            question_id: questionId,
            option_label: String.fromCharCode(65 + i),
            option_text: q.options[i].option_text,
            is_correct: q.options[i].is_correct,
            created_at: new Date()
          });
        }

        results.questions.push({ text: q.question_text.substring(0, 30) + '...' });
      }
    }

    // 7. ADD 4 RESULTS
    const shrutika = await db.collection('users').findOne({ email: 'shrutika.more@test.com' });
    const gayatri = await db.collection('users').findOne({ email: 'gayatri.sutar@test.com' });
    const roshni = await db.collection('users').findOne({ email: 'roshni.pawar@test.com' });
    const ankit = await db.collection('users').findOne({ email: 'ankit.patil@test.com' });
    
    const ndaExam = await db.collection('exams').findOne({ name: 'NDA Mock Test 1' });
    const sscExam = await db.collection('exams').findOne({ name: 'SSC Mock Test 1' });
    const policeExam = await db.collection('exams').findOne({ name: 'Police Constable Mock Test 1' });

    const resultsData = [];
    
    if (shrutika && ndaExam) {
      resultsData.push({
        student_id: shrutika._id,
        student_name: shrutika.name,
        exam_id: ndaExam._id,
        exam_name: ndaExam.name,
        exam_type: ndaExam.type,
        score: 100,
        total_questions: 3,
        attempted_questions: 3,
        correct_answers: 3,
        wrong_answers: 0,
        time_taken: 2400,
        status: 'completed',
        submitted_at: new Date('2026-03-20T10:40:00Z')
      });
    }
    
    if (gayatri && ndaExam) {
      resultsData.push({
        student_id: gayatri._id,
        student_name: gayatri.name,
        exam_id: ndaExam._id,
        exam_name: ndaExam.name,
        exam_type: ndaExam.type,
        score: 58,
        total_questions: 3,
        attempted_questions: 3,
        correct_answers: 2,
        wrong_answers: 1,
        time_taken: 3360,
        status: 'completed',
        submitted_at: new Date('2026-03-20T10:58:00Z')
      });
    }
    
    if (roshni && sscExam) {
      resultsData.push({
        student_id: roshni._id,
        student_name: roshni.name,
        exam_id: sscExam._id,
        exam_name: sscExam.name,
        exam_type: sscExam.type,
        score: 100,
        total_questions: 2,
        attempted_questions: 2,
        correct_answers: 2,
        wrong_answers: 0,
        time_taken: 1800,
        status: 'completed',
        submitted_at: new Date('2026-03-21T11:30:00Z')
      });
    }
    
    if (ankit && policeExam) {
      resultsData.push({
        student_id: ankit._id,
        student_name: ankit.name,
        exam_id: policeExam._id,
        exam_name: policeExam.name,
        exam_type: policeExam.type,
        score: 100,
        total_questions: 2,
        attempted_questions: 2,
        correct_answers: 2,
        wrong_answers: 0,
        time_taken: 1680,
        status: 'completed',
        submitted_at: new Date('2026-03-22T09:58:00Z')
      });
    }

    for (const r of resultsData) {
      await db.collection('results').updateOne(
        { student_id: r.student_id, exam_id: r.exam_id },
        { $setOnInsert: r },
        { upsert: true }
      );
      results.results.push({ student: r.student_name, exam: r.exam_name, score: r.score });
    }

    res.status(200).json({
      message: 'COMPLETE DATABASE SEEDED SUCCESSFULLY!',
      summary: {
        admin: results.admin.length,
        examTypes: results.examTypes.length,
        students: results.students.length,
        exams: results.exams.length,
        questions: results.questions.length,
        results: results.results.length
      },
      details: results
    });

  } catch (error) {
    console.error('Full seed error:', error);
    res.status(500).json({ message: 'Failed to seed database', error: error.message });
  }
}

export default handler;
