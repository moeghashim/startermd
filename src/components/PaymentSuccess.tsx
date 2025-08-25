'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Download, Sparkles, FileText, Copy } from 'lucide-react';
import { downloadZip, FileContent } from '@/lib/file-utils';

interface GeneratedFile {
  filename: string;
  content: string;
}

interface GeneratedFiles {
  agentsFile: GeneratedFile;
  prdFile: GeneratedFile;
  tasksFile: GeneratedFile;
  processFile: GeneratedFile;
}

interface PaymentSuccessProps {
  sessionId: string;
  onBack: () => void;
}

export default function PaymentSuccess({ sessionId, onBack }: PaymentSuccessProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(null);
  const [error, setError] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<{
    id: string;
    payment_status: string;
    amount_total: number;
    currency: string;
    metadata: {
      prompt: string;
      projectName: string;
      couponCode?: string;
    };
  } | null>(null);

  useEffect(() => {
    generateFiles();
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateFiles = async () => {
    try {
      // First, retrieve the checkout session to get the metadata
      const sessionResponse = await fetch(`/api/get-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to retrieve payment details');
      }

      const sessionData = await sessionResponse.json();
      setPaymentDetails(sessionData);

      // Generate files using the metadata from the payment
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sessionData.metadata.prompt,
          projectName: sessionData.metadata.projectName,
          preferredAgent: 'Claude Code', // Default or from session
          techStack: [], // Default or from session
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate files');
      }

      const { files } = await generateResponse.json();
      setGeneratedFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate files');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadGenerated = () => {
    if (!generatedFiles) return;

    const files: FileContent[] = [
      generatedFiles.agentsFile,
      generatedFiles.prdFile,
      generatedFiles.tasksFile,
      generatedFiles.processFile,
    ];

    downloadZip(files, 'ai-generated-files.zip');
  };

  const handleCopyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here if you want
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (isGenerating) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <CardTitle className="text-blue-800">Payment Successful!</CardTitle>
          </div>
          <CardDescription className="text-blue-700">
            Your payment has been processed. We&apos;re now generating your custom AI files...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-blue-600 animate-pulse" />
              <span className="text-lg font-medium text-blue-800">Generating your files...</span>
            </div>
          </div>
          {paymentDetails && (
            <div className="text-center text-sm text-blue-600">
              Payment: ${(paymentDetails.amount_total / 100).toFixed(2)} • 
              Project: {paymentDetails.metadata.projectName}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Generation Failed</CardTitle>
          <CardDescription className="text-red-700">
            Your payment was successful, but we encountered an error generating your files.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={generateFiles} className="flex-1">
              Try Again
            </Button>
            <Button onClick={onBack} variant="outline">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (generatedFiles) {
    const files = [
      { key: 'agents', file: generatedFiles.agentsFile, icon: FileText },
      { key: 'prd', file: generatedFiles.prdFile, icon: FileText },
      { key: 'tasks', file: generatedFiles.tasksFile, icon: FileText },
      { key: 'process', file: generatedFiles.processFile, icon: FileText },
    ];

    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Files Generated Successfully!</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Your payment has been processed and your custom AI development workflow files are ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentDetails && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div>
                  <div className="font-medium">Payment Completed</div>
                  <div className="text-sm text-gray-600">
                    ${(paymentDetails.amount_total / 100).toFixed(2)} • {paymentDetails.metadata.projectName}
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Paid
                </Badge>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleDownloadGenerated} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download All Files as ZIP
              </Button>
              <Button onClick={onBack} variant="outline" className="gap-2">
                Generate New Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Preview Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle>Your Generated Files</CardTitle>
            </div>
            <CardDescription>
              Preview your custom AI-generated files below. You can copy individual files or download all as a ZIP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-6">
                {files.map(({ key, file }) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {file.filename}
                  </TabsTrigger>
                ))}
              </TabsList>

              {files.map(({ key, file }) => (
                <TabsContent key={key} value={key}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{file.filename}</Badge>
                        <span className="text-sm text-slate-500">
                          {file.content.length} characters
                        </span>
                      </div>
                      <Button
                        onClick={() => handleCopyToClipboard(file.content)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Content
                      </Button>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={file.content}
                        readOnly
                        className="font-mono text-sm min-h-96 resize-none"
                        placeholder="File content will appear here..."
                      />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
