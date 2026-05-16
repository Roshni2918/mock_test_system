import { connectToDatabase } from '../../../../../lib/mongodb';
import { requireAdmin } from '../../../../../lib/auth';
import { ObjectId } from 'mongodb';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const { db } = await connectToDatabase();

    // Get the student exam result
    const studentExam = await db.collection('student_exams').findOne({
      _id: new ObjectId(id)
    });

    if (!studentExam) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Get student details
    const student = await db.collection('users').findOne({
      _id: studentExam.student_id
    });

    // Get exam details
    const exam = await db.collection('exams').findOne({
      _id: studentExam.exam_id
    });

    // Get questions with options
    const questions = await db.collection('questions')
      .find({ exam_id: studentExam.exam_id })
      .toArray();

    const questionIds = questions.map(q => q._id.toString());
    const options = await db.collection('options')
      .find({ question_id: { $in: questionIds.map(id => new ObjectId(id)) } })
      .toArray();

    // Group options by question
    const optionsByQuestion = {};
    options.forEach(opt => {
      const qId = opt.question_id.toString();
      if (!optionsByQuestion[qId]) optionsByQuestion[qId] = [];
      optionsByQuestion[qId].push({ id: opt._id, text: opt.option_text, is_correct: opt.is_correct });
    });

    // Build question details with student answers
    const questionDetails = questions.map(q => {
      const studentAnswer = studentExam.answers?.find(a => a.question_id.toString() === q._id.toString());
      const questionOptions = optionsByQuestion[q._id.toString()] || [];
      
      // Find correct option
      const correctOption = questionOptions.find(o => o.is_correct);
      
      // Find selected option
      let selectedOption = null;
      if (studentAnswer) {
        selectedOption = questionOptions.find(o => o.id.toString() === studentAnswer.option_id.toString());
      }

      return {
        question_id: q._id,
        question_text: q.question_text || q.question,
        options: questionOptions.map((opt, idx) => ({
          id: opt.id,
          text: opt.text,
          label: String.fromCharCode(65 + idx), // A, B, C, D
          is_correct: opt.is_correct,
          is_selected: selectedOption && selectedOption.id.toString() === opt.id.toString()
        })),
        is_attempted: !!studentAnswer,
        selected_option_label: selectedOption ? String.fromCharCode(65 + questionOptions.indexOf(selectedOption)) : null,
        selected_option_text: selectedOption ? selectedOption.text : null,
        correct_option_label: correctOption ? String.fromCharCode(65 + questionOptions.indexOf(correctOption)) : null,
        correct_option_text: correctOption ? correctOption.text : null,
        marks_obtained: studentAnswer && correctOption && selectedOption && selectedOption.id.toString() === correctOption.id.toString() ? 1 : 0,
        status: studentAnswer && correctOption && selectedOption && selectedOption.id.toString() === correctOption.id.toString() ? 'correct' : studentAnswer ? 'wrong' : 'unattempted'
      };
    });

    // Calculate summary
    const totalQuestions = questionDetails.length;
    const attemptedQuestions = questionDetails.filter(q => q.is_attempted).length;
    const unattemptedQuestions = totalQuestions - attemptedQuestions;
    const correctAnswers = questionDetails.filter(q => q.status === 'correct').length;
    const wrongAnswers = questionDetails.filter(q => q.status === 'wrong').length;

    res.status(200).json({
      result: {
        student_name: student?.name || 'Unknown',
        student_email: student?.email || 'Unknown',
        exam_name: exam?.name || 'Unknown',
        exam_type: exam?.type || 'Unknown',
        exam_batch: exam?.batch || 'Unknown',
        score: studentExam.score,
        submitted_at: studentExam.submitted_at
      },
      summary: {
        total_questions: totalQuestions,
        attempted_questions: attemptedQuestions,
        unattempted_questions: unattemptedQuestions,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers
      },
      questions: questionDetails
    });
  } catch (error) {
    console.error('Error fetching result details:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requireAdmin(handler);

export const config = {
  api: {
    externalResolver: true,
  },
};
