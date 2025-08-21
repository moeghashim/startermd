import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface FileContent {
  filename: string;
  content: string;
}

export const downloadFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadZip = async (files: FileContent[], zipFilename: string = 'ai-dev-tasks.zip') => {
  const zip = new JSZip();
  
  files.forEach(file => {
    zip.file(file.filename, file.content);
  });
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFilename;
  link.click();
  URL.revokeObjectURL(url);
};
