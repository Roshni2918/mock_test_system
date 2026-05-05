const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Roshni:Roshni123@cluster0.8sepz3g.mongodb.net/examDB?retryWrites=true&w=majority';

async function addSampleData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('examDB');

    // 1. Add Sample Students
    const studentsData = [
      { name: 'Roshni Pawar', batch: '2026', exam_type: 'JEE', roll_no: '1001' },
      { name: 'Mangesh Sonawane', batch: '2026', exam_type: 'NEET', roll_no: '1002' },
      { name: 'Priya Sharma', batch: '2026', exam_type: 'JEE', roll_no: '1003' },
      { name: 'Amit Kumar', batch: '2026', exam_type: 'UPSC', roll_no: '1004' },
      { name: 'Sneha Patil', batch: '2026', exam_type: 'NDA', roll_no: '1005' },
      { name: 'Rahul Desai', batch: '2026', exam_type: 'JEE', roll_no: '1006' },
      { name: 'Anjali Gupta', batch: '2026', exam_type: 'NEET', roll_no: '1007' },
      { name: 'Vikram Singh', batch: '2026', exam_type: 'Mock Test', roll_no: '1008' }
    ];

    const hashedPassword = await bcrypt.hash('student123', 10);

    for (const student of studentsData) {
      const firstName = student.name.split(' ')[0].toLowerCase();
      const email = `${firstName}${student.roll_no}@vijeta.com`;

      await db.collection('users').updateOne(
        { email: email },
        {
          $setOnInsert: {
            name: student.name,
            email: email,
            password: hashedPassword,
            role: 'student',
            batch: student.batch,
            exam_type: student.exam_type,
            roll_no: student.roll_no,
            mobile_no: '9876543210',
            admission_year: '2024',
            created_at: new Date()
          }
        },
        { upsert: true }
      );
      console.log(`Student added: ${student.name} (${email})`);
    }

    // 2. Add Sample Exams
    const examsData = [
      {
        name: 'JEE Main Mock Test 1',
        type: 'JEE',
        batch: '2026',
        duration: 180,
        total_questions: 90,
        scheduled_time: new Date('2024-12-15T10:00:00Z')
      },
      {
        name: 'NEET Biology Test',
        type: 'NEET',
        batch: '2026',
        duration: 180,
        total_questions: 180,
        scheduled_time: new Date('2024-12-16T10:00:00Z')
      },
      {
        name: 'UPSC Prelims Practice',
        type: 'UPSC',
        batch: '2026',
        duration: 120,
        total_questions: 100,
        scheduled_time: new Date('2024-12-17T10:00:00Z')
      },
      {
        name: 'NDA Mathematics Test',
        type: 'NDA',
        batch: '2026',
        duration: 150,
        total_questions: 120,
        scheduled_time: new Date('2024-12-18T10:00:00Z')
      },
      {
        name: 'JEE Advanced Practice',
        type: 'JEE',
        batch: '2026',
        duration: 180,
        total_questions: 54,
        scheduled_time: new Date('2024-12-19T10:00:00Z')
      }
    ];

    const examIds = [];
    for (const exam of examsData) {
      const result = await db.collection('exams').updateOne(
        { name: exam.name },
        { $setOnInsert: { ...exam, created_at: new Date() } },
        { upsert: true }
      );
      if (result.upsertedId) {
        examIds.push(result.upsertedId);
        console.log(`Exam added: ${exam.name}`);
      }
    }

    // 3. Add Sample Questions to First Exam
    if (examIds.length > 0) {
      const firstExamId = examIds[0];
      const questionsData = [
        {
          exam_id: firstExamId,
          section_name: 'Physics',
          question_text: 'What is the unit of force?',
          section: 'Physics',
          created_at: new Date()
        },
        {
          exam_id: firstExamId,
          section_name: 'Physics',
          question_text: 'What is the speed of light?',
          section: 'Physics',
          created_at: new Date()
        },
        {
          exam_id: firstExamId,
          section_name: 'Chemistry',
          question_text: 'What is the chemical formula of water?',
          section: 'Chemistry',
          created_at: new Date()
        }
      ];

      for (const question of questionsData) {
        await db.collection('questions').insertOne(question);
      }
      console.log('Sample questions added');
    }

    // 4. Add Sample Results
    const jeeStudents = await db.collection('users').find({ role: 'student', exam_type: 'JEE' }).toArray();
    const jeeExam = await db.collection('exams').findOne({ type: 'JEE' });

    if (jeeStudents.length > 0 && jeeExam) {
      for (let i = 0; i < Math.min(3, jeeStudents.length); i++) {
        const student = jeeStudents[i];
        const score = Math.floor(Math.random() * 40) + 60; // Random score 60-100

        await db.collection('results').updateOne(
          { student_id: student._id, exam_id: jeeExam._id },
          {
            $setOnInsert: {
              student_id: student._id,
              exam_id: jeeExam._id,
              student_name: student.name,
              exam_name: jeeExam.name,
              exam_type: jeeExam.type,
              score: score,
              total_questions: jeeExam.total_questions,
              attempted_questions: Math.floor(jeeExam.total_questions * 0.8),
              correct_answers: Math.floor(score * jeeExam.total_questions / 100),
              time_taken: jeeExam.duration * 60 * 0.85, // 85% of time used
              status: 'completed',
              submitted_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
            }
          },
          { upsert: true }
        );
        console.log(`Result added for: ${student.name} - Score: ${score}`);
      }
    }

    console.log('\n✅ Sample data added successfully!');
    console.log('Students: 8 added');
    console.log('Exams: 5 added');
    console.log('Results: 3 added');

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await client.close();
  }
}

addSampleData();
