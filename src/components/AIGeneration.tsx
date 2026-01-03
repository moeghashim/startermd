'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CreditCard, Download, CheckCircle, Tag } from 'lucide-react';
import { downloadZip, FileContent } from '@/lib/file-utils';

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
}

interface CouponData {
  id: string;
  name: string | null;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
}

interface PricingData {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export default function AIGeneration({ projectName, preferredAgent, techStack }: AIGenerationProps) {
  const [prompt, setPrompt] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [pricing, setPricing] = useState<PricingData>({
    originalAmount: 500,
    discountAmount: 0,
    finalAmount: 500,
  });
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(null);
  const [error, setError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setError('');

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate coupon');
      }

      setAppliedCoupon(data.coupon);
      setPricing(data.pricing);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid coupon code');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setPricing({
      originalAmount: 500,
      discountAmount: 0,
      finalAmount: 500,
    });
    setError('');
  };

  const handlePayAndGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a project description');
      return;
    }

    setIsProcessingPayment(true);
    setError('');

    try {
      // Create Stripe Checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          projectName,
          preferredAgent,
          techStack,
          couponCode: appliedCoupon?.id,
          finalAmount: pricing.finalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessingPayment(false);
    }
  };

  const handleDownloadGenerated = () => {
    if (!generatedFiles) return;

    const files: FileContent[] = [
      generatedFiles.agentsFile,
      generatedFiles.prdFile,
      generatedFiles.tasksFile,
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
          <div className="ml-auto flex items-center gap-2">
            {appliedCoupon && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                {appliedCoupon.percent_off 
                  ? `${appliedCoupon.percent_off}% off` 
                  : `$${(appliedCoupon.amount_off! / 100).toFixed(2)} off`}
              </Badge>
            )}
            <Badge variant="outline" className={pricing.finalAmount < pricing.originalAmount ? "line-through opacity-60" : ""}>
              ${(pricing.originalAmount / 100).toFixed(2)}
            </Badge>
            {pricing.finalAmount < pricing.originalAmount && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                ${(pricing.finalAmount / 100).toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Get all 3 files custom-generated for your specific project using AI. 
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
            placeholder="Describe your project in detail... e.g., 'A React-based e-commerce platform with TypeScript and Stripe integration. Users can browse products, add to cart, and checkout. We need authentication, product management, and order processing.'"
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Be specific about your project&apos;s purpose, features, and technical requirements for best results.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-600" />
            <label className="text-sm font-medium">
              Coupon Code <span className="text-slate-400">(optional)</span>
            </label>
          </div>
          
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                disabled={isValidatingCoupon}
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isValidatingCoupon}
                variant="outline"
                size="default"
              >
                {isValidatingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  {appliedCoupon.name || `Coupon ${appliedCoupon.id}`} applied
                </span>
                <Badge variant="secondary" className="text-xs">
                  Save ${(pricing.discountAmount / 100).toFixed(2)}
                </Badge>
              </div>
              <Button
                onClick={handleRemoveCoupon}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800 hover:bg-green-100"
              >
                Remove
              </Button>
            </div>
          )}
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
              <span>Custom {preferredAgent === 'Claude Code' ? 'CLAUDE.md' : preferredAgent === 'Replit' ? 'replit.md' : 'AGENTS.md'} optimized for your tech stack</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>PRD template with examples from your domain</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Task generation template customized for your project type</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handlePayAndGenerate}
          disabled={!prompt.trim() || isProcessingPayment}
          className="w-full gap-2"
          size="lg"
        >
          {isProcessingPayment ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to Payment...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Pay ${(pricing.finalAmount / 100).toFixed(2)} & Generate Custom Files
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          Secure payment processing powered by Stripe. One-time payment of ${(pricing.finalAmount / 100).toFixed(2)}.
        </p>
      </CardContent>
    </Card>
  );
}
