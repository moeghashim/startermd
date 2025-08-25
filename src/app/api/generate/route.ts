import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { updateStats } from '@/lib/stats';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'AI generation not configured' },
        { status: 500 }
      );
    }

    const { prompt, projectName, preferredAgent, techStack } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI development consultant. Generate 4 markdown files for AI development workflows based on the user's project description.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "agentsFile": {
    "filename": "${preferredAgent === 'Claude Code' ? 'CLAUDE.md' : preferredAgent === 'Replit' ? 'replit.md' : 'STARTER.md'}",
    "content": "markdown content here"
  },
  "prdFile": {
    "filename": "create-prd.md", 
    "content": "markdown content here"
  },
  "tasksFile": {
    "filename": "generate-tasks.md",
    "content": "markdown content here"
  },
  "processFile": {
    "filename": "process-task-list.md",
    "content": "markdown content here"
  }
}

Generate these files:

1. **${preferredAgent === 'Claude Code' ? 'CLAUDE.md' : preferredAgent === 'Replit' ? 'replit.md' : 'STARTER.md'}**: Project-specific configuration
   ${preferredAgent === 'Claude Code' ? `
   Use this structure:
   - Project Overview (describe the specific project)
   - Technology Stack (based on user input)
   - Setup Commands (project-specific)
   - Code Style Guidelines (appropriate for the tech stack)
   - Development Guidelines
   - Testing Instructions
   - Build and Deployment
   - Additional Context
   ` : preferredAgent === 'Replit' ? `
   Use this structure for replit.md:
   - Project Overview (describe the specific project)
   - Technology Stack (Frontend, Backend, Database, Package Manager)
   - Setup Commands (project-specific installation and dev commands)
   - Coding Style & Preferences (language preferences, component preferences, styling, type definitions)
   - Communication Preferences (development approach, code implementation)
   - Project Context (current development phase, key priorities)
   - Best Practices (file organization, dependencies, testing strategy)
   - Additional Notes
   ` : `
   Use this structure:
   - Setup commands (project-specific)
   - Code style (appropriate for the tech stack)  
   - Project overview (describe the specific project)
   - Preferred Agent: ${preferredAgent || 'Not specified'}
   - Technology Stack (based on user input)
   - Testing instructions
   - Build and deployment
   - Additional instructions
   `}

2. **create-prd.md**: Template for generating Product Requirements Documents
   Keep this as a reusable template but customize examples to match the project domain.

3. **generate-tasks.md**: Template for breaking PRDs into task lists
   Keep this as a reusable template but customize examples to match the project domain.

4. **process-task-list.md**: Template for managing task execution
   Keep this as a reusable template.

Project Details:
- Name: ${projectName || 'Not specified'}
- Preferred Agent: ${preferredAgent || 'Not specified'}
- Technology Stack: ${techStack?.join(', ') || 'Not specified'}
- Description: ${prompt}

Make the content specific to this project while maintaining the template structure for the workflow files.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano", // GPT-5 nano for enhanced performance
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      reasoning_effort: "medium", // GPT-5 reasoning parameter
      verbosity: "medium", // GPT-5 response length parameter
    });

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const generatedFiles = JSON.parse(response);

    // Track stats (don't await to avoid slowing down the response)
    updateStats(preferredAgent || 'Unknown').catch(error => {
      console.error('Stats tracking error:', error);
    });

    return NextResponse.json({ files: generatedFiles });
  } catch (error) {
    console.error('OpenAI generation error:', error);
    
    // Log more details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    // Check if it's a JSON parsing error
    if (errorMessage.includes('JSON')) {
      console.error('JSON parsing failed - AI response might not be valid JSON');
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate files',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
