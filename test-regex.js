const ansKeyPattern = /^[\s]*(?:(?:\d+[\s(]*)?(?:paper|set|section|part)\s*[-:.\s]+\s*)?\d*[\s(]*(?:answer\s*(?:key|sheet)|ans\s*(?:key|sheet))[:\s()]*$/im;

// Full content with questions AND answer key (using real tabs)
const content = [
  '1\t\u092E\u0939\u093E\u0935\u0940\u0930 \u0915\u093E \u091C\u0928\u094D\u092E \u0915\u0939\u093E\u0902 \u0939\u0941\u0906 \u0925\u093E?',
  '\t1) \u0932\u0941\u0902\u092C\u0940\u0928\u0940 \t2) \u0915\u0941\u0902\u0921\u0917\u094D\u0930\u093E\u092E \t3) \u0915\u0941\u0936\u0940\u0928\u0917\u0930 \t4) \u092A\u093E\u0935\u093E\u092A\u0941\u0930\u0940',
  '2\t\u0935\u0943\u0926\u094D\u0927\u0947\u0936\u094D\u0935\u0930 \u092E\u0902\u0926\u093F\u0930 \u0915\u0939\u093E\u0902 \u092A\u0930 \u0938\u094D\u0925\u093F\u0924 \u0939\u0948 ?',
  '\t1) \u0915\u093E\u0902\u091A\u0940 \t2) \u092E\u0941\u0926\u0930\u0947 \t3) \u0936\u094D\u0930\u0940\u0936\u0948\u0932\u092E \t4) \u0924\u0902\u091C\u094C\u0930',
  '',
  'Paper - 35 (Ans Key)',
  '',
  'Question No\tAnswer\tQuestion No\tAnswer',
  '1\t2\t26\t4',
  '2\t4\t27\t2',
].join('\n');

console.log("Content preview:");
console.log(content.substring(0, 300));
console.log("---");

const m = content.match(ansKeyPattern);
console.log("\nMatch found:", !!m);
console.log("Match index:", m?.index);
console.log("Matched text:", m ? JSON.stringify(m[0]) : 'N/A');

if (m) {
  const questionsPart = content.substring(0, m.index).trim();
  const answerKeyPart = content.substring(m.index).trim();
  console.log("\nQuestions part length:", questionsPart.length);
  console.log("Questions part ends with:", JSON.stringify(questionsPart.slice(-50)));
  console.log("\nAnswer key part starts with:", JSON.stringify(answerKeyPart.substring(0, 100)));

  const akLines = answerKeyPart.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.log("AK Lines:", akLines);

  const answerMap = {};
  let inTable = false;
  for (const line of akLines) {
    if (/question\s*no/i.test(line) || /q\.?\s*no/i.test(line)) { inTable = true; continue; }
    if (!inTable) continue;
    const pairs = [...line.matchAll(/(\d+)\s+([A-Da-d1-4])/g)];
    for (const p of pairs) answerMap[parseInt(p[1])] = p[2];
  }
  console.log("\nAnswer map:", JSON.stringify(answerMap));
  console.log("Answer map size:", Object.keys(answerMap).length);
}
