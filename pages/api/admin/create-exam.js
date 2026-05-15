import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, type, batch, duration, scheduled_time, questions } = req.body;

  if (!name || !type || !batch || !duration || !scheduled_time) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  try {
    const { db } = await connectToDatabase();

    const result = await db.collection('exams').insertOne({
      name,
      type,
      batch,
      duration: parseInt(duration, 10),
      scheduled_time: new Date(scheduled_time),
      total_questions: 0,
      created_at: new Date()
    });

    const examId = result.insertedId;

    // Add questions if provided
    let inserted = 0;
    console.log('Questions received:', JSON.stringify(questions));
    if (Array.isArray(questions)) {
      for (const [idx, q] of questions.entries()) {
        console.log(`Question ${idx}:`, JSON.stringify(q));
        if (!q.question_text || !Array.isArray(q.options) || q.options.length !== 4) {
          console.log(`Skipping question ${idx} - invalid format`);
          continue;
        }

        const questionResult = await db.collection('questions').insertOne({
          exam_id: examId,
          section_name: q.section || null,
          question_text: q.question_text.trim(),
          created_at: new Date()
        });

        const questionId = questionResult.insertedId;

        for (let i = 0; i < q.options.length; i++) {
          const optText = q.options[i]?.trim();
          if (!optText) {
            console.log(`Skipping empty option ${i} for question ${idx}`);
            continue;
          }
          await db.collection('options').insertOne({
            question_id: questionId,
            option_text: optText,
            is_correct: parseInt(q.correctOption, 10) === i,
            created_at: new Date()
          });
        }
        inserted++;
      }
    }
    console.log(`Total questions inserted: ${inserted}`);

    // Update exam with question count
    await db.collection('exams').updateOne(
      { _id: examId },
      { $set: { total_questions: inserted } }
    );

    res.status(200).json({
      message: 'Exam created successfully',
      exam_id: examId,
      total_questions: inserted
    });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default requireAdmin(handler);
