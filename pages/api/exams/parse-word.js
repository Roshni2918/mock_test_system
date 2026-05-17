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

function extractAnswerKeyFromHtml(html) {
  const answerMap = {};
  try {
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const tableHtml = tableMatch[1];
      if (!/(?:question|answer|प्रश्न|उत्तर)/i.test(tableHtml)) continue;
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let rowMatch;
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        const cells = [];
        const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
          const text = cellMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
          if (text) cells.push(text);
        }
        if (cells.some(c => /^(?:question|answer|q\.?|a\.?|प्रश्न|उत्तर|no\.?|number)$/i.test(c))) continue;
        for (let i = 0; i + 1 < cells.length; i += 2) {
          const qNum = parseInt(cells[i]);
          const ansText = cells[i+1].replace(/[^A-Da-d1-4]/g, '');
          const ansMatch = ansText.match(/^([A-Da-d1-4])$/);
          if (!isNaN(qNum) && ansMatch && qNum >= 1 && qNum <= 500) {
            answerMap[qNum] = ansMatch[1].toUpperCase();
          }
        }
      }
      if (Object.keys(answerMap).length > 5) break;
    }
  } catch (e) {
    console.error('HTML answer key extraction error:', e);
  }
  return answerMap;
}

function universalParse(content, preExtractedAnswers = {}) {
  // Start with pre-extracted answers (e.g., from HTML tables), then supplement via text extraction
  const answerMap = { ...preExtractedAnswers };
  const allLines = content.split('\n');

  // FIRST approach: use the answer-key split point, then extract from WITHIN the answer key section
  // The questionsPart split isolates questions before the header; everything after is the answer key.
  const ansKeyPatternLocal = /^[\s]*(?:(?:\d+[\s(]*)?(?:paper|set|section|part)\s*[-:.\s]+\s*)?\d*[\s(]*(?:answer\s*(?:key|sheet)|ans\s*(?:key|sheet)|उत्तर\s*(?:सूची|कुंजी|माला))[:\s()]*$/im;
  const ansKeyMatch = content.match(ansKeyPatternLocal);
  const answerSection = ansKeyMatch ? content.substring(ansKeyMatch.index) : '';

  if (answerSection) {
    // Scan the answer key section line by line
    for (const rawLine of answerSection.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      // Skip the header line itself
      if (ansKeyPatternLocal.test(line)) continue;
      // Extract all number-answer pairs
      const pairs = [...line.matchAll(/(\d+)\s*[=:.)\]\-\s]\s*([A-Da-d1-4])/g)];
      for (const p of pairs) answerMap[parseInt(p[1])] = p[2].toUpperCase();
    }
  }

  // SECOND approach: if nothing found, scan every line for any format
  if (Object.keys(answerMap).length === 0) {
    for (const rawLine of allLines) {
      const line = rawLine.trim();
      if (!line) continue;
      // Columnar format
      let pairs = [...line.matchAll(/(\d+)\s*[=:.)\]\-\s]\s*([A-Da-d1-4])/g)];
      if (pairs.length === 0) {
        // Compact format like "1A 2B" or "1-A 2-B"
        pairs = [...line.matchAll(/(\d+)\s*[-:.)\]\s]?\s*([A-Da-d1-4])\b/g)];
      }
      for (const p of pairs) {
        const qNum = parseInt(p[1]);
        if (qNum >= 1 && qNum <= 500) answerMap[qNum] = p[2].toUpperCase();
      }
    }
  }

  // THIRD approach: try to find answer key by scanning backwards from end
  // looking for any line with many Q→Ans pairs
  if (Object.keys(answerMap).length < 5) {
    for (const rawLine of allLines.slice(-100).reverse()) {
      const line = rawLine.trim();
      if (!line) continue;
      const pairs = [...line.matchAll(/(\d+)\s*[=:.)\]\-\s]\s*([A-Da-d1-4])/g)];
      if (pairs.length >= 3) {
        for (const p of pairs) {
          const qNum = parseInt(p[1]);
          if (qNum >= 1 && qNum <= 500) answerMap[qNum] = p[2].toUpperCase();
        }
        break; // Found the answer key line
      }
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
  const orphanOptionLines = [];

  for (const line of lines) {
    // Section header detection
    if (/^(section|topic|chapter|unit|part|subject|paper)\b/i.test(line)) {
      if (currentQuestion && currentQuestion.options.length > 0) currentSection.questions.push(currentQuestion);
      currentQuestion = null;
      currentSection = { name: line.replace(/^(section|topic|chapter|unit|part|subject|paper)\s*[:\s.-]*(?:\d+\s*[:\s.-]*)?/i, '').trim(), questions: [] };
      sections.push(currentSection);
      continue;
    }

    // Try to extract options from tab-separated segments (e.g., "\t1) opt1\t2) opt2\t3) opt3\t4) opt4")
    // Split by tab first: this correctly handles option text that starts with digits 1-4
    const optSegments = line.split('\t').filter(s => s.trim().length > 0);
    const opts = [];
    for (const seg of optSegments) {
      const m = seg.trim().match(/^\(?([1-4A-Da-d])[\)\.]\s*(.*)$/);
      if (m) opts.push(m);
    }
    // Check for merged options (when tab separator was missing in the docx,
    // e.g. "3) text  4) text" without a tab between them)
    let checkedOpts = opts;
    if (opts.length > 0 && opts.length < 4) {
      const expanded = [];
      for (const o of opts) {
        const m = o[2].match(/^(.+?)\s+\(?([1-4])[\)\.]\s+(.+)$/);
        if (m) {
          expanded.push([null, o[1], m[1]]);
          expanded.push([null, m[2], m[3]]);
        } else {
          expanded.push(o);
        }
      }
      if (expanded.length > opts.length) checkedOpts = expanded;
    }
    if (checkedOpts.length > 0 && currentQuestion && currentQuestion.options.length < 4) {
      let anyAdded = false;
      for (const o of checkedOpts) {
        if (currentQuestion.options.length >= 4) break;
        const text = o[2].trim();
        const raw = o[1].toUpperCase();
        const letter = numToLetter[raw] || raw;
        if (!currentQuestion.options.some(ex => ex.letter === letter)) {
          currentQuestion.options.push({ letter, text });
          anyAdded = true;
        }
      }
      if (anyAdded) {
        currentQuestion.options.sort((a, b) => a.letter.localeCompare(b.letter));
        continue;
      }
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
      // IMPORTANT: Skip if this is actually an option line (number 1-4 followed by multiple options)
      // e.g., "1) opt1\t2) opt2..." should not create a new question
      // But "1\ttext" (Q1) has only 1 opts match, not 2+
      const qNum = parseInt(qMatch[1]);
      if (qNum >= 1 && qNum <= 4 && opts.length >= 2) {
        // If current question already has 4 options, this line likely belongs to a future question
        // Save it so post-processing can restore it to embedded questions
        if (currentQuestion && currentQuestion.options.length >= 4) {
          const savedOpts = [];
          for (const o of opts) {
            const raw = o[1].toUpperCase();
            const letter = numToLetter[raw] || raw;
            const text = o[2].trim();
            if (text) savedOpts.push({ letter, text });
          }
          if (savedOpts.length >= 2) orphanOptionLines.push(savedOpts);
        }
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

  // Post-process: detect embedded question boundaries within option text
  // (happens when mammoth merges adjacent content without newlines)
  for (const section of sections) {
    const newQuestions = [];
    for (const q of section.questions) {
      const fixedOptions = [];
      let hasSplit = false;
      for (const opt of q.options) {
        const splitMatch = opt.text.match(/^(.+?)(\d+)[\.\)\]\s\t]+\s*(.+)$/);
        if (splitMatch) {
          const potentialQNum = parseInt(splitMatch[2]);
          if (potentialQNum > 4 && splitMatch[3].trim().length > 5) {
            const optText = splitMatch[1].trim();
            if (optText) fixedOptions.push({ letter: opt.letter, text: optText });
            newQuestions.push({
              number: potentialQNum,
              text: splitMatch[3].trim(),
              options: [],
              answer: answerMap[potentialQNum] ? numToLetter[answerMap[potentialQNum]] || answerMap[potentialQNum] : null
            });
            hasSplit = true;
            continue;
          }
        }
        fixedOptions.push(opt);
      }
      if (hasSplit) q.options = fixedOptions;
    }
    for (const nq of newQuestions) {
      // Restore orphan options that belong to this question
      // (orphanOptionLines are stored in document order, so first unclaimed line goes to first optionless new question)
      if (orphanOptionLines.length > 0 && nq.options.length === 0) {
        nq.options = orphanOptionLines.shift();
      }
      let idx = section.questions.length;
      for (let i = 0; i < section.questions.length; i++) {
        if (section.questions[i].number > nq.number) {
          idx = i;
          break;
        }
      }
      section.questions.splice(idx, 0, nq);
    }
  }

  // Fill missing questions from answer map (handles questions not extracted by mammoth)
  if (sections.length > 0 && sections[0].questions.length > 0 && Object.keys(answerMap).length > 0) {
    const existingNums = new Set(sections[0].questions.map(q => q.number));
    const maxKey = Math.max(...Object.keys(answerMap).map(Number).filter(k => k <= 100), ...sections[0].questions.map(q => q.number));
    for (let n = 1; n <= maxKey; n++) {
      if (!existingNums.has(n) && answerMap[n]) {
        const insertIdx = sections[0].questions.findIndex(q => q.number > n);
        sections[0].questions.splice(insertIdx >= 0 ? insertIdx : sections[0].questions.length, 0, {
          number: n,
          text: `Question ${n}`,
          options: [],
          answer: numToLetter[answerMap[n]] || answerMap[n]
        });
      }
    }
  }

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
        const oo = [...pl.matchAll(/\(?([1-4A-Da-d])[\)\.]\s*(.*?)(?=\s*\(?(?<!\d)[1-4A-Da-d]\)?[\.\)\s]|\s*$)/g)];
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
    let htmlContent = '';

    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      content = result.value || '';
    } catch (e) {
      content = file.buffer.toString('utf8');
    }

    try {
      const htmlResult = await mammoth.convertToHtml({ buffer: file.buffer });
      htmlContent = htmlResult.value || '';
    } catch (e) { /* ignore */ }

    // Extract answer key from HTML tables (more reliable than text extraction for table content)
    const htmlAnswerMap = extractAnswerKeyFromHtml(htmlContent);

    try {
      const images = await extractImagesFromDocx(file.buffer);
      if (images.length > 0) {
        ocrTexts = await ocrImages(images);
        if (ocrTexts.length > 0) content += '\n\n' + ocrTexts.join('\n\n');
      }
    } catch (e) { /* skip */ }

    const sections = universalParse(content, htmlAnswerMap);
    const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

    // Build debug answer map from HTML-extracted answers, supplemented by text extraction
    const answerMap = { ...htmlAnswerMap };
    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();
      if (!line) continue;
      const pairs = [...line.matchAll(/(\d+)\s*[=:.)\]\-\s]\s*([A-Da-d1-4])/g)];
      for (const p of pairs) {
        const qNum = parseInt(p[1]);
        if (qNum >= 1 && qNum <= 500) answerMap[qNum] = p[2].toUpperCase();
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
        htmlAnswerMapSize: Object.keys(htmlAnswerMap).length,
        htmlAnswerMap: htmlAnswerMap,
        linesTotal: content.split('\n').length,
        foundQuestionNumbers: sections.flatMap(s => s.questions.map(q => q.number)),
        contentPreview: content.substring(0, 500),
        htmlPreview: htmlContent.substring(0, 500)
      }
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export default requireAdmin(handler);
