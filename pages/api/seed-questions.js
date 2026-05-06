import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Sample of questions from MySQL - top 50 most important ones
const questionsData = [
  // Basic questions (IDs 1-4)
  { id: 1, exam_id: 1, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  { id: 2, exam_id: 2, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  { id: 3, exam_id: 3, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  { id: 4, exam_id: 4, section_name: 'Algebra', question_text: 'What is 2 + 2?' },
  
  // Exam 8 - Physics/Chemistry (IDs 69-73)
  { id: 69, exam_id: 8, section_name: 'Physics', question_text: 'What is the SI unit of force?' },
  { id: 70, exam_id: 8, section_name: 'Chemistry', question_text: 'What is the atomic number of Carbon?' },
  { id: 71, exam_id: 8, section_name: 'Mathematics', question_text: 'What is the derivative of x²?' },
  { id: 72, exam_id: 8, section_name: 'Physics', question_text: 'What is the speed of light?' },
  { id: 73, exam_id: 8, section_name: 'Chemistry', question_text: 'What is the pH of pure water at 25°C?' },
  
  // Exam 9 - General Knowledge (IDs 74-78)
  { id: 74, exam_id: 9, section_name: 'General Knowledge', question_text: 'Who is the current President of India?' },
  { id: 75, exam_id: 9, section_name: 'History', question_text: 'In which year did India gain independence?' },
  { id: 76, exam_id: 9, section_name: 'Geography', question_text: 'What is the capital of France?' },
  { id: 77, exam_id: 9, section_name: 'Mathematics', question_text: 'What is 15% of 200?' },
  { id: 78, exam_id: 9, section_name: 'General Knowledge', question_text: 'How many sides does a hexagon have?' },
  
  // Exam 10 - Physics/Chemistry (IDs 79-83)
  { id: 79, exam_id: 10, section_name: 'Physics', question_text: 'What is the SI unit of force?' },
  { id: 80, exam_id: 10, section_name: 'Chemistry', question_text: 'What is the atomic number of Carbon?' },
  { id: 81, exam_id: 10, section_name: 'Mathematics', question_text: 'What is the derivative of x²?' },
  { id: 82, exam_id: 10, section_name: 'Physics', question_text: 'What is the speed of light?' },
  { id: 83, exam_id: 10, section_name: 'Chemistry', question_text: 'What is the pH of pure water at 25°C?' },
  
  // Exam 11 - General Knowledge (IDs 84-88)
  { id: 84, exam_id: 11, section_name: 'General Knowledge', question_text: 'Who is the current President of India?' },
  { id: 85, exam_id: 11, section_name: 'History', question_text: 'In which year did India gain independence?' },
  { id: 86, exam_id: 11, section_name: 'Geography', question_text: 'What is the capital of France?' },
  { id: 87, exam_id: 11, section_name: 'Mathematics', question_text: 'What is 15% of 200?' },
  { id: 88, exam_id: 11, section_name: 'General Knowledge', question_text: 'How many sides does a hexagon have?' },
  
  // Exam 68 - Sample JEE (IDs 755-762)
  { id: 755, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 1' },
  { id: 756, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 2' },
  { id: 757, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 3' },
  { id: 758, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 4' },
  { id: 759, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 5' },
  { id: 760, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 6' },
  { id: 761, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 7' },
  { id: 762, exam_id: 68, section_name: 'Physics', question_text: 'Sample JEE question 8' },
  
  // Exam 69 (IDs 706-714)
  { id: 706, exam_id: 69, section_name: 'General', question_text: 'Basic question 1' },
  { id: 707, exam_id: 69, section_name: 'General', question_text: 'Basic question 2' },
  { id: 708, exam_id: 69, section_name: 'General', question_text: 'Basic question 3' },
  { id: 709, exam_id: 69, section_name: 'General', question_text: 'Basic question 4' },
  { id: 710, exam_id: 69, section_name: 'General', question_text: 'Basic question 5' },
  { id: 711, exam_id: 69, section_name: 'General', question_text: 'Basic question 6' },
  { id: 712, exam_id: 69, section_name: 'General', question_text: 'Basic question 7' },
  { id: 713, exam_id: 69, section_name: 'General', question_text: 'Basic question 8' },
  { id: 714, exam_id: 69, section_name: 'Mathematics', question_text: '2 + 2 = ?' },
  
  // Exam 70 (IDs 715-719)
  { id: 715, exam_id: 70, section_name: 'General', question_text: 'Question 1' },
  { id: 716, exam_id: 70, section_name: 'General', question_text: 'Question 2' },
  { id: 717, exam_id: 70, section_name: 'General', question_text: 'Question 3' },
  { id: 718, exam_id: 70, section_name: 'General', question_text: 'Question 4' },
  { id: 719, exam_id: 70, section_name: 'General', question_text: 'Question 5' },
  
  // Exam 80 - Maths (IDs 765-778)
  { id: 765, exam_id: 80, section_name: 'B: Maths', question_text: '2 + 2 = ?' },
  { id: 766, exam_id: 80, section_name: 'B: Maths', question_text: '4 x 3 = ?' },
  { id: 767, exam_id: 80, section_name: 'B: Maths', question_text: '12 / 4 = ?' },
  { id: 768, exam_id: 80, section_name: 'B: Maths', question_text: '3 + 6 = ?' },
  { id: 769, exam_id: 80, section_name: 'B: Maths', question_text: '9 x 2 = ?' },
  { id: 770, exam_id: 80, section_name: 'B: Maths', question_text: '18 / 2 = ?' },
  { id: 771, exam_id: 80, section_name: 'B: Maths', question_text: '9 x 6 = ?' },
  { id: 772, exam_id: 80, section_name: 'B: Maths', question_text: '54 - 8 = ?' },
  { id: 773, exam_id: 80, section_name: 'B: Maths', question_text: '46 + 9 = ?' },
  { id: 774, exam_id: 80, section_name: 'B: Maths', question_text: '55 x 4 = ?' },
  { id: 775, exam_id: 80, section_name: 'B: Maths', question_text: '220 / 5 = ?' },
  { id: 776, exam_id: 80, section_name: 'B: Maths', question_text: '44 + 9 = ?' }
];

// Options for questions
const optionsData = {
  // Options for basic questions (2+2)
  1: [
    { option_text: '3', is_correct: false },
    { option_text: '4', is_correct: true },
    { option_text: '5', is_correct: false },
    { option_text: '6', is_correct: false }
  ],
  2: [
    { option_text: '3', is_correct: false },
    { option_text: '4', is_correct: true },
    { option_text: '5', is_correct: false },
    { option_text: '6', is_correct: false }
  ],
  3: [
    { option_text: '3', is_correct: false },
    { option_text: '4', is_correct: true },
    { option_text: '5', is_correct: false },
    { option_text: '6', is_correct: false }
  ],
  4: [
    { option_text: '3', is_correct: false },
    { option_text: '4', is_correct: true },
    { option_text: '5', is_correct: false },
    { option_text: '6', is_correct: false }
  ],
  
  // Physics - SI unit of force
  69: [
    { option_text: 'Joule', is_correct: false },
    { option_text: 'Watt', is_correct: false },
    { option_text: 'Newton', is_correct: true },
    { option_text: 'Pascal', is_correct: false }
  ],
  // Chemistry - Atomic number of Carbon
  70: [
    { option_text: '5', is_correct: false },
    { option_text: '6', is_correct: true },
    { option_text: '7', is_correct: false },
    { option_text: '8', is_correct: false }
  ],
  // Mathematics - derivative of x²
  71: [
    { option_text: 'x', is_correct: false },
    { option_text: '2x', is_correct: true },
    { option_text: 'x²', is_correct: false },
    { option_text: '2', is_correct: false }
  ],
  // Physics - speed of light
  72: [
    { option_text: '3 × 10^6 m/s', is_correct: false },
    { option_text: '3 × 10^8 m/s', is_correct: true },
    { option_text: '3 × 10^10 m/s', is_correct: false },
    { option_text: '3 × 10^4 m/s', is_correct: false }
  ],
  // Chemistry - pH of pure water
  73: [
    { option_text: '6', is_correct: false },
    { option_text: '7', is_correct: true },
    { option_text: '8', is_correct: false },
    { option_text: '9', is_correct: false }
  ],
  
  // General Knowledge - President of India
  74: [
    { option_text: 'Narendra Modi', is_correct: false },
    { option_text: 'Droupadi Murmu', is_correct: true },
    { option_text: 'Ram Nath Kovind', is_correct: false },
    { option_text: 'Amit Shah', is_correct: false }
  ],
  // History - Independence year
  75: [
    { option_text: '1945', is_correct: false },
    { option_text: '1946', is_correct: false },
    { option_text: '1947', is_correct: true },
    { option_text: '1948', is_correct: false }
  ],
  // Geography - Capital of France
  76: [
    { option_text: 'London', is_correct: false },
    { option_text: 'Berlin', is_correct: false },
    { option_text: 'Paris', is_correct: true },
    { option_text: 'Madrid', is_correct: false }
  ],
  // Mathematics - 15% of 200
  77: [
    { option_text: '25', is_correct: false },
    { option_text: '30', is_correct: true },
    { option_text: '35', is_correct: false },
    { option_text: '40', is_correct: false }
  ],
  // General Knowledge - hexagon sides
  78: [
    { option_text: '5', is_correct: false },
    { option_text: '6', is_correct: true },
    { option_text: '7', is_correct: false },
    { option_text: '8', is_correct: false }
  ],
  
  // Exam 80 Maths questions
  765: [
    { option_text: '3', is_correct: false },
    { option_text: '4', is_correct: true },
    { option_text: '5', is_correct: false },
    { option_text: '6', is_correct: false }
  ],
  766: [
    { option_text: '10', is_correct: false },
    { option_text: '11', is_correct: false },
    { option_text: '12', is_correct: true },
    { option_text: '13', is_correct: false }
  ],
  767: [
    { option_text: '2', is_correct: false },
    { option_text: '3', is_correct: true },
    { option_text: '4', is_correct: false },
    { option_text: '5', is_correct: false }
  ],
  768: [
    { option_text: '8', is_correct: false },
    { option_text: '9', is_correct: true },
    { option_text: '10', is_correct: false },
    { option_text: '11', is_correct: false }
  ],
  769: [
    { option_text: '16', is_correct: false },
    { option_text: '17', is_correct: false },
    { option_text: '18', is_correct: true },
    { option_text: '19', is_correct: false }
  ],
  770: [
    { option_text: '7', is_correct: false },
    { option_text: '8', is_correct: false },
    { option_text: '9', is_correct: true },
    { option_text: '10', is_correct: false }
  ],
  771: [
    { option_text: '52', is_correct: false },
    { option_text: '53', is_correct: false },
    { option_text: '54', is_correct: true },
    { option_text: '55', is_correct: false }
  ],
  772: [
    { option_text: '44', is_correct: false },
    { option_text: '45', is_correct: false },
    { option_text: '46', is_correct: true },
    { option_text: '47', is_correct: false }
  ],
  773: [
    { option_text: '53', is_correct: false },
    { option_text: '54', is_correct: false },
    { option_text: '55', is_correct: true },
    { option_text: '56', is_correct: false }
  ],
  774: [
    { option_text: '218', is_correct: false },
    { option_text: '219', is_correct: false },
    { option_text: '220', is_correct: true },
    { option_text: '221', is_correct: false }
  ],
  775: [
    { option_text: '42', is_correct: false },
    { option_text: '43', is_correct: false },
    { option_text: '44', is_correct: true },
    { option_text: '45', is_correct: false }
  ],
  776: [
    { option_text: '51', is_correct: false },
    { option_text: '52', is_correct: false },
    { option_text: '53', is_correct: true },
    { option_text: '54', is_correct: false }
  ]
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST to seed questions' });
  }

  try {
    const { db } = await connectToDatabase();
    
    let questionsInserted = 0;
    let optionsInserted = 0;
    let examsUpdated = [];

    // Group questions by exam_id
    const questionsByExam = {};
    for (const q of questionsData) {
      if (!questionsByExam[q.exam_id]) {
        questionsByExam[q.exam_id] = [];
      }
      questionsByExam[q.exam_id].push(q);
    }

    // Process each exam
    for (const [examId, questions] of Object.entries(questionsByExam)) {
      // Find or create exam
      let exam = await db.collection('exams').findOne({ 
        $or: [
          { mysql_id: parseInt(examId) },
          { id: parseInt(examId) }
        ]
      });

      // If exam doesn't exist, create a placeholder
      if (!exam) {
        const examResult = await db.collection('exams').insertOne({
          mysql_id: parseInt(examId),
          name: `Exam ${examId}`,
          type: 'General',
          batch: '2024',
          duration: 60,
          scheduled_time: new Date(),
          total_questions: 0,
          created_at: new Date()
        });
        exam = { _id: examResult.insertedId };
        examsUpdated.push(`Created Exam ${examId}`);
      }

      const examObjectId = exam._id;
      let examQuestionCount = 0;

      // Add questions for this exam
      for (const q of questions) {
        // Check if question already exists
        const existingQuestion = await db.collection('questions').findOne({
          mysql_id: q.id,
          exam_id: examObjectId
        });

        if (!existingQuestion) {
          // Insert question
          const questionResult = await db.collection('questions').insertOne({
            mysql_id: q.id,
            exam_id: examObjectId,
            section_name: q.section_name || 'General',
            question_text: q.question_text,
            section: q.section_name || 'General',
            question: q.question_text,
            created_at: new Date()
          });

          const questionId = questionResult.insertedId;
          questionsInserted++;

          // Add options if available
          const options = optionsData[q.id];
          if (options) {
            for (const opt of options) {
              await db.collection('options').insertOne({
                question_id: questionId,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                created_at: new Date()
              });
              optionsInserted++;
            }
          } else {
            // Add default options if none defined
            const defaultOptions = [
              { text: 'Option A', correct: false },
              { text: 'Option B', correct: false },
              { text: 'Option C', correct: true },
              { text: 'Option D', correct: false }
            ];
            for (const opt of defaultOptions) {
              await db.collection('options').insertOne({
                question_id: questionId,
                option_text: opt.text,
                is_correct: opt.correct,
                created_at: new Date()
              });
              optionsInserted++;
            }
          }

          examQuestionCount++;
        }
      }

      // Update exam question count
      if (examQuestionCount > 0) {
        await db.collection('exams').updateOne(
          { _id: examObjectId },
          { $inc: { total_questions: examQuestionCount } }
        );
      }
    }

    res.status(200).json({
      message: 'Questions migrated successfully!',
      summary: {
        questionsInserted,
        optionsInserted,
        examsUpdated: examsUpdated.length > 0 ? examsUpdated : ['Used existing exams']
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed questions', error: error.message });
  }
}

export default handler;
