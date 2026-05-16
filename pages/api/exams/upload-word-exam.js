import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';
import multer from 'multer';
import mammoth from 'mammoth';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

function universalParse(content) {
  // Split at answer key header (may have number prefix like "35 (Ans Key)")
  const ansKeyPattern = /^[\s]*(?:\d+\s*[.)(\s]\s*)?(?:answer\s*(?:key|sheet)|ans\s*(?:key|sheet)|उत्तर\s*(?:सूची|कुंजी|माला)|solution\s*(?:key|sheet)?|key)[:\s]*$/im;
  const m = content.match(ansKeyPattern);
  const splitIndex = m ? m.index : content.length;
  const questionsPart = content.substring(0, splitIndex).trim();
  const answerKeyPart = content.substring(splitIndex).trim();

  // Parse answer key: tabular "Q.No \t Answer" format or "Q.No Answer" lines
  const answerMap = {};
  if (answerKeyPart) {
    const akLines = answerKeyPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let inTable = false;
    for (const line of akLines) {
      // Detect table header
      if (/question\s*no/i.test(line) || /q\.?\s*no/i.test(line)) { inTable = true; continue; }
      if (!inTable) continue;
      // Match: number <separator> number (tab/space)
      const rowMatch = line.match(/^(\d+)\s+(\d+)$/);
      if (rowMatch) {
        answerMap[parseInt(rowMatch[1])] = rowMatch[2]; // store as option number string
      }
    }
    // Also try single-line answer format: "1=A, 2=B, 3=C" or "1-A,2-B"
    if (Object.keys(answerMap).length === 0) {
      for (const line of akLines) {
        const inlineMatch = line.match(/(\d+)\s*[=:.)\]\-\s]\s*([A-Da-d1-4])/);
        if (inlineMatch) {
          answerMap[parseInt(inlineMatch[1])] = inlineMatch[2].toUpperCase();
        }
      }
    }
  }

  const lines = questionsPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const sections = [];
  let currentSection = { name: 'General', questions: [] };
  sections.push(currentSection);
  let currentQuestion = null;
  let headerMode = true; // skip header lines until first numbered question

  // Map option number (1-4) to letter (A-D)
  const numToLetter = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };

  for (const line of lines) {
    // Section header
    if (/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]/i.test(line)) {
      if (currentQuestion && currentQuestion.options.length > 0) {
        currentSection.questions.push(currentQuestion);
      }
      currentQuestion = null;
      currentSection = { name: line.replace(/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]*/i, '').trim(), questions: [] };
      sections.push(currentSection);
      continue;
    }

    // Option line: 1) text, 2) text or A) text, B) text
    const optMatch = line.match(/^\(?([1-4A-Da-d])\)?[\.\)\s]+\s*(.+)/);
    if (optMatch && currentQuestion && currentQuestion.options.length < 4) {
      const raw = optMatch[1].toUpperCase();
      const letter = numToLetter[raw] || raw;
      currentQuestion.options.push({ letter, text: optMatch[2] });
      continue;
    }

    // Single answer line for current question: Answer: X or Ans: X
    const ansMatch = line.match(/^(?:answer|ans|correct|key|right|उत्तर)\s*[:=]?\s*\(?([A-Da-d1-4])\)?/i);
    if (ansMatch && currentQuestion) {
      currentQuestion.answer = numToLetter[ansMatch[1].toUpperCase()] || ansMatch[1].toUpperCase();
      continue;
    }

    // Line starting with option-like pattern but without current question — ignore
    if (/^[1-4][\.\)\s]/.test(line) && !currentQuestion) continue;

    // Question line: number followed by separator (., ), ], space, tab) then text
    const qMatch = line.match(/^\(?(\d+)\)?[\.\)\]\s\t]+\s*(.+)/);
    if (qMatch) {
      headerMode = false;
      if (currentQuestion && currentQuestion.options.length > 0) {
        currentSection.questions.push(currentQuestion);
      }
      currentQuestion = {
        number: parseInt(qMatch[1]),
        text: qMatch[2],
        options: [],
        answer: answerMap[parseInt(qMatch[1])] ? numToLetter[answerMap[parseInt(qMatch[1])]] || answerMap[parseInt(qMatch[1])] : null
      };
      continue;
    }

    // Catch-all for long lines (first question or continuation)
    if (!currentQuestion && line.length > 10) {
      headerMode = false;
      const qNum = sections.reduce((s, sec) => s + sec.questions.length, 0) + 1;
      currentQuestion = { number: qNum, text: line, options: [], answer: answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null };
      continue;
    }

    // Continuation of question text (before any options were found)
    if (currentQuestion && currentQuestion.options.length === 0) {
      currentQuestion.text += ' ' + line;
    }
  }

  // Flush last question
  if (currentQuestion && currentQuestion.options.length > 0) {
    currentSection.questions.push(currentQuestion);
  }

  // If no questions were parsed, try paragraph-based fallback
  if (sections.every(s => s.questions.length === 0)) {
    const paragraphs = questionsPart.split(/\n\s*\n/).filter(p => p.trim().length > 15);
    const sec = { name: 'General', questions: [] };
    const result = [];
    for (const para of paragraphs) {
      const pLines = para.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (pLines.length < 2) continue;
      const opts = [];
      let qText = '';
      let ans = '';
      for (const pl of pLines) {
        const o = pl.match(/^\(?([1-4A-Da-d])\)?[\.\)\s]+\s*(.+)/);
        if (o) {
          const raw = o[1].toUpperCase();
          opts.push({ letter: numToLetter[raw] || raw, text: o[2] });
          continue;
        }
        const a = pl.match(/^(?:answer|ans|correct|उत्तर)[\s:=]+\(?([A-Da-d1-4])\)?/i);
        if (a) { ans = numToLetter[a[1].toUpperCase()] || a[1].toUpperCase(); continue; }
        qText += (qText ? ' ' : '') + pl;
      }
      if (qText && opts.length >= 2) {
        const qNum = result.length + 1;
        const matchedAnswer = ans || (answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null);
        sec.questions.push({ number: qNum, text: qText.replace(/^\d+[\.\)\]\s\t]+\s*/, '').trim(), options: opts, answer: matchedAnswer || 'A' });
      }
    }
    if (sec.questions.length > 0) result.push(sec);
    return result.length > 0 ? result : [{ name: 'General', questions: [] }];
  }

  return sections;
}

