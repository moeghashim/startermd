'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Zap, GitBranch, CheckSquare, Archive, Plus, X, Settings, User, Sparkles, Download } from 'lucide-react';

import agentsTemplate from '@/lib/templates/agents-md';
import claudeMdTemplate from '@/lib/templates/claude-md';
import replitMdTemplate from '@/lib/templates/replit-md';
import createPrdTemplate from '@/lib/templates/create-prd';
import generateTasksTemplate from '@/lib/templates/generate-tasks';
import processTaskListTemplate from '@/lib/templates/process-task-list';
import { downloadFile, downloadZip, FileContent as FileContentType } from '@/lib/file-utils';
import AIGeneration from '@/components/AIGeneration';
import PaymentSuccess from '@/components/PaymentSuccess';
import { Separator } from '@/components/ui/separator';
import { FileContent } from '@/components/FileContent';

export default function HomePage() {
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  const [projectName, setProjectName] = useState('');
  const [preferredAgent, setPreferredAgent] = useState('Cursor');
  const [techStack, setTechStack] = useState<string[]>(['React', 'TypeScript', 'Next.js']);
  const [newTech, setNewTech] = useState('');
  const [setupCommands, setSetupCommands] = useState([
    'Install deps: `npm install`',
    'Start dev server: `npm run dev`',
    'Run tests: `npm test`'
  ]);
  const [codeStyle, setCodeStyle] = useState([
    'TypeScript strict mode',
    'Single quotes, no semicolons',
    'Use functional patterns where possible'
  ]);
  const [paymentStatus, setPaymentStatus] = useState<'none' | 'success' | 'canceled'>('none');
  const [sessionId, setSessionId] = useState<string>('');
  const [copiedFile, setCopiedFile] = useState<string>('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      setPaymentStatus('success');
      setSessionId(urlParams.get('session_id') || '');
    } else if (urlParams.get('canceled')) {
      setPaymentStatus('canceled');
    }
  }, []);

  const agents = [
    {
      id: 'cursor',
      name: 'Cursor',
      url: 'https://cursor.com',
      logo: '/logos/cursor-light.svg',
      supportsAgentsMd: true
    },
    {
      id: 'amp',
      name: 'Amp',
      url: 'https://ampcode.com',
      logo: '/logos/amp.svg',
      supportsAgentsMd: true
    },
    {
      id: 'jules',
      name: 'Jules',
      url: 'https://jules.google',
      logo: '/logos/jules.svg',
      supportsAgentsMd: true
    },
    {
      id: 'roocode',
      name: 'RooCode',
      url: 'https://roocode.com',
      logo: '/logos/roocode.svg',
      supportsAgentsMd: true
    },
    {
      id: 'codex',
      name: 'Codex',
      url: 'https://openai.com/codex/',
      logo: '/logos/codex.svg',
      supportsAgentsMd: true
    },
    {
      id: 'factory',
      name: 'Factory',
      url: 'https://factory.ai',
      logo: '/logos/factory.svg',
      supportsAgentsMd: true
    },
    {
      id: 'aider',
      name: 'Aider',
      url: 'https://aider.chat',
      logo: '/logos/aider.svg',
      supportsAgentsMd: true
    },
    {
      id: 'gemini-cli',
      name: 'Gemini CLI',
      url: 'https://ai.google.dev/gemini-api/docs/cli',
      logo: '/logos/gemini.svg',
      supportsAgentsMd: true
    },
    {
      id: 'open-code',
      name: 'Open Code',
      url: 'https://github.com/features/copilot',
      logo: '/logos/opencode.svg',
      supportsAgentsMd: true
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      url: 'https://docs.anthropic.com/en/docs/claude-code',
      logo: '/logos/claude-code.svg',
      supportsAgentsMd: false
    },
    {
      id: 'replit',
      name: 'Replit',
      url: 'https://docs.replit.com/replitai/replit-dot-md',
      logo: '/logos/replit.svg',
      supportsAgentsMd: false
    }
  ];

  const addTechnology = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };


  
  const files: FileContentType[] = [
    {
      filename: 'AGENTS.md',
      content: agentsTemplate(
        projectName || undefined, 
        mode === 'advanced' ? setupCommands : undefined, 
        mode === 'advanced' ? codeStyle : undefined,
        preferredAgent || undefined,
        techStack
      )
    },
    {
      filename: 'CLAUDE.md',
      content: claudeMdTemplate(
        projectName || undefined, 
        mode === 'advanced' ? setupCommands : undefined, 
        mode === 'advanced' ? codeStyle : undefined,
        techStack
      )
    },
    {
      filename: 'replit.md',
      content: replitMdTemplate(
        projectName || undefined, 
        mode === 'advanced' ? setupCommands : undefined, 
        mode === 'advanced' ? codeStyle : undefined,
        techStack
      )
    },
    {
      filename: 'create-prd.md',
      content: createPrdTemplate()
    },
    {
      filename: 'generate-tasks.md',
      content: generateTasksTemplate()
    },
    {
      filename: 'process-task-list.md',
      content: processTaskListTemplate()
    }
  ];

  const handleDownloadAll = async () => {
    downloadZip(files, 'startermd-files.zip');
    
    // Track stats for free download (non-blocking)
    try {
      const data = new Blob([JSON.stringify({ agent: preferredAgent || 'Unknown' })], { type: 'application/json' });
      navigator.sendBeacon('/api/stats', data);
    } catch (error) {
      console.error('📊 Failed to track download stats:', error);
    }
  };

  const handleDownloadSingle = async (file: FileContentType) => {
    downloadFile(file.filename, file.content);
    
    // Track stats for single file download (non-blocking)
    try {
      const data = new Blob([JSON.stringify({ agent: preferredAgent || 'Unknown' })], { type: 'application/json' });
      navigator.sendBeacon('/api/stats', data);
    } catch (error) {
      console.error('📊 Failed to track single file download stats:', error);
    }
  };

  const handleCopyToClipboard = async (content: string, filename: string) => {
    try {
      // Ensure proper line endings for markdown
      const formattedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      await navigator.clipboard.writeText(formattedContent);
      setCopiedFile(filename);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedFile(''), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedFile(filename);
      setTimeout(() => setCopiedFile(''), 2000);
    }
  };

  const handleBackToHome = () => {
    setPaymentStatus('none');
    setSessionId('');
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Show payment success page if payment was successful
  if (paymentStatus === 'success' && sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">STARTERMD.com</h1>
                  <p className="text-sm text-slate-600">AI development workflow files generator</p>
                </div>
              </div>
              <div className="flex gap-2">
              <Button onClick={handleBackToHome} variant="outline">
              Back to Home
              </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <PaymentSuccess sessionId={sessionId} onBack={handleBackToHome} />
        </main>
      </div>
    );
  }

  // Show canceled message if payment was canceled
  if (paymentStatus === 'canceled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">STARTERMD.com</h1>
                  <p className="text-sm text-slate-600">AI development workflow files generator</p>
                </div>
              </div>
              <Button onClick={handleBackToHome} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="border-orange-200 bg-orange-50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-orange-800">Payment Canceled</CardTitle>
              <CardDescription className="text-orange-700">
                Your payment was canceled. You can try again or use the free templates below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleBackToHome} className="w-full">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">STARTERMD.com</h1>
                <p className="text-sm text-slate-600">AI development workflow files generator</p>
              </div>
            </div>
            <Button onClick={handleDownloadAll} size="sm" className="gap-2">
              <Archive className="h-4 w-4" />
              Download All Files
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Accessibility live region for copy feedback */}
        <div className="sr-only" aria-live="polite">
          {copiedFile && `${copiedFile} copied to clipboard`}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Generate Essential Files for AI Development
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Get 6 essential markdown files that supercharge your AI development workflow: 
            configuration files for all major agents (AGENTS.md, CLAUDE.md, replit.md), plus templates for PRDs, task generation, and task processing.
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm text-slate-600 mb-8">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Free</Badge>
              <span>Template files with basic customization</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-purple-200 text-purple-700">$5 one-time</Badge>
              <span>AI-generated files for your specific project</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-2 justify-center">
              <FileText className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">AGENTS.md</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <FileText className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">CLAUDE.md</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <FileText className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">replit.md</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <GitBranch className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">PRD Template</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CheckSquare className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">Task Generator</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Zap className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">Task Processor</span>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="gap-2 text-base px-8"
              onClick={() => document.getElementById('ai-generation')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Sparkles className="h-5 w-5" />
              Generate with AI ($5)
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="gap-2 text-base px-8"
              onClick={() => document.getElementById('free-templates')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Download className="h-5 w-5" />
              Download Free Templates
            </Button>
          </div>

          {/* How it Works */}
          <div className="mt-12 bg-white rounded-lg border p-6 max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-center mb-6">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white mx-auto mb-3">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Choose Your Agent</h4>
                <p className="text-sm text-slate-600">Select your preferred coding agent from our supported list</p>
              </div>
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white mx-auto mb-3">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Add Project Details</h4>
                <p className="text-sm text-slate-600">Optionally customize with project name, tech stack, and commands</p>
              </div>
              <div className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white mx-auto mb-3">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">Download or Generate</h4>
                <p className="text-sm text-slate-600">Get free templates instantly or generate custom files with AI</p>
              </div>
            </div>
          </div>

        </div>

        {/* Configuration Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customize Your Agent Configuration Files</CardTitle>
                <CardDescription>
                  Personalize all agent configuration files with project-specific information
                </CardDescription>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  variant={mode === 'basic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('basic')}
                  className="gap-2 text-xs"
                  aria-pressed={mode === 'basic'}
                >
                  <User className="h-3 w-3" />
                  Basic
                </Button>
                <Button
                  variant={mode === 'advanced' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('advanced')}
                  className="gap-2 text-xs"
                  aria-pressed={mode === 'advanced'}
                >
                  <Settings className="h-3 w-3" />
                  Advanced
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Name (optional)</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Agent</label>
              <Select value={preferredAgent} onValueChange={setPreferredAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred coding agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.name}>
                      <div className="flex items-center gap-2">
                        <span>{agent.name}</span>
                        {!agent.supportsAgentsMd && (
                          <Badge variant="outline" className="text-xs">
                            Custom Config
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preferredAgent && (
                <p className="text-xs text-slate-500 mt-2">
                  All agent configuration files (AGENTS.md, CLAUDE.md, replit.md) will be generated for maximum compatibility.
                </p>
              )}
            </div>

            {mode === 'advanced' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Technology Stack</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        placeholder="Add technology (e.g., React, Node.js)"
                        onKeyDown={(e) => e.key === 'Enter' && addTechnology()}
                      />
                      <Button onClick={addTechnology} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="gap-1">
                          {tech}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => removeTechnology(tech)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Setup Commands</label>
                  <Textarea
                    value={setupCommands.join('\n')}
                    onChange={(e) => setSetupCommands(e.target.value.split('\n').filter(Boolean))}
                    placeholder="Install deps: `npm install`&#10;Start dev server: `npm run dev`"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Code Style Guidelines</label>
                  <Textarea
                    value={codeStyle.join('\n')}
                    onChange={(e) => setCodeStyle(e.target.value.split('\n').filter(Boolean))}
                    placeholder="TypeScript strict mode&#10;Single quotes, no semicolons"
                    rows={4}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Generation Section */}
        <div id="ai-generation" className="space-y-6 scroll-mt-20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold">Generate Custom Files with AI</h2>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto mb-2">
              Want files tailored specifically to your project? Our AI can analyze your project description and generate custom configuration and workflow files optimized for your use case.
            </p>
            <p className="text-sm text-slate-500">One-time payment. Delivered instantly. No account required.</p>
          </div>

          <AIGeneration 
            projectName={projectName}
            preferredAgent={preferredAgent}
            techStack={techStack}
          />
        </div>

        <div className="flex items-center gap-4 my-8">
          <Separator className="flex-1" />
          <Badge variant="outline" className="px-4 py-2">Or use free templates below</Badge>
          <Separator className="flex-1" />
        </div>

        {/* Files Preview */}
        <Card id="free-templates" className="scroll-mt-20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Free Template Files</h2>
                <Badge variant="secondary">Free</Badge>
              </div>
              <Button onClick={handleDownloadAll} className="gap-2">
                <Download className="h-4 w-4" />
                Download all (.zip)
              </Button>
            </div>
            <CardDescription>
              Preview and download template files with your basic customizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="w-full mb-6 overflow-x-auto flex sm:grid sm:grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="agents" className="text-xs">AGENTS.md</TabsTrigger>
                <TabsTrigger value="claude" className="text-xs">CLAUDE.md</TabsTrigger>
                <TabsTrigger value="replit" className="text-xs">replit.md</TabsTrigger>
                <TabsTrigger value="prd" className="text-xs">PRD Template</TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs">Task Generator</TabsTrigger>
                <TabsTrigger value="process" className="text-xs">Task Processor</TabsTrigger>
              </TabsList>

              {files.map((file, index) => (
                <TabsContent key={file.filename} value={['agents', 'claude', 'replit', 'prd', 'tasks', 'process'][index]}>
                <FileContent
                filename={file.filename}
                content={file.content}
                onCopy={() => handleCopyToClipboard(file.content, file.filename)}
                onDownload={() => handleDownloadSingle(file)}
                  isCopied={copiedFile === file.filename}
                   />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-500 space-y-2">
          <p className="text-sm">
            Based on <a href="https://agents.md" className="underline hover:text-slate-700">agents.md</a> format and{' '}
            <a href="https://github.com/snarktank/ai-dev-tasks" className="underline hover:text-slate-700">ai-dev-tasks</a> templates
          </p>
          <p className="text-xs">
            Built by <a href="https://x.com/moeghashim" className="underline hover:text-slate-700" target="_blank" rel="noopener noreferrer">@moeghashim</a>
          </p>
          <p className="text-xs">
            STARTERMD.com - Generate essential files for AI-powered development workflows
          </p>
          <p className="text-xs mt-2">
            <a href="https://github.com/moeghashim/startermd" className="underline hover:text-slate-700" target="_blank" rel="noopener noreferrer">Fork this app on GitHub</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
