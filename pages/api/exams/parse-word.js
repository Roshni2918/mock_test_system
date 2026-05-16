import multer from 'multer';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { requireAdmin } from '../../../lib/auth';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: { bodyParser: false },
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
      } catch (e) { /* skip failed OCR */ }
    }
    await worker.terminate();
  } catch (e) { /* skip */ }
  return texts;
}

function universalParse(content) {
  // Only split at line-starting "ANSWER KEY" or similar headers
  const ansKeyPattern = /^[\s]*(?:answer\s*(?:key|sheet)|ans\s*(?:key|sheet)|उत्तर\s*(?:सूची|कुंजी)|solution\s*(?:key|sheet)?)[:\s]*$/im;
  const m = content.match(ansKeyPattern);
  const splitIndex = m ? m.index : content.length;
  const questionsPart = content.substring(0, splitIndex).trim();
  const answerKeyPart = content.substring(splitIndex).trim();

  const answerMap = {};
  if (answerKeyPart) {
    const akLines = answerKeyPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let inTable = false;
    for (const line of akLines) {
      if (/question\s*no/i.test(line) || /q\.?\s*no/i.test(line)) { inTable = true; continue; }
      if (!inTable) continue;
      const rowMatch = line.match(/^(\d+)\s+(\d+)$/);
      if (rowMatch) answerMap[parseInt(rowMatch[1])] = rowMatch[2];
    }
    if (Object.keys(answerMap).length === 0) {
      for (const line of akLines) {
        const inlineMatch = line.match(/(\d+)\s*[=:]\s*([A-Da-d1-4])/);
        if (inlineMatch) answerMap[parseInt(inlineMatch[1])] = inlineMatch[2].toUpperCase();
      }
    }
  }

  const lines = questionsPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const sections = [];
  let currentSection = { name: 'General', questions: [] };
  sections.push(currentSection);
  let currentQuestion = null;
  let headerMode = true;
  const numToLetter = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };

  for (const line of lines) {
    if (/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]/i.test(line)) {
      if (currentQuestion && currentQuestion.options.length > 0) currentSection.questions.push(currentQuestion);
      currentQuestion = null;
      currentSection = { name: line.replace(/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]*/i, '').trim(), questions: [] };
      sections.push(currentSection);
      continue;
    }

    const optMatch = line.match(/^\(?([1-4A-Da-d])\)?[\.\)\s]+\s*(.+)/);
    if (optMatch && currentQuestion && currentQuestion.options.length < 4) {
      const raw = optMatch[1].toUpperCase();
      const letter = numToLetter[raw] || raw;
      currentQuestion.options.push({ letter, text: optMatch[2] });
      continue;
    }

    const ansMatch = line.match(/^(?:answer|ans|correct|key|right|उत्तर)\s*[:=]?\s*\(?([A-Da-d1-4])\)?/i);
    if (ansMatch && currentQuestion) {
      currentQuestion.answer = numToLetter[ansMatch[1].toUpperCase()] || ansMatch[1].toUpperCase();
      continue;
    }

    if (/^[1-4][\.\)\s]/.test(line) && !currentQuestion) continue;

    const qMatch = line.match(/^\(?(\d+)\)?[\.\)\]\s\t]+\s*(.+)/);
    if (qMatch) {
      headerMode = false;
      if (currentQuestion && currentQuestion.options.length > 0) currentSection.questions.push(currentQuestion);
      currentQuestion = {
        number: parseInt(qMatch[1]),
        text: qMatch[2],
        options: [],
        answer: answerMap[parseInt(qMatch[1])] ? numToLetter[answerMap[parseInt(qMatch[1])]] || answerMap[parseInt(qMatch[1])] : null
      };
      continue;
    }

    if (!currentQuestion && line.length > 10) {
      headerMode = false;
      const qNum = sections.reduce((s, sec) => s + sec.questions.length, 0) + 1;
      currentQuestion = { number: qNum, text: line, options: [], answer: answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null };
      continue;
    }

    if (currentQuestion && currentQuestion.options.length === 0) {
      currentQuestion.text += ' ' + line;
    }
  }

  if (currentQuestion && currentQuestion.options.length > 0) currentSection.questions.push(currentQuestion);

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
        if (o) { const raw = o[1].toUpperCase(); opts.push({ letter: numToLetter[raw] || raw, text: o[2] }); continue; }
        const a = pl.match(/^(?:answer|ans|correct|उत्तर)[\s:=]+\(?([A-Da-d1-4])\)?/i);
        if (a) { ans = numToLetter[a[1].toUpperCase()] || a[1].toUpperCase(); continue; }
        qText += (qText ? ' ' : '') + pl;
      }
      if (qText && opts.length >= 2) {
        const qNum = result.length + 1;
        const matchedAnswer = ans || (answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null);
        sec.questions.push({ number: qNum, text: qText.replace(/^\d+[\.\)\]\s\t]+\s*/, '').trim(), options: opts, answer: matchedAnswer || null });
      }
    }
    if (sec.questions.length > 0) result.push(sec);
    return result.length > 0 ? result : [];
  }

  return sections;
}

async function handler(req, res) {
  try {
    await runMiddleware(req, res, upload.single('examFile'));
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    let content = '';
    let ocrTexts = [];

    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      content = result.value || '';
    } catch (e) {
      content = file.buffer.toString('utf8');
    }

    try {
      const images = await extractImagesFromDocx(file.buffer);
      if (images.length > 0) {
        ocrTexts = await ocrImages(images);
        if (ocrTexts.length > 0) content += '\n\n' + ocrTexts.join('\n\n');
      }
    } catch (e) { /* skip */ }

    const sections = universalParse(content);
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

    res.status(200).json({
      success: true,
      fileName: file.originalname,
      fileSize: file.size,
      totalQuestions,
      sections: sections.map(s => ({
        name: s.name,
        questions: s.questions.map(q => ({
          number: q.number,
          text: q.text,
          options: q.options.map(o => ({ letter: o.letter, text: o.text })),
          answer: q.answer || null
        }))
      })),
      hasOcr: ocrTexts.length > 0
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export default requireAdmin(handler);
