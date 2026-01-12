import { ParsedResponse } from '../../types';
import { formatVietnameseLegalContract } from './contractFormatter';

export const buildPdfContent = (data: ParsedResponse): string => {
  console.log('[buildPdfContent] Starting build');
  console.log('[buildPdfContent] Has observedText:', !!data.observedText);
  
  if (data.observedText) {
    console.log('[buildPdfContent] observedText length:', data.observedText.length);
    console.log('[buildPdfContent] observedText preview (first 500 chars):', data.observedText.substring(0, 500));
    console.log('[buildPdfContent] observedText full content:', data.observedText);
    
    const formattedText = formatVietnameseLegalContract(data.observedText);
    console.log('[buildPdfContent] Formatted text length:', formattedText.length);
    console.log('[buildPdfContent] Formatted text preview (last 500 chars):', formattedText.substring(Math.max(0, formattedText.length - 500)));
    console.log('[buildPdfContent] Formatted text full content:', formattedText);
    
    const result = `<div class="pdf-content">${formattedText}</div>`;
    console.log('[buildPdfContent] Final result length:', result.length);
    
    const tableCount = (formattedText.match(/contract-table/g) || []).length;
    const articleCount = (formattedText.match(/contract-article-header/g) || []).length;
    const signatureCount = (formattedText.match(/contract-signature/g) || []).length;
    const paragraphCount = (formattedText.match(/contract-paragraph/g) || []).length;
    const clauseCount = (formattedText.match(/contract-clause/g) || []).length;
    const itemCount = (formattedText.match(/contract-item/g) || []).length;
    
    console.log('[buildPdfContent] Content summary:', {
      tables: tableCount,
      articles: articleCount,
      signatures: signatureCount,
      paragraphs: paragraphCount,
      clauses: clauseCount,
      items: itemCount,
      totalBlocks: tableCount + articleCount + signatureCount + paragraphCount + clauseCount + itemCount
    });
    
    const inputText = data.observedText.replace(/[|*#\-\s]+/g, ' ').replace(/\s+/g, ' ').trim();
    const inputWordCount = inputText.split(/\s+/).filter(w => w.trim() && w.length > 0).length;
    const outputText = formattedText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const outputWordCount = outputText.split(/\s+/).filter(w => w.trim() && w.length > 0).length;
    const wordRatio = inputWordCount > 0 ? (outputWordCount / inputWordCount) : 0;
    
    console.log('[buildPdfContent] Word count comparison:', {
      input: inputWordCount,
      output: outputWordCount,
      ratio: wordRatio.toFixed(2),
      coverage: (wordRatio * 100).toFixed(1) + '%'
    });
    
    if (wordRatio < 0.95) {
      console.warn('[buildPdfContent] WARNING: Word coverage is less than 95%!');
    }
    
    return result;
  }
  
  console.warn('[buildPdfContent] No observedText provided!');
  return '<div class="pdf-content"></div>';
};

