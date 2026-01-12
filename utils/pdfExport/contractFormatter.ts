export const escapeHtml = (text: string): string => {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const formatInlineEmphasis = (text: string): string => {
  return text
    .replaceAll(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replaceAll(/\*(.+?)\*/g, '<em>$1</em>');
};

const formatText = (text: string, className: string): string => {
  return `<div class="${className}">${formatInlineEmphasis(escapeHtml(text))}</div>`;
};

const PATTERNS = {
  nationalHeader: /^\*\*?CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM/i,
  nationalHeaderAlt: /^CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM/i,
  docLap: /^\*\*?Độc lập.*Tự do.*Hạnh phúc/i,
  docLapAlt: /^Độc lập.*Tự do.*Hạnh phúc/i,
  hopDong: /^#+\s+HỢP ĐỒNG/i,
  hopDongAlt: /^HỢP ĐỒNG/i,
  so: /^\*\*Số:\s*(.+?)\*\*$/i,
  soAlt: /^Số:\s*(.+)$/i,
  canCu: /^\*Căn cứ/i,
  benA: /^#+\s*Bên A\s*[:(]/i,
  benAAlt: /^#+\s*BÊN A\s*[:(]/i,
  benASimple: /^Bên A\s*[:(]/i,
  benASimpleAlt: /^BÊN A\s*[:(]/i,
  benABold: /^\*\*BÊN A\s*[:]/i,
  benB: /^#+\s*Bên B\s*[:(]/i,
  benBAlt: /^#+\s*BÊN B\s*[:(]/i,
  benBSimple: /^Bên B\s*[:(]/i,
  benBSimpleAlt: /^BÊN B\s*[:(]/i,
  benBBold: /^\*\*BÊN B\s*[:]/i,
  xetRang: /^Xét rằng/i,
  dieu: /^#+\s*Điều\s+\d+[:.]?\s*(.+)$/i,
  dieuAlt: /^Điều\s+\d+[:.]?\s*(.+)$/i,
  dieuHeader: /^#+\s*Điều\s+\d+/i,
  dieuHeaderAlt: /^Điều\s+\d+/i,
  dieuAllCaps: /^#+\s*ĐIỀU\s+\d+/i,
  dieuAllCapsAlt: /^ĐIỀU\s+\d+/i,
  dieuBold: /^\*\*Điều\s+\d+[:.]?\s*(.+?)\*\*$/i,
  dieuBoldAlt: /^\*\*ĐIỀU\s+\d+[:.]?\s*(.+?)\*\*$/i,
  dieuBoldHeader: /^\*\*Điều\s+\d+/i,
  dieuBoldHeaderAlt: /^\*\*ĐIỀU\s+\d+/i,
  clause: /^\d+\.\s+(.+)$/,
  item: /^[-*]\s+(.+)$/,
  daiDien: /^\*\*ĐẠI DIỆN/i,
  daiDienA: /^Đại diện Bên A/i,
  daiDienB: /^Đại diện Bên B/i,
  watermark: /^\*\*\* .+? \*\*\*$/,
  separator: /^---+$/,
  subclause: /^\*\*\d+\.\d+\.\s+(.+?)\*\*$/i,
  subclauseAlt: /^\d+\.\d+\.\s+(.+)$/i,
  sectionBreak: /^#+\s*Bên|^Bên|^Xét rằng|^#+\s*Điều|^Điều|^Đại diện|^\*\*ĐẠI DIỆN/i
};

const matchesPattern = (line: string, patterns: RegExp[]): boolean => {
  return patterns.some(p => p.test(line));
};

const processNationalHeader = (lines: string[], startIdx: number): { html: string; nextIdx: number } => {
  const headerLines = [lines[startIdx]];
  let j = startIdx + 1;
  while (j < lines.length) {
    const nextLine = lines[j].trim();
    if (PATTERNS.docLap.test(nextLine) || PATTERNS.docLapAlt.test(nextLine)) {
      headerLines.push(nextLine);
      j++;
      break;
    }
    if (PATTERNS.hopDong.test(nextLine) || PATTERNS.hopDongAlt.test(nextLine)) {
      break;
    }
    if (nextLine) {
      headerLines.push(nextLine);
    }
    j++;
  }
  const headerText = headerLines.map(l => formatInlineEmphasis(escapeHtml(l))).join('<br>');
  return { html: `<div class="contract-national-header">${headerText}</div>`, nextIdx: j };
};

const processCanCu = (lines: string[], startIdx: number): { html: string; nextIdx: number } => {
  const cănCứLines: string[] = [];
  let j = startIdx;
  while (j < lines.length) {
    const nextLine = lines[j].trim();
    if (!nextLine) {
      if (cănCứLines.length > 0) {
        cănCứLines.push('');
      }
      j++;
      continue;
    }
    if (PATTERNS.canCu.test(nextLine) || cănCứLines.length > 0) {
      if (PATTERNS.sectionBreak.test(nextLine) && !PATTERNS.canCu.test(nextLine)) {
        break;
      }
      cănCứLines.push(nextLine);
      j++;
    } else {
      break;
    }
  }
  const cănCứText = cănCứLines.filter(l => l.trim()).map(l => escapeHtml(l)).join('<br>');
  return { html: `<div class="contract-can-cu">${formatInlineEmphasis(cănCứText)}</div>`, nextIdx: j };
};

const processParty = (lines: string[], startIdx: number, partyType: 'a' | 'b'): { html: string; nextIdx: number } => {
  const cleanLine = lines[startIdx]
    .replace(/^#+\s+/, '')
    .replace(/^\*\*/, '')
    .replace(/\*\*$/, '')
    .trim();
  const partyBlock: string[] = [cleanLine];
  let j = startIdx + 1;
  const stopPatterns = partyType === 'a' 
    ? [PATTERNS.benB, PATTERNS.benBAlt, PATTERNS.benBSimple, PATTERNS.benBSimpleAlt, PATTERNS.benBBold]
    : [PATTERNS.xetRang, PATTERNS.dieuHeader, PATTERNS.dieuHeaderAlt, PATTERNS.dieuAllCaps, PATTERNS.dieuAllCapsAlt, PATTERNS.dieuBoldHeader, PATTERNS.dieuBoldHeaderAlt];
  
  while (j < lines.length) {
    const nextLine = lines[j].trim();
    if (!nextLine) {
      if (partyBlock.length > 0 && partyBlock.at(-1) !== '') {
        partyBlock.push('');
      }
      j++;
      continue;
    }
    const shouldStop = matchesPattern(nextLine, stopPatterns) || 
      /^#+\s*ĐIỀU/i.test(nextLine) || 
      /^ĐIỀU\s+\d+/i.test(nextLine) ||
      /^\*\*ĐIỀU\s+\d+/i.test(nextLine) ||
      /^Xét rằng/i.test(nextLine);
    if (shouldStop) {
      break;
    }
    partyBlock.push(nextLine);
    j++;
  }
  const partyText = partyBlock.filter((l, idx) => l.trim() || idx === 0).map(l => escapeHtml(l)).join('<br>');
  const className = partyType === 'a' ? 'contract-party-a' : 'contract-party-b';
  return { html: `<div class="${className}">${formatInlineEmphasis(partyText)}</div>`, nextIdx: j };
};

const processWhereas = (lines: string[], startIdx: number): { html: string; nextIdx: number } => {
  const whereasLines = [lines[startIdx]];
  let j = startIdx + 1;
  while (j < lines.length) {
    const nextLine = lines[j].trim();
    if (PATTERNS.dieuHeader.test(nextLine) || PATTERNS.dieuHeaderAlt.test(nextLine)) {
      break;
    }
    if (nextLine) {
      whereasLines.push(nextLine);
    }
    j++;
  }
  const whereasText = whereasLines.join(' ');
  return { html: formatText(whereasText, 'contract-whereas'), nextIdx: j };
};

const findFirstNonEmptyCol = (cells: string[][]): number => {
  const firstRowLength = cells[0]?.length ?? 0;
  for (let col = 0; col < firstRowLength; col++) {
    if (cells.some(row => row[col]?.trim())) {
      return col;
    }
  }
  return 0;
};

const findLastNonEmptyCol = (cells: string[][]): number => {
  const firstRowLength = cells[0]?.length ?? 0;
  for (let col = firstRowLength - 1; col >= 0; col--) {
    if (cells.some(row => row[col]?.trim())) {
      return col;
    }
  }
  return firstRowLength - 1;
};

const processTable = (lines: string[], startIdx: number): { html: string; nextIdx: number } | null => {
  const tableRows: string[] = [];
  let j = startIdx;
  while (j < lines.length && lines[j].trim().includes('|')) {
    const row = lines[j].trim();
    if (!/^[|\s\-:]+$/.test(row)) {
      tableRows.push(row);
    }
    j++;
  }
  if (tableRows.length === 0) {
    return null;
  }
  
  const allRowsCells = tableRows.map(row => row.split('|').map(c => c.trim()));
  const firstCol = findFirstNonEmptyCol(allRowsCells);
  const lastCol = findLastNonEmptyCol(allRowsCells);
  const colCount = lastCol - firstCol + 1;
  
  let tableHtml = '<div class="contract-table">';
  allRowsCells.forEach((rowCells, rowIdx) => {
    const trimmedCells = rowCells.slice(firstCol, lastCol + 1);
    const nonEmptyCells = trimmedCells.filter(c => c?.trim());
    if (nonEmptyCells.length >= 1) {
      tableHtml += '<div class="contract-table-row">';
      for (let i = 0; i < colCount; i++) {
        const cell = trimmedCells[i] || '';
        const cellClass = rowIdx === 0 ? 'contract-table-header' : 'contract-table-cell';
        const brPlaceholder = '___BR_TAG_PLACEHOLDER_XYZ___';
        let processedCell = cell.replaceAll(/<br\s*\/?>/gi, brPlaceholder);
        processedCell = escapeHtml(processedCell);
        processedCell = processedCell.replaceAll(brPlaceholder, '<br>');
        tableHtml += `<div class="${cellClass}">${formatInlineEmphasis(processedCell)}</div>`;
      }
      tableHtml += '</div>';
    }
  });
  tableHtml += '</div>';
  return { html: tableHtml, nextIdx: j };
};

const processArticleContent = (lines: string[], startIdx: number): { content: string[]; nextIdx: number } => {
  const articleContent: string[] = [];
  let i = startIdx;
  const breakPatterns = [
    /^#+\s*Điều\s+\d+/i,
    /^Điều\s+\d+/i,
    /^#+\s*ĐIỀU\s+\d+/i,
    /^ĐIỀU\s+\d+/i,
    /^\*\*Điều\s+\d+/i,
    /^\*\*ĐIỀU\s+\d+/i,
    /^###\s*ĐIỀU/i
  ];

  while (i < lines.length) {
    const trimmedNext = lines[i].trim();
    if (!trimmedNext) {
      if (articleContent.length > 0) {
        articleContent.push('<div class="contract-spacing"></div>');
      }
      i++;
      continue;
    }
    if (trimmedNext.includes('|') && trimmedNext.split('|').length >= 3) {
      const tableResult = processTable(lines, i);
      if (tableResult) {
        articleContent.push(tableResult.html);
        i = tableResult.nextIdx;
        continue;
      }
    }
    if (PATTERNS.daiDien.test(trimmedNext) || /^Đại diện\s+Bên/i.test(trimmedNext)) {
      if (trimmedNext.includes('ĐẠI DIỆN BÊN A') && trimmedNext.includes('ĐẠI DIỆN BÊN B')) {
        const nextLineIdx = i + 1;
        if (nextLineIdx < lines.length) {
          const nextLine = lines[nextLineIdx].trim();
          if (nextLine.includes('Ký tên') || nextLine.includes('đóng dấu') || nextLine.includes('Đã ký') || 
              nextLine.match(/^\(.*\)/) || nextLine.match(/^LÊ|^NGUYỄN|^TRẦN|^PHẠM|^HOÀNG|^VŨ|^VÕ/i)) {
            break;
          }
        } else {
          break;
        }
      } else {
        const nextLineIdx = i + 1;
        if (nextLineIdx < lines.length) {
          const nextLine = lines[nextLineIdx].trim();
          if (nextLine.includes('Ký tên') || nextLine.includes('đóng dấu') || nextLine.includes('Đã ký')) {
            break;
          }
        }
      }
    }
    const isTableRow = trimmedNext.includes('|') && trimmedNext.split('|').length >= 3;
    if (!isTableRow && matchesPattern(trimmedNext, breakPatterns)) {
      break;
    }
    if (PATTERNS.subclause.test(trimmedNext) || PATTERNS.subclauseAlt.test(trimmedNext)) {
      const clauseText = trimmedNext.replace(/^\*\*\d+\.\d+\.\s+/i, '').replace(/\*\*$/, '').replace(/^\d+\.\d+\.\s+/, '').trim();
      articleContent.push(formatText(clauseText, 'contract-subclause'));
      i++;
      continue;
    }
    if (PATTERNS.clause.test(trimmedNext)) {
      const clauseText = trimmedNext.replace(/^\d+\.\s+/, '');
      articleContent.push(formatText(clauseText, 'contract-clause'));
      i++;
      continue;
    }
    if (PATTERNS.item.test(trimmedNext)) {
      const itemText = trimmedNext.replace(/^[-*]\s+/, '');
      articleContent.push(formatText(itemText, 'contract-item'));
      i++;
      continue;
    }
    articleContent.push(formatText(trimmedNext, 'contract-paragraph'));
    i++;
  }
  return { content: articleContent, nextIdx: i };
};

const processArticle = (lines: string[], startIdx: number): { html: string; nextIdx: number } => {
  let cleanLine = lines[startIdx]
    .replace(/^#+\s+/, '')
    .replace(/^\*\*/, '')
    .replace(/\*\*$/, '')
    .trim();
  if (!cleanLine && startIdx + 1 < lines.length) {
    cleanLine = lines[startIdx + 1].trim();
  }
  const articleText = formatInlineEmphasis(escapeHtml(cleanLine));
  const headerHtml = `<div class="contract-article-header">${articleText}</div>`;
  const { content, nextIdx } = processArticleContent(lines, startIdx + 1);
  const articleHtml = headerHtml + content.join('');
  console.log('[processArticle] Article:', cleanLine.substring(0, 50), 'Content blocks:', content.length, 'HTML length:', articleHtml.length);
  return { html: articleHtml, nextIdx };
};

const collectSignatureLines = (lines: string[], startIdx: number): { lines: string[]; nextIdx: number } => {
  const signatureLines: string[] = [];
  let j = startIdx;
  while (j < lines.length && j < startIdx + 15) {
    const sigLine = lines[j].trim();
    if (sigLine) {
      signatureLines.push(sigLine);
      j++;
      continue;
    }
    if (!sigLine && signatureLines.length > 0) {
      const nextNonEmpty = lines.slice(j + 1).find(l => l.trim());
      if (nextNonEmpty) {
        const nextTrimmed = nextNonEmpty.trim();
        if (/^\*\*[A-Z]/.test(nextTrimmed) || (/^[A-Z\s]{5,}$/.test(nextTrimmed) && nextTrimmed.split(/\s{3,}/).length >= 2) || nextTrimmed.includes('**')) {
          j++;
          continue;
        }
      }
      if (signatureLines.length >= 3 || (j > startIdx + 3 && !nextNonEmpty)) {
        break;
      }
    }
    j++;
  }
  return { lines: signatureLines, nextIdx: j };
};

const processSignatureLines = (signatureLines: string[]): string => {
  if (signatureLines.length === 0) {
    return '';
  }
  const firstLine = signatureLines[0].replaceAll('**', '').trim();
  const hasBothParties = firstLine.includes('BÊN A') && firstLine.includes('BÊN B');
  
  if (hasBothParties) {
    const parts = firstLine.split(/\s{3,}/);
    let sigAText = parts[0] || firstLine.substring(0, firstLine.indexOf('BÊN B')).trim();
    let sigBText = parts[1] || firstLine.substring(firstLine.indexOf('BÊN B')).trim();
    
    let sigA2 = '';
    let sigB2 = '';
    let sigA3 = '';
    let sigB3 = '';
    
    for (let idx = 1; idx < signatureLines.length; idx++) {
      const currentLine = signatureLines[idx].replaceAll('**', '').trim();
      const lineParts = currentLine.split(/\s{3,}/);
      
      if (lineParts.length >= 2) {
        const partA = lineParts[0]?.trim() || '';
        const partB = lineParts[1]?.trim() || '';
        
        if (partA && partB) {
          if (!sigA2 && !sigB2) {
            sigA2 = partA;
            sigB2 = partB;
          } else if (!sigA3 && !sigB3) {
            sigA3 = partA;
            sigB3 = partB;
          }
        }
      } else if (currentLine && !sigA2 && !sigB2) {
        sigA2 = currentLine;
      }
    }
    
    const finalSigA = [sigAText, sigA2, sigA3].filter(Boolean).map(t => formatInlineEmphasis(escapeHtml(t))).join('<br>');
    const finalSigB = [sigBText, sigB2, sigB3].filter(Boolean).map(t => formatInlineEmphasis(escapeHtml(t))).join('<br>');
    
    return `<div class="contract-signature-container"><div class="contract-signature-a">${finalSigA}</div><div class="contract-signature-b">${finalSigB}</div></div>`;
  } else {
    const sigAText = signatureLines.slice(0, 3).map(l => l.replaceAll('**', '').trim()).filter(Boolean).map(t => formatInlineEmphasis(escapeHtml(t))).join('<br>');
    return `<div class="contract-signature-a">${sigAText}</div>`;
  }
};

const processDaiDienSignature = (lines: string[], startIdx: number, partyType: 'a' | 'b'): { html: string; nextIdx: number } => {
  const signatureBlock = [lines[startIdx]];
  let j = startIdx + 1;
  while (j < lines.length && j < startIdx + 5) {
    if (lines[j].trim()) {
      signatureBlock.push(lines[j].trim());
    } else {
      break;
    }
    j++;
  }
  const signatureText = signatureBlock.join('<br>');
  const className = partyType === 'a' ? 'contract-signature-a' : 'contract-signature-b';
  return { html: formatText(signatureText, className), nextIdx: j };
};

const processDaiDienBoth = (lines: string[], startIdx: number): { html: string; nextIdx: number } => {
  const sigA = processDaiDienSignature(lines, startIdx, 'a');
  const nextLine = sigA.nextIdx < lines.length ? lines[sigA.nextIdx].trim() : '';
  if (PATTERNS.daiDienB.test(nextLine)) {
    const sigB = processDaiDienSignature(lines, sigA.nextIdx, 'b');
    return { html: `<div class="contract-signature-container">${sigA.html}${sigB.html}</div>`, nextIdx: sigB.nextIdx };
  }
  return sigA;
};

export const formatVietnameseLegalContract = (text: string): string => {
  if (!text) {
    return '';
  }

  const lines = text.split('\n');
  const output: string[] = [];
  let i = 0;
  const processedLines = new Set<number>();
  const unprocessedLines: number[] = [];

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      if (i > 0 && lines[i - 1].trim()) {
        output.push('<div class="contract-spacing"></div>');
      }
      processedLines.add(i);
      i++;
      continue;
    }

    if (line === '---' || PATTERNS.separator.test(line)) {
      output.push('<div class="contract-spacing"></div>');
      processedLines.add(i);
      i++;
      continue;
    }

    if (PATTERNS.watermark.test(line)) {
      const watermarkText = line.replaceAll('***', '').trim();
      output.push(`<div class="contract-watermark">${escapeHtml(watermarkText)}</div>`);
      processedLines.add(i);
      i++;
      continue;
    }

    if (PATTERNS.nationalHeader.test(line) || PATTERNS.nationalHeaderAlt.test(line)) {
      const result = processNationalHeader(lines, i);
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    if (PATTERNS.hopDong.test(line) || PATTERNS.hopDongAlt.test(line)) {
      const titleText = line.replace(/^#+\s+/, '').trim();
      output.push(formatText(titleText.toUpperCase(), 'contract-title-main'));
      processedLines.add(i);
      i++;
      continue;
    }

    if (PATTERNS.so.test(line) || PATTERNS.soAlt.test(line)) {
      const numberText = line.replace(/^\*\*Số:\s*/i, '').replace(/\*\*$/, '').replace(/^Số:\s*/i, '').trim();
      output.push(formatText('Số: ' + numberText, 'contract-number-line'));
      processedLines.add(i);
      i++;
      continue;
    }

    if (PATTERNS.canCu.test(line)) {
      const result = processCanCu(lines, i);
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    if (matchesPattern(line, [PATTERNS.benA, PATTERNS.benAAlt, PATTERNS.benASimple, PATTERNS.benASimpleAlt, PATTERNS.benABold])) {
      const result = processParty(lines, i, 'a');
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    if (matchesPattern(line, [PATTERNS.benB, PATTERNS.benBAlt, PATTERNS.benBSimple, PATTERNS.benBSimpleAlt, PATTERNS.benBBold])) {
      const result = processParty(lines, i, 'b');
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    if (PATTERNS.xetRang.test(line)) {
      const result = processWhereas(lines, i);
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    if (PATTERNS.dieu.test(line) || PATTERNS.dieuAlt.test(line) || 
        PATTERNS.dieuAllCaps.test(line) || PATTERNS.dieuAllCapsAlt.test(line) ||
        PATTERNS.dieuBold.test(line) || PATTERNS.dieuBoldAlt.test(line) ||
        PATTERNS.dieuBoldHeader.test(line) || PATTERNS.dieuBoldHeaderAlt.test(line) ||
        /^#+\s*ĐIỀU/i.test(line) || /^ĐIỀU\s+\d+/i.test(line) || /^\*\*ĐIỀU\s+\d+/i.test(line)) {
      const result = processArticle(lines, i);
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    if (PATTERNS.clause.test(line)) {
      const clauseText = line.replace(/^\d+\.\s+/, '');
      output.push(formatText(clauseText, 'contract-clause'));
      processedLines.add(i);
      i++;
      continue;
    }

    if (PATTERNS.item.test(line)) {
      const itemText = line.replace(/^[-*]\s+/, '');
      output.push(formatText(itemText, 'contract-item'));
      processedLines.add(i);
      i++;
      continue;
    }

    const tableResult = line.includes('|') && line.split('|').length >= 3 ? processTable(lines, i) : null;
    if (tableResult) {
      output.push(tableResult.html);
      for (let idx = i; idx < tableResult.nextIdx; idx++) processedLines.add(idx);
      i = tableResult.nextIdx;
      continue;
    }

    if (PATTERNS.daiDien.test(line)) {
      const { lines: signatureLines, nextIdx } = collectSignatureLines(lines, i);
      const html = processSignatureLines(signatureLines);
      if (html) {
        output.push(html);
      }
      for (let idx = i; idx < nextIdx; idx++) processedLines.add(idx);
      i = nextIdx;
      continue;
    }

    if (PATTERNS.daiDienA.test(line)) {
      const result = processDaiDienBoth(lines, i);
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    if (PATTERNS.daiDienB.test(line)) {
      const result = processDaiDienSignature(lines, i, 'b');
      output.push(result.html);
      for (let idx = i; idx < result.nextIdx; idx++) processedLines.add(idx);
      i = result.nextIdx;
      continue;
    }

    output.push(formatText(line, 'contract-paragraph'));
    processedLines.add(i);
    i++;
  }

  for (let idx = 0; idx < lines.length; idx++) {
    if (!processedLines.has(idx) && lines[idx].trim()) {
      unprocessedLines.push(idx);
    }
  }

  if (unprocessedLines.length > 0) {
    console.warn('[formatVietnameseLegalContract] Unprocessed lines:', unprocessedLines.length);
    console.warn('[formatVietnameseLegalContract] Unprocessed line samples:', 
      unprocessedLines.slice(0, 10).map(idx => `${idx}: ${lines[idx].substring(0, 80)}`));
  }

  const result = output.join('');
  const wordPattern = /\S+/g;
  const inputMatches = text.match(wordPattern) || [];
  const inputWordCount = inputMatches.filter(w => !w.match(/^[|*#\-\s]+$/)).length;
  const outputText = result.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const outputMatches = outputText.match(wordPattern) || [];
  const outputWordCount = outputMatches.filter(w => w.trim()).length;
  const wordRatio = inputWordCount > 0 ? (outputWordCount / inputWordCount) : 0;

  console.log('[formatVietnameseLegalContract] Processing summary:', {
    totalLines: lines.length,
    processedLines: processedLines.size,
    unprocessedLines: unprocessedLines.length,
    inputWords: inputWordCount,
    outputWords: outputWordCount,
    wordRatio: wordRatio.toFixed(3),
    coverage: (wordRatio * 100).toFixed(1) + '%'
  });

  if (unprocessedLines.length > 0) {
    console.warn('[formatVietnameseLegalContract] Unprocessed lines:', unprocessedLines.length);
    console.warn('[formatVietnameseLegalContract] Unprocessed line samples:', 
      unprocessedLines.slice(0, 10).map(idx => `${idx}: ${lines[idx]?.substring(0, 80)}`));
  }

  if (wordRatio < 0.95) {
    console.warn('[formatVietnameseLegalContract] WARNING: Low word coverage!');
  }

  console.log('[formatVietnameseLegalContract] Input text:', text);
  console.log('[formatVietnameseLegalContract] Output HTML:', result);

  return result;
};
