'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, FileText, Zap, GitBranch, CheckSquare, Archive, Plus, X, Settings, User } from 'lucide-react';

import agentsTemplate from '@/lib/templates/agents-md';
import claudeMdTemplate from '@/lib/templates/claude-md';
import createPrdTemplate from '@/lib/templates/create-prd';
import generateTasksTemplate from '@/lib/templates/generate-tasks';
import processTaskListTemplate from '@/lib/templates/process-task-list';
import { downloadFile, downloadZip, FileContent } from '@/lib/file-utils';

export default function HomePage() {
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  const [projectName, setProjectName] = useState('');
  const [preferredAgent, setPreferredAgent] = useState('');
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
      id: 'claude-code',
      name: 'Claude Code',
      url: 'https://docs.anthropic.com/en/docs/claude-code',
      logo: '/logos/claude-code.svg',
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

  const selectedAgent = agents.find(a => a.name === preferredAgent);
  const usesClaudeConfig = selectedAgent?.id === 'claude-code';
  
  const files: FileContent[] = [
    {
      filename: usesClaudeConfig ? 'CLAUDE.md' : 'AGENTS.md',
      content: usesClaudeConfig 
        ? claudeMdTemplate(
            projectName || undefined, 
            mode === 'advanced' ? setupCommands : undefined, 
            mode === 'advanced' ? codeStyle : undefined,
            techStack
          )
        : agentsTemplate(
            projectName || undefined, 
            mode === 'advanced' ? setupCommands : undefined, 
            mode === 'advanced' ? codeStyle : undefined,
            preferredAgent || undefined,
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

  const handleDownloadAll = () => {
    downloadZip(files, 'startermd-files.zip');
  };

  const handleDownloadSingle = (file: FileContent) => {
    downloadFile(file.filename, file.content);
  };

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
                <h1 className="text-2xl font-bold text-slate-900">STARTER.md</h1>
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Generate Essential Files for AI Development
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Get the 4 essential markdown files that supercharge your AI development workflow: 
            configuration files optimized for your agent, plus templates for PRDs, task generation, and task processing.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 justify-center">
              <FileText className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium">Agent Config</span>
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
        </div>

        {/* Configuration Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customize Your AGENTS.md</CardTitle>
                <CardDescription>
                  Personalize your AGENTS.md file with project-specific information
                </CardDescription>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  variant={mode === 'basic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('basic')}
                  className="gap-2 text-xs"
                >
                  <User className="h-3 w-3" />
                  Basic
                </Button>
                <Button
                  variant={mode === 'advanced' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('advanced')}
                  className="gap-2 text-xs"
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
                  {agents.find(a => a.name === preferredAgent)?.supportsAgentsMd 
                    ? 'This agent supports AGENTS.md files.' 
                    : 'This agent uses custom configuration files.'}
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

        {/* Files Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Files</CardTitle>
            <CardDescription>
              Preview and download individual files or get them all at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="grid grid-cols-4 w-full mb-6">
                <TabsTrigger value="agents" className="text-xs">
                  {usesClaudeConfig ? 'CLAUDE.md' : 'AGENTS.md'}
                </TabsTrigger>
                <TabsTrigger value="prd" className="text-xs">PRD Template</TabsTrigger>
                <TabsTrigger value="tasks" className="text-xs">Task Generator</TabsTrigger>
                <TabsTrigger value="process" className="text-xs">Task Processor</TabsTrigger>
              </TabsList>

              {files.map((file, index) => (
                <TabsContent key={file.filename} value={['agents', 'prd', 'tasks', 'process'][index]}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{file.filename}</Badge>
                        <span className="text-sm text-slate-500">
                          {file.content.length} characters
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleDownloadSingle(file)} 
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                    <div className="relative">
                      <Textarea 
                        value={file.content}
                        readOnly
                        className="font-mono text-sm min-h-96"
                      />
                    </div>
                  </div>
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
            STARTER.md - Generate essential files for AI-powered development workflows
          </p>
        </footer>
      </main>
    </div>
  );
}
