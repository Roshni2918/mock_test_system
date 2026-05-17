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

  const sections = [];
  let currentSection = { name: 'General', questions: [] };
  sections.push(currentSection);
  const numToLetter = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };

  // 1st pass: accumulate all text lines (non-option, non-section) into currentSection.textBuffer
  // so text preceding questions doesn't create phantom questions
  // Paragraph-based parsing: split by blank lines
  const paragraphs = questionsPart.split(/\n\s*\n/).filter(p => p.trim().length > 5);

  for (const para of paragraphs) {
    const lines = para.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) continue;

    const firstLine = lines[0];

    // Section header
    if (/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]/i.test(firstLine)) {
      currentSection = { name: firstLine.replace(/^(section|topic|chapter|unit|part|subject|paper)\s*[-:.\s]*/i, '').trim(), questions: [] };
      sections.push(currentSection);
      continue;
    }

    // Find all question-start lines within this paragraph
    const qStarts = [];
    for (let i = 0; i < lines.length; i++) {
      if (/^\(?(\d+)\)?[\.\)\]\s\t]+\s*.{3,}/.test(lines[i])) {
        qStarts.push(i);
      }
    }

    if (qStarts.length === 0) continue;

    // Process each question block within the paragraph
    for (let qi = 0; qi < qStarts.length; qi++) {
      const start = qStarts[qi];
      const end = qi + 1 < qStarts.length ? qStarts[qi + 1] : lines.length;
      const block = lines.slice(start, end);

      const qMatch = block[0].match(/^\(?(\d+)\)?[\.\)\]\s\t]+\s*(.+)/);
      if (!qMatch) continue;
      const qNum = parseInt(qMatch[1]);
      let qText = qMatch[2];

      const options = [];
      for (let i = 1; i < block.length; i++) {
        const optMatches = [...block[i].matchAll(/\(?([1-4A-Da-d])\)?[\.\)\s]+\s*(.*?)(?=\s*\(?(?<!\d)[1-4A-Da-d]\)?[\.\)\s]|\s*$)/g)];
        if (optMatches.length > 0) {
          for (const om of optMatches) {
            const txt = om[2].trim();
            if (!txt) continue;
            const raw = om[1].toUpperCase();
            const letter = numToLetter[raw] || raw;
            if (!options.some(o => o.letter === letter)) {
              options.push({ letter, text: txt });
            }
            if (options.length >= 4) break;
          }
        } else {
          qText += ' ' + block[i];
        }
      }

      // Also check first line for inline options (e.g., "1. X? A) opt1 B) opt2")
      if (options.length < 2) {
        const inlineOpts = [...block[0].matchAll(/(?<=\s|^)\(?([1-4A-Da-d])\)?[\.\)\s]+\s*(.{2,}?)(?=\s*\(?(?<!\d)[1-4A-Da-d]\)?[\.\)\s]|\s*$)/g)];
        for (const io of inlineOpts) {
          const raw = io[1].toUpperCase();
          const letter = numToLetter[raw] || raw;
          if (!options.some(o => o.letter === letter)) {
            options.push({ letter, text: io[2].trim() });
          }
        }
      }

      if (options.length >= 2 && qNum) {
        const answer = answerMap[qNum] ? numToLetter[answerMap[qNum]] || answerMap[qNum] : null;
        currentSection.questions.push({
          number: qNum,
          text: qText.replace(/^\d+[\.\)\]\s\t]+\s*/, '').trim(),
          options,
          answer
        });
      }
    }
  }

  // Return questions even if only 1 section
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
        contentPreview: content.substring(0, 300)
      }
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export default requireAdmin(handler);
