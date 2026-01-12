export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  customData?: Record<string, string>;
}

export interface ContentBlock {
  type: 'watermark' | 'title' | 'number' | 'heading' | 'subheading' | 'article' | 'table' | 'list' | 'paragraph' | 'separator' | 'empty';
  content: string;
}

export interface PdfExportOptions {
  filename: string;
  metadata?: PdfMetadata;
  margin?: [number, number, number, number];
  scale?: number;
  quality?: number;
}

export interface Html2PdfWindow extends Window {
  html2pdf?: any;
}

