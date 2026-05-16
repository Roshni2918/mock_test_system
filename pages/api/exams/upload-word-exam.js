import { connectToDatabase } from '../../../lib/mongodb';
import { requireAdmin } from '../../../lib/auth';
import multer from 'multer';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

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

function extractImagesFromDocx(buffer) {
  return new Promise((resolve) => {
    const images = [];
    mammoth.convertToHtml({
      buffer,
      convertImage: mammoth.images.imgElement((image) => {
        return image.read().then((imageBuffer) => {
          images.push({ buffer: imageBuffer, contentType: image.contentType });
          return {};
        }).catch(() => {});
      })
    }).then(() => resolve(images)).catch(() => resolve(images));
  });
}

async function ocrImages(images) {
  const texts = [];
  if (images.length === 0) return texts;

  try {
    const worker = await createWorker('eng');
    for (const img of images) {
      try {
        const { data } = await worker.recognize(img.buffer);
        if (data.text && data.text.trim().length > 3) {
          texts.push(data.text.trim());
        }
      } catch (e) {
        console.log('OCR failed for one image:', e.message);
      }
    }
    await worker.terminate();
  } catch (e) {
    console.log('OCR worker init failed:', e.message);
  }
  return texts;
}

function universalParse(content) {
  const lines = content.split('\n').map(l => l.trim());
  const sections = [];
  let currentSection = { name: 'General', questions: [] };
  sections.push(currentSection);
  let currentQuestion = null;

  for (const line of lines) {
    if (!line || line.length < 2) {
      if (currentQuestion && currentQuestion.options.length > 0) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      continue;
    }

    if (/^(section|topic|chapter|unit|part|subject)\s*[-:]/i.test(line)) {
      if (currentQuestion && currentQuestion.options.length > 0) {
        currentSection.questions.push(currentQuestion);
      }
      currentQuestion = null;
      currentSection = { name: line.replace(/^(section|topic|chapter|unit|part|subject)\s*[-:]\s*/i, '').trim(), questions: [] };
      sections.push(currentSection);
      continue;
    }

    const ansMatch = line.match(/^(?:answer|ans|correct|solution|key|right)\s*[:=]?\s*\(?([A-Da-d1-4])\)?/i);
    if (ansMatch && currentQuestion) {
      currentQuestion.answer = ansMatch[1].toUpperCase();
      continue;
    }

    const optMatch = line.match(/^\(?([A-Da-d1-4])\)?[\.\)\s]+\s*(.+)/);
    if (optMatch && currentQuestion) {
      const letterMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D' };
      const letter = letterMap[optMatch[1].toUpperCase()] || optMatch[1].toUpperCase();
      currentQuestion.options.push({ letter, text: optMatch[2] });
      continue;
    }

    if (currentQuestion && currentQuestion.options.length > 0 && /^[A-Da-d1-4][\.\)\s]/i.test(line)) {
      continue;
    }

    const qMatch = line.match(/^\(?(\d+)\)?[\.\)]\s*(.+)/);
    if (qMatch) {
      if (currentQuestion && currentQuestion.options.length > 0) {
        currentSection.questions.push(currentQuestion);
      }
      currentQuestion = { number: parseInt(qMatch[1]), text: qMatch[2], options: [] };
      continue;
    }

    if (!currentQuestion && line.length > 10) {
      currentQuestion = { number: sections.reduce((s, sec) => s + sec.questions.length, 0) + 1, text: line, options: [] };
      continue;
    }

    if (currentQuestion && currentQuestion.options.length === 0) {
      currentQuestion.text += ' ' + line;
    }
  }

  if (currentQuestion && currentQuestion.options.length > 0) {
    currentSection.questions.push(currentQuestion);
  }

  if (sections.every(s => s.questions.length === 0)) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 15);
    const sec = { name: 'General', questions: [] };
    const result = [];
    for (const para of paragraphs) {
      const pLines = para.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (pLines.length < 2) continue;
      const opts = [];
      let qText = '';
      let ans = '';
      for (const pl of pLines) {
        const o = pl.match(/^\(?([A-Da-d1-4])\)?[\.\)\s]+\s*(.+)/);
        if (o) { opts.push({ letter: o[1].toUpperCase().replace(/[^A-D]/g,'') || 'A', text: o[2] }); continue; }
        const a = pl.match(/^(?:answer|ans|correct)[\s:=]+\(?([A-Da-d1-4])\)?/i);
        if (a) { ans = a[1].toUpperCase(); continue; }
        qText += (qText ? ' ' : '') + pl;
      }
      if (qText && opts.length >= 2) {
        sec.questions.push({ number: result.length + 1, text: qText.replace(/^\d+[\.\)]\s*/, '').trim(), options: opts, answer: ans || 'A' });
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
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const { name, type, batch, duration, scheduled_date } = req.body;
    if (!name || !type || !batch || !duration || !scheduled_date) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const { db } = await connectToDatabase();

    let content = '';
    let ocrTexts = [];

    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      content = result.value || '';
      console.log('Mammoth text length:', content.length);
      console.log('First 500 chars:', content.substring(0, 500));
    } catch (e) {
      console.log('mammoth extractRawText failed:', e.message);
      content = file.buffer.toString('utf8');
    }

    try {
      const images = await extractImagesFromDocx(file.buffer);
      console.log('Images extracted:', images.length);
      if (images.length > 0) {
        ocrTexts = await ocrImages(images);
        console.log('OCR texts extracted:', ocrTexts.length);
        if (ocrTexts.length > 0) {
          content += '\n\n' + ocrTexts.join('\n\n');
        }
      }
    } catch (e) {
      console.log('Image extraction/OCR failed:', e.message);
    }

    console.log('Total content length before parsing:', content.length);
    const sections = universalParse(content);
    console.log('Parsed sections:', sections.length);
    console.log('Total questions found:', sections.reduce((sum, s) => sum + s.questions.length, 0));
    
    if (sections.reduce((sum, s) => sum + s.questions.length, 0) === 0) {
      console.log('NO QUESTIONS FOUND - Content sample:', content.substring(0, 1000));
    }

    const examResult = await db.collection('exams').insertOne({
      name, type, batch, duration: parseInt(duration, 10),
      scheduled_time: new Date(scheduled_date),
      total_questions: 0, created_at: new Date()
    });

    const examId = examResult.insertedId;
    let totalQuestions = 0;

    for (const section of sections) {
      for (const q of section.questions) {
        if (!q.text || q.options.length < 2) continue;

        await db.collection('questions').insertOne({
          exam_id: examId, section_name: section.name,
          question_text: q.text, section: section.name, question: q.text,
          created_at: new Date()
        }).then(async (qr) => {
          const questionId = qr.insertedId;
          for (const opt of q.options) {
            if (opt.text) {
              await db.collection('options').insertOne({
                question_id: questionId, option_text: opt.text,
                is_correct: q.answer === opt.letter,
                created_at: new Date()
              });
            }
          }
        });
        totalQuestions++;
      }
    }

    console.log('Total questions inserted:', totalQuestions);

    await db.collection('exams').updateOne(
      { _id: examId },
      { $set: { total_questions: totalQuestions } }
    );

    res.status(200).json({
      message: 'Exam uploaded successfully',
      exam_id: examId,
      total_questions: totalQuestions,
      sections: sections.map(s => ({ name: s.name, questionCount: s.questions.length })),
      ocr_extracted: ocrTexts.length > 0
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload exam', error: error.message });
  }
}

export default requireAdmin(handler);
