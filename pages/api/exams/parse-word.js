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
  // Extract answer map by scanning entire content for answer key table patterns
  const answerMap = {};
  const allLines = content.split('\n');
  let inTable = false;
  for (const rawLine of allLines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!inTable) {
      if (/question\s*no/i.test(line) || /q\.?\s*no/i.test(line)) { inTable = true; }
      continue;
    }
    const pairs = [...line.matchAll(/(\d+)\s+([A-Da-d1-4])/g)];
    if (pairs.length > 0) {
      for (const p of pairs) answerMap[parseInt(p[1])] = p[2];
    }
  }
  if (Object.keys(answerMap).length === 0) {
    for (const rawLine of allLines) {
      const line = rawLine.trim();
      if (!line || /(?:answer|ans|key|correct|उत्तर|solution|paper)/i.test(line)) continue;
      const pairs = [...line.matchAll(/(\d+)\s*[=:.)\]\-\s]\s*([A-Da-d1-4])/g)];
      for (const p of pairs) answerMap[parseInt(p[1])] = p[2].toUpperCase();
    }
  }

  // Split content at answer key header
  const ansKeyPattern = /^[\s]*(?:(?:\d+[\s(]*)?(?:paper|set|section|part)\s*[-:.\s]+\s*)?\d*[\s(]*(?:answer\s*(?:key|sheet)|ans\s*(?:key|sheet)|उत्तर\s*(?:सूची|कुंजी|माला))[:\s()]*$/im;
  const m = content.match(ansKeyPattern);
  const questionsPart = m ? content.substring(0, m.index).trim() : content.trim();

  const lines = questionsPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const sections = [];
  let currentSection = { name: 'General', questions: [] };
  sections.push(currentSection);
  let currentQuestion = null;
  const numToLetter = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };

  for (const line of lines) {
    // Section header detection
    if (/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]/i.test(line)) {
      if (currentQuestion && currentQuestion.options.length > 0) currentSection.questions.push(currentQuestion);
      currentQuestion = null;
      currentSection = { name: line.replace(/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]*/i, '').trim(), questions: [] };
      sections.push(currentSection);
      continue;
    }

    // Try to extract options (e.g., "1) opt1\t2) opt2\t3) opt3\t4) opt4")
    const opts = [...line.matchAll(/\(?([1-4A-Da-d])\)?[\.\)\s]+\s*(.*?)(?=\s*\(?(?<!\d)[1-4A-Da-d]\)?[\.\)\s]|\s*$)/g)];
    if (opts.length > 0 && currentQuestion && currentQuestion.options.length < 4) {
      let anyAdded = false;
      for (const o of opts) {
        if (currentQuestion.options.length >= 4) break;
        const text = o[2].trim();
        if (!text) continue;
        // Check that this option label doesn't duplicate an existing one
        const raw = o[1].toUpperCase();
        const letter = numToLetter[raw] || raw;
        if (!currentQuestion.options.some(ex => ex.letter === letter)) {
          currentQuestion.options.push({ letter, text });
          anyAdded = true;
        }
      }
      if (anyAdded) continue;
    }

    // Inline answer match (e.g., "Answer: A", "उत्तर : 2")
    const ansMatch = line.match(/^(?:answer|ans|correct|key|right|उत्तर)\s*[:=]?\s*\(?([A-Da-d1-4])\)?/i);
    if (ansMatch && currentQuestion) {
      currentQuestion.answer = numToLetter[ansMatch[1].toUpperCase()] || ansMatch[1].toUpperCase();
      continue;
    }

    // Skip orphan option lines (when no current question exists)
    // Only match if line starts with 1-4 followed by ) or . (e.g., "1) text", "1. text")
    // NOT "1\ttext" (which is a legitimate question 1)
    if (/^[1-4][\.\)]/.test(line) && !currentQuestion) continue;

    // Question match: "1\ttext", "1. text", "1) text", etc.
    const qMatch = line.match(/^\(?(\d+)\)?[\.\)\]\s\t]+\s*(.+)/);
    if (qMatch) {
      // IMPORTANT: Skip if this is actually an option line (number 1-4 followed by short content with more options)
      // e.g., "1) opt1\t2) opt2..." should not create a new question
      const qNum = parseInt(qMatch[1]);
      if (qNum >= 1 && qNum <= 4 && opts.length > 0) {
        // This is an options line being misidentified as a question
        continue;
      }
      if (currentQuestion && currentQuestion.options.length > 0) currentSection.questions.push(currentQuestion);
      currentQuestion = {
        number: qNum,
        text: qMatch[2],
        options: [],
        answer: answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null
      };
      continue;
    }

    // Append text to current question if it has no options yet
    if (!currentQuestion && line.length > 10) {
      const qNum = sections.reduce((s, sec) => s + sec.questions.length, 0) + 1;
      currentQuestion = { number: qNum, text: line, options: [], answer: answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null };
      continue;
    }

    if (currentQuestion && currentQuestion.options.length === 0) {
      currentQuestion.text += ' ' + line;
    }
  }

  if (currentQuestion && currentQuestion.options.length > 0) currentSection.questions.push(currentQuestion);

  // Fallback: if no questions found via line-by-line, try paragraph-based
  if (sections.every(s => s.questions.length === 0)) {
    const paragraphs = questionsPart.split(/\n\s*\n/).filter(p => p.trim().length > 15);
    for (const para of paragraphs) {
      const pLines = para.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (pLines.length < 2) continue;
      const optLines = [];
      let qText = '';
      let ans = '';
      for (const pl of pLines) {
        const oo = [...pl.matchAll(/\(?([1-4A-Da-d])\)?[\.\)\s]+\s*(.*?)(?=\s*\(?(?<!\d)[1-4A-Da-d]\)?[\.\)\s]|\s*$)/g)];
        if (oo.length > 0) { for (const o of oo) { const t = o[2].trim(); if (!t) continue; const raw = o[1].toUpperCase(); optLines.push({ letter: numToLetter[raw] || raw, text: t }); } continue; }
        const a = pl.match(/^(?:answer|ans|correct|उत्तर)[\s:=]+\(?([A-Da-d1-4])\)?/i);
        if (a) { ans = numToLetter[a[1].toUpperCase()] || a[1].toUpperCase(); continue; }
        qText += (qText ? ' ' : '') + pl;
      }
      if (qText && optLines.length >= 2) {
        const qNum = sections.reduce((s, sec) => s + sec.questions.length, 0) + 1;
        const matchedAnswer = ans || (answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null);
        currentSection.questions.push({ number: qNum, text: qText.replace(/^\d+[\.\)\]\s\t]+\s*/, '').trim(), options: optLines, answer: matchedAnswer || null });
      }
    }
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

    // Re-run parse to capture debug info — scan all lines for answer patterns
    const dm = null; // not used; answerMap extracted from full content
    const answerMap = {};
    let inTable = false;
    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      if (!inTable) {
        if (/question\s*no/i.test(line) || /q\.?\s*no/i.test(line)) { inTable = true; }
        continue;
      }
      const pairs = [...line.matchAll(/(\d+)\s+([A-Da-d1-4])/g)];
      if (pairs.length > 0) {
        for (const p of pairs) answerMap[parseInt(p[1])] = p[2];
      }
    }
    if (Object.keys(answerMap).length === 0) {
      for (const rawLine of content.split('\n')) {
        const line = rawLine.trim();
        if (!line || /(?:answer|ans|key|correct|उत्तर|solution|paper)/i.test(line)) continue;
        const pairs = [...line.matchAll(/(\d+)\s*[=:.)\]\-\s]\s*([A-Da-d1-4])/g)];
        for (const p of pairs) answerMap[parseInt(p[1])] = p[2].toUpperCase();
      }
    }

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
      hasOcr: ocrTexts.length > 0,
      _debug: {
        answerMapSize: Object.keys(answerMap).length,
        answerMapSample: Object.fromEntries(Object.entries(answerMap).slice(0, 5)),
        answerMap: answerMap,
        linesTotal: content.split('\n').length,
        foundQuestionNumbers: sections.flatMap(s => s.questions.map(q => q.number)),
        contentPreview: content.substring(0, 500)
      }
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export default requireAdmin(handler);
