import { ContentBlock } from './types';

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
};

export const escapeHtml = (text: string): string => {
  return text.replace(/[&<>"']/g, (m) => ESCAPE_MAP[m]);
};

const formatMarkdownText = (text: string): string => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
};

export const formatSimpleText = (text: string): string => {
  if (!text) return '';
  
  const lines = text.split('\n');
  const result: string[] = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push('<br>');
      continue;
    }
    
    // Headers
    if (trimmed.startsWith('# ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h1>${escapeHtml(trimmed.substring(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h2>${escapeHtml(trimmed.substring(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      result.push(`<h3>${escapeHtml(trimmed.substring(4))}</h3>`);
      continue;
    }
    
    // Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      const content = formatMarkdownText(escapeHtml(trimmed.substring(2)));
      result.push(`<li>${content}</li>`);
      continue;
    }
    
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        result.push('<ol>');
        inList = true;
      }
      const content = formatMarkdownText(escapeHtml(trimmed.replace(/^\d+\.\s/, '')));
      result.push(`<li>${content}</li>`);
      continue;
    }
    
    // Close list if we hit a paragraph
    if (inList) {
      result.push('</ul>');
      inList = false;
    }
    
    // Regular paragraph
    const formatted = formatMarkdownText(escapeHtml(trimmed));
    result.push(`<p>${formatted}</p>`);
  }
  
  if (inList) {
    result.push('</ul>');
  }
  
  return result.join('');
};

interface TableParseResult {
  table: string;
  nextIdx: number;
}

const parseMarkdownTable = (lines: string[], startIdx: number): TableParseResult => {
  const tableLines: string[] = [];
  let i = startIdx;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === '' || !line.includes('|')) {
      break;
    }
    tableLines.push(line);
    i++;
  }
  
  if (tableLines.length < 2) {
    return { table: '', nextIdx: startIdx };
  }
  
  const parseRow = (row: string): string[] => {
    return row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
  };
  
  const headers = parseRow(tableLines[0]);
  const rows = tableLines.slice(2).map(parseRow);
  
  let tableHtml = '<table><thead><tr>';
  headers.forEach(header => {
    tableHtml += `<th>${formatMarkdownText(header)}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';
  
  rows.forEach(row => {
    tableHtml += '<tr>';
    row.forEach(cell => {
      tableHtml += `<td>${formatMarkdownText(cell)}</td>`;
    });
    tableHtml += '</tr>';
  });
  
  tableHtml += '</tbody></table>';
  
  return { table: tableHtml, nextIdx: i };
};

class ListState {
  private listItems: string[] = [];
  private orderedListItems: string[] = [];

  flushUnorderedList(blocks: ContentBlock[]): void {
    if (this.listItems.length > 0) {
      blocks.push({
        type: 'list',
        content: `<ul class="legal-list">${this.listItems.join('')}</ul>`
      });
      this.listItems = [];
    }
  }

  flushOrderedList(blocks: ContentBlock[]): void {
    if (this.orderedListItems.length > 0) {
      blocks.push({
        type: 'list',
        content: `<ol class="legal-list">${this.orderedListItems.join('')}</ol>`
      });
      this.orderedListItems = [];
    }
  }

  flushAll(blocks: ContentBlock[]): void {
    this.flushUnorderedList(blocks);
    this.flushOrderedList(blocks);
  }

  addUnorderedItem(item: string): void {
    this.listItems.push(`<li>${formatMarkdownText(item)}</li>`);
  }

  addOrderedItem(item: string): void {
    this.orderedListItems.push(`<li>${formatMarkdownText(item)}</li>`);
  }
}

const parseContentBlocks = (text: string): ContentBlock[] => {
  if (!text) return [];
  
  const escaped = escapeHtml(text);
  const lines = escaped.split('\n');
  const blocks: ContentBlock[] = [];
  const listState = new ListState();
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed === '---') {
      listState.flushAll(blocks);
      blocks.push({ type: 'separator', content: '<div style="height: 5px;"></div>' });
      i++;
      continue;
    }
    
    if (trimmed.match(/^\*\*\* .+? \*\*\*$/)) {
      listState.flushAll(blocks);
      const watermarkText = trimmed.replace(/\*\*\*/g, '').trim();
      blocks.push({
        type: 'watermark',
        content: `<div class="watermark">${watermarkText}</div>`
      });
      i++;
      continue;
    }
    
    if (trimmed.match(/^#\s+(.+)$/)) {
      listState.flushAll(blocks);
      const title = trimmed.replace(/^#\s+/, '').trim();
      blocks.push({
        type: 'title',
        content: `<div class="contract-title">${formatMarkdownText(title)}</div>`
      });
      i++;
      continue;
    }
    
    if (trimmed.match(/^\*\*Số:\s*(.+?)\*\*$/)) {
      listState.flushAll(blocks);
      const number = trimmed.replace(/^\*\*Số:\s*/, '').replace(/\*\*$/, '').trim();
      blocks.push({
        type: 'number',
        content: `<div class="contract-number">Số: ${number}</div>`
      });
      i++;
      continue;
    }
    
    if (trimmed.match(/^##\s+(.+)$/)) {
      listState.flushAll(blocks);
      const heading = trimmed.replace(/^##\s+/, '').trim();
      blocks.push({
        type: 'heading',
        content: `<div class="section-heading">${formatMarkdownText(heading)}</div>`
      });
      i++;
      continue;
    }
    
    if (trimmed.match(/^###\s+(.+)$/)) {
      listState.flushAll(blocks);
      const subheading = trimmed.replace(/^###\s+/, '').trim();
      blocks.push({
        type: 'subheading',
        content: `<div class="subsection-heading">${formatMarkdownText(subheading)}</div>`
      });
      i++;
      continue;
    }
    
    if (trimmed.match(/^Điều\s+(\d+)[:\.]?\s*(.+)$/i)) {
      listState.flushAll(blocks);
      blocks.push({
        type: 'article',
        content: `<div class="article-header">${formatMarkdownText(trimmed)}</div>`
      });
      i++;
      continue;
    }
    
    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      listState.flushAll(blocks);
      const tableResult = parseMarkdownTable(lines, i);
      if (tableResult.table) {
        blocks.push({ type: 'table', content: tableResult.table });
        i = tableResult.nextIdx;
        continue;
      }
    }
    
    if (trimmed.match(/^[-*]\s+(.+)$/)) {
      listState.flushOrderedList(blocks);
      const listItem = trimmed.replace(/^[-*]\s+/, '').trim();
      listState.addUnorderedItem(listItem);
      i++;
      continue;
    }
    
    if (trimmed.match(/^\d+\.\s+(.+)$/)) {
      listState.flushUnorderedList(blocks);
      const listItem = trimmed.replace(/^\d+\.\s+/, '').trim();
      listState.addOrderedItem(listItem);
      i++;
      continue;
    }
    
    if (trimmed === '') {
      listState.flushAll(blocks);
      if (blocks.length > 0) {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock.type !== 'separator' && lastBlock.type !== 'empty') {
          blocks.push({ type: 'empty', content: '<br>' });
        }
      }
      i++;
      continue;
    }
    
    listState.flushAll(blocks);
    blocks.push({
      type: 'paragraph',
      content: `<p class="legal-paragraph">${formatMarkdownText(trimmed)}</p>`
    });
    i++;
  }
  
  listState.flushAll(blocks);
  
  return blocks;
};

export const formatLegalTextForPdf = (text: string): string => {
  const blocks = parseContentBlocks(text);
  return blocks.map(block => block.content).join('');
};

