'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CreditCard, Download, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { downloadZip, FileContent } from '@/lib/file-utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AIGenerationProps {
  projectName: string;
  preferredAgent: string;
  techStack: string[];
}

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

export default function AIGeneration({ projectName, preferredAgent, techStack }: AIGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(null);
  const [error, setError] = useState('');

  const handlePayAndGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a project description');
      return;
    }

    setIsProcessingPayment(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          projectName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      // Note: clientSecret would be used with Stripe Elements in production
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // For demo purposes, we'll simulate a successful payment
      // In production, you'd use Stripe Elements for real payment processing
      const mockPaymentResult = { error: null };

      if (mockPaymentResult.error) {
        setError('Payment failed. Please try again.');
        return;
      }

      // Payment successful, now generate files
      setIsProcessingPayment(false);
      setIsGenerating(true);

      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          projectName,
          preferredAgent,
          techStack,
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate files');
      }

      const { files } = await generateResponse.json();
      setGeneratedFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessingPayment(false);
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

  if (generatedFiles) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Files Generated Successfully!</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Your custom AI development workflow files are ready for download.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Button 
              variant="outline" 
              onClick={() => setGeneratedFiles(null)}
              className="gap-2"
            >
              Generate New Files
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle>AI-Powered File Generation</CardTitle>
          <Badge variant="outline" className="ml-auto">$5</Badge>
        </div>
        <CardDescription>
          Get all 4 files custom-generated for your specific project using AI. 
          Describe your project and we&apos;ll create tailored configuration and workflow files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Project Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your project in detail... e.g., 'A React-based e-commerce platform with Next.js, TypeScript, and Stripe integration. Users can browse products, add to cart, and checkout. We need authentication, product management, and order processing.'"
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Be specific about your project&apos;s purpose, features, and technical requirements for best results.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium text-sm">What you&apos;ll get:</h4>
          <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Custom {preferredAgent === 'Claude Code' ? 'CLAUDE.md' : 'AGENTS.md'} optimized for your tech stack</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>PRD template with examples from your domain</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Task generation template customized for your project type</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Process management template for your workflow</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePayAndGenerate}
          disabled={!prompt.trim() || isProcessingPayment || isGenerating}
          className="w-full gap-2"
          size="lg"
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Files...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay $5 & Generate Custom Files
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Secure payment processing powered by Stripe. One-time payment of $5.
        </p>
      </CardContent>
    </Card>
  );
}
