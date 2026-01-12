export interface PdfTextContent {
  text: string;
  pages: string[];
}

export const readPdfFile = async (file: File): Promise<PdfTextContent> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error("PDF.js library not loaded. Please include pdf.js in your HTML."));
          return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const pages: string[] = [];
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          pages.push(pageText);
          fullText += pageText + '\n\n';
        }

        resolve({
          text: fullText.trim(),
          pages
        });
      } catch (error: any) {
        reject(new Error(`Failed to parse PDF: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const readPdfFromUrl = async (url: string): Promise<PdfTextContent> => {
  const pdfjsLib = (window as any).pdfjsLib;
  if (!pdfjsLib) {
    throw new Error("PDF.js library not loaded. Please include pdf.js in your HTML.");
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    
    const pages: string[] = [];
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      pages.push(pageText);
      fullText += pageText + '\n\n';
    }

    return {
      text: fullText.trim(),
      pages
    };
  } catch (error: any) {
    throw new Error(`Failed to parse PDF from URL: ${error.message}`);
  }
};

export const extractPdfMetadata = async (file: File): Promise<Record<string, any>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }

        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          reject(new Error("PDF.js library not loaded"));
          return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const metadata = await pdf.getMetadata();
        
        resolve({
          numPages: pdf.numPages,
          info: metadata.info || {},
          metadata: metadata.metadata || {}
        });
      } catch (error: any) {
        reject(new Error(`Failed to extract PDF metadata: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

