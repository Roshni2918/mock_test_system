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

    // Validate all questions BEFORE inserting anything
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }
    for (const [idx, q] of questions.entries()) {
      if (!q.question_text || !q.question_text.trim()) {
        return res.status(400).json({ message: `Question ${idx + 1} text is required` });
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return res.status(400).json({ message: `Question ${idx + 1} must have exactly 4 options` });
      }
      for (let i = 0; i < q.options.length; i++) {
        if (!q.options[i] || !q.options[i].trim()) {
          return res.status(400).json({ message: `Question ${idx + 1}, Option ${i + 1} cannot be empty` });
        }
      }
    }

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

    // Add questions
    let inserted = 0;
    for (const q of questions) {
      const questionResult = await db.collection('questions').insertOne({
        exam_id: examId,
        section_name: q.section || null,
        question_text: q.question_text.trim(),
        created_at: new Date()
      });

      const questionId = questionResult.insertedId;

      for (let i = 0; i < q.options.length; i++) {
        await db.collection('options').insertOne({
          question_id: questionId,
          option_text: q.options[i].trim(),
          is_correct: parseInt(q.correctOption, 10) === i,
          created_at: new Date()
        });
      }
      inserted++;
    }

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
    // If exam was created but something went wrong, delete it to avoid orphan
    if (examId) {
      await db.collection('exams').deleteOne({ _id: examId }).catch(() => {});
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export default requireAdmin(handler);
