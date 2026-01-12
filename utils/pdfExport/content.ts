import { ParsedResponse } from '../../types';
import { escapeHtml, formatSimpleText } from './markdownParser';

export const buildPdfContent = (data: ParsedResponse): string => {
  const parts: string[] = [];

  // Case ID
  if (data.caseId) {
    parts.push(`<h2>Case ID: ${escapeHtml(data.caseId)}</h2>`);
  }

  // Observed Text (main content)
  if (data.observedText) {
    parts.push('<h3>Contract Content</h3>');
    parts.push(`<div class="content">${formatSimpleText(data.observedText)}</div>`);
  }

  // Anomalies
  if (data.anomalies && data.anomalies.length > 0) {
    parts.push('<h3>Anomalies</h3>');
    parts.push('<ul>');
    data.anomalies.forEach(anomaly => {
      parts.push(`<li><strong>${escapeHtml(anomaly.code)}</strong>: ${escapeHtml(anomaly.description)}</li>`);
    });
    parts.push('</ul>');
  }

  // Pass Criteria
  if (data.passCriteria && data.passCriteria.length > 0) {
    parts.push('<h3>Pass Criteria</h3>');
    parts.push('<ul>');
    data.passCriteria.forEach(criteria => {
      parts.push(`<li>${escapeHtml(criteria)}</li>`);
    });
    parts.push('</ul>');
  }

  return `<div class="pdf-content">${parts.join('')}</div>`;
};

