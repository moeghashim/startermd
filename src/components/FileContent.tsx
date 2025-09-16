'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Eye, FileText, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FileContentProps {
  filename: string;
  content: string;
  onCopy?: () => void;
  onDownload?: () => void;
  isCopied?: boolean;
}

export function FileContent({ filename, content, onCopy, onDownload, isCopied = false }: FileContentProps) {
  const [viewMode, setViewMode] = useState<'markdown' | 'rendered'>('markdown');
  
  const isMarkdownFile = filename.endsWith('.md');
  const fileExtension = filename.split('.').pop()?.toUpperCase();

  return (
    <div className="space-y-4">
      {/* Header with file info and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{filename}</h3>
          {isMarkdownFile && (
            <div className="flex items-center bg-slate-100 rounded-md p-1">
              <Button
                onClick={() => setViewMode('markdown')}
                size="sm"
                variant={viewMode === 'markdown' ? 'default' : 'ghost'}
                className="h-7 px-2 text-xs gap-1"
              >
                <FileText className="h-3 w-3" />
                Markdown
              </Button>
              <Button
                onClick={() => setViewMode('rendered')}
                size="sm"
                variant={viewMode === 'rendered' ? 'default' : 'ghost'}
                className="h-7 px-2 text-xs gap-1"
              >
                <Eye className="h-3 w-3" />
                Preview
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {onCopy && (
            <Button 
              onClick={onCopy} 
              size="sm"
              variant="outline"
              className={`gap-2 transition-all duration-200 ${
                isCopied ? 'bg-green-50 text-green-700 border-green-200' : ''
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          )}
          {onDownload && (
            <Button 
              onClick={onDownload} 
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="relative">
        {isMarkdownFile && viewMode === 'rendered' ? (
          // Rendered markdown view
          <div className="bg-white border border-slate-200 rounded-md p-6 min-h-96">
            <div className="prose prose-slate max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs prose-pre:bg-slate-50 prose-pre:border prose-code:bg-slate-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          // Raw markdown/text view
          <Textarea 
            value={content}
            readOnly
            className="font-mono text-sm min-h-96 bg-slate-50 border-slate-200 leading-relaxed whitespace-pre-wrap"
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              lineHeight: '1.6'
            }}
          />
        )}
        
        {/* File format badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-xs bg-white/90">
            {viewMode === 'rendered' ? 'Preview' : `${fileExtension} Format`}
          </Badge>
        </div>
      </div>
    </div>
  );
}
