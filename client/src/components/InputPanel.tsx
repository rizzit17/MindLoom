import React, { useState, useId, useRef } from 'react';
import { FileText, AlertTriangle, Loader2, ArrowRight, Upload, FileCheck, X, FileUp } from 'lucide-react';

interface InputPanelProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaId = useId();

  const charCount = text.length;
  const tokenEstimate = Math.ceil(charCount / 4);
  const isTooShort = text.trim().length > 0 && text.trim().length < 20;
  const isTruncated = charCount > 12000;
  const isDisabled = isLoading || isExtracting || text.trim().length === 0 || isTooShort;

  const handleFileProcess = async (file: File) => {
    setIsExtracting(true);
    setFileName(file.name);

    try {
      let extractedText = '';

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let pageTexts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .filter(Boolean)
            .join(' ');
          if (pageText.trim()) {
            pageTexts.push(pageText);
          }
        }
        extractedText = pageTexts.join('\n\n');
      } else {
        // Plain text, Markdown, CSV, JSON, Log, etc.
        extractedText = await file.text();
        // Clean non-printable characters for raw document binary imports if any
        extractedText = extractedText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
      }

      if (extractedText.trim()) {
        setText(extractedText.trim());
      } else {
        alert('Could not extract readable text from the uploaded file.');
        setFileName(null);
      }
    } catch (error) {
      console.error('Failed to parse file text:', error);
      alert(`Error reading file '${file.name}'. Please ensure it contains unencrypted text or standard PDF pages.`);
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleClearFile = () => {
    setFileName(null);
    setText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDisabled) {
      onGenerate(text);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-surface border-[1.5px] border-border shadow-[3px_3px_0px_var(--border)] rounded-[4px] p-5 font-mono flex flex-col gap-4 transition-all ${
        isDragOver ? 'ring-2 ring-accent bg-accent/5' : ''
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.doc,.docx,.csv,.json,.log,.pptx,.xlsx"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between border-b border-border pb-3 gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-display font-bold tracking-tight text-ink">
            Source Document & Notes
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {fileName && (
            <div className="flex items-center gap-1.5 text-xs font-mono bg-accent/15 border border-accent/40 text-accent px-2.5 py-1 rounded-[3px]">
              <FileCheck className="w-3.5 h-3.5" />
              <span className="font-bold max-w-[180px] truncate">{fileName}</span>
              <button
                type="button"
                onClick={handleClearFile}
                className="hover:text-red-500 p-0.5 ml-1 transition-colors"
                title="Clear uploaded file"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isExtracting}
            className="studio-btn px-2.5 py-1 text-xs font-mono flex items-center gap-1.5 text-ink hover:border-accent"
            title="Upload PDF, TXT, MD, DOCX, PPTX, or CSV document"
          >
            {isExtracting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-accent" />
            )}
            <span>Upload Document</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-ink/70">
            <span>{charCount} / 12,000 chars</span>
            <span className="bg-bg border border-border px-2 py-0.5 rounded-[3px] text-ink font-medium">
              ~{tokenEstimate} tokens
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            id={textareaId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading || isExtracting}
            placeholder="Paste your document/notes text here, or click 'Upload Document' (PDF, TXT, MD, DOCX, CSV) or drop files directly into this box..."
            className="w-full h-36 p-3.5 border-[1.5px] border-border bg-white dark:bg-[#121215] text-zinc-950 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none text-xs font-semibold leading-relaxed font-mono rounded-[4px]"
          />

          {isDragOver && (
            <div className="absolute inset-0 bg-surface/95 border-2 border-dashed border-accent rounded-[4px] flex flex-col items-center justify-center gap-2 text-accent font-mono z-10">
              <FileUp className="w-8 h-8 animate-bounce" />
              <span className="text-xs font-bold font-display uppercase tracking-wider">
                Drop your document file here to extract notes
              </span>
            </div>
          )}

          {isTruncated && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-[3px] font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Input exceeds 12,000 chars and will be truncated</span>
            </div>
          )}
        </div>

        {isTooShort && (
          <p className="text-xs text-accent font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Please enter at least 20 characters for meaningful mindmap extraction.
          </p>
        )}

        <div className="flex items-center justify-between gap-4 mt-1">
          <div className="text-[11px] text-ink/60 font-mono hidden md:block">
            Supports: <span className="font-semibold text-accent">PDF, TXT, Markdown (.md), DOCX, CSV, JSON</span>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="studio-btn-primary px-5 py-2 text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap ml-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Generating Mindmap...</span>
              </>
            ) : (
              <>
                <span>Generate Mindmap</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
