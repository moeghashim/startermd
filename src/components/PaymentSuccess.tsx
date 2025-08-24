'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Download, Sparkles } from 'lucide-react';
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
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Files Generated Successfully!</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your payment has been processed and your custom AI development workflow files are ready for download.
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
          
          <div className="grid grid-cols-2 gap-2">
            {Object.values(generatedFiles).map((file, index) => (
              <Badge key={index} variant="secondary" className="justify-center py-2">
                {file.filename}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleDownloadGenerated} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download Generated Files
            </Button>
            <Button onClick={onBack} variant="outline" className="gap-2">
              Generate New Files
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