async function handler(req, res) {
  try {
    await runMiddleware(req, res, upload.single('examFile'));
    const file = req.file;

    const { name, type, batch, duration, scheduled_date, questions } = req.body;
    if (!name || !type || !batch || !duration || !scheduled_date) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const { db } = await connectToDatabase();

    // If pre-parsed questions provided, use them directly (matches preview exactly)
    let sections;
    if (questions) {
      try {
        sections = JSON.parse(questions);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid questions format' });
      }
    } else if (file) {
      // Fallback: parse from file (no preview path)
      let content = '';
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        content = result.value || '';
      } catch (e) {
        content = file.buffer.toString('utf8');
      }
      sections = universalParse(content);
    } else {
      return res.status(400).json({ message: 'No file uploaded or questions provided' });
    }

    // Count total questions to save
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
    if (totalQuestions === 0) {
      return res.status(400).json({
        message: 'No questions found in the uploaded file. Please check the file format.'
      });
    }

    const examResult = await db.collection('exams').insertOne({
      name, type, batch, duration: parseInt(duration, 10),
      scheduled_time: new Date(scheduled_date),
      total_questions: 0, created_at: new Date()
    });

    const examId = examResult.insertedId;

    try {
      let inserted = 0;
      for (const section of sections) {
        for (const q of section.questions) {
          if (!q.text) continue;

          const qr = await db.collection('questions').insertOne({
            exam_id: examId, section_name: section.name,
            question_text: q.text, section: section.name, question: q.text,
            created_at: new Date()
          });

          const questionId = qr.insertedId;

          for (const opt of q.options || []) {
            if (opt && opt.text) {
              await db.collection('options').insertOne({
                question_id: questionId, option_text: opt.text,
                is_correct: q.answer === opt.letter,
                created_at: new Date()
              });
            }
          }
          inserted++;
        }
      }

      await db.collection('exams').updateOne(
        { _id: examId },
        { $set: { total_questions: inserted } }
      );

      res.status(200).json({
        message: 'Exam uploaded successfully',
        exam_id: examId,
        total_questions: inserted,
        sections: sections.map(s => ({ name: s.name, questionCount: s.questions.length }))
      });
    } catch (insertError) {
      await db.collection('exams').deleteOne({ _id: examId }).catch(() => {});
      throw insertError;
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload exam', error: error.message });
  }
}

export default requireAdmin(handler);
