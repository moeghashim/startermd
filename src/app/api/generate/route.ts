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
    
    // Use default tech stack if none provided
    const defaultTechStack = ['React', 'Next.js', 'JavaScript'];
    const finalTechStack = techStack && techStack.length > 0 ? techStack : defaultTechStack;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI development consultant. Generate 6 markdown files for AI development workflows based on the user's project description.

IMPORTANT: Return ONLY a valid JSON object with this exact structure:
{
  "agentsFile": {
    "filename": "AGENTS.md",
    "content": "markdown content here"
  },
  "claudeFile": {
    "filename": "CLAUDE.md",
    "content": "markdown content here"
  },
  "replitFile": {
    "filename": "replit.md",
    "content": "markdown content here"
  },
  "prdFile": {
    "filename": "create-prd.md", 
    "content": "markdown content here"
  },
  "tasksFile": {
    "filename": "generate-tasks.md",
    "content": "markdown content here"
  }
}

Generate these files:

1. **AGENTS.md**: General agent configuration file
   Use this structure:
   - Setup commands (project-specific)
   - Code style (appropriate for the tech stack)  
   - Project overview (describe the specific project)
   - Preferred Agent: ${preferredAgent || 'Not specified'}
   - Technology Stack (based on user input)
   - Testing instructions
   - Build and deployment
   - Additional instructions

2. **CLAUDE.md**: Claude Code specific configuration
   Use this structure:
   - Project Overview (describe the specific project)
   - Technology Stack (based on user input)
   - Setup Commands (project-specific)
   - Code Style Guidelines (appropriate for the tech stack)
   - Development Guidelines
   - Testing Instructions
   - Build and Deployment
   - Additional Context

3. **replit.md**: Replit Agent specific configuration
   Use this structure:
   - Project Overview (describe the specific project)
   - Technology Stack (Frontend, Backend, Database, Package Manager)
   - Setup Commands (project-specific installation and dev commands)
   - Coding Style & Preferences (language preferences, component preferences, styling, type definitions)
   - Communication Preferences (development approach, code implementation)
   - Project Context (current development phase, key priorities)
   - Best Practices (file organization, dependencies, testing strategy)
   - Additional Notes

4. **create-prd.md**: Template for generating Product Requirements Documents
   Keep this as a reusable template but customize examples to match the project domain.

5. **generate-tasks.md**: Template for breaking PRDs into task lists
   Keep this as a reusable template but customize examples to match the project domain.

Project Details:
- Name: ${projectName || 'Not specified'}
- Preferred Agent: ${preferredAgent || 'Not specified'}
- Technology Stack: ${finalTechStack.join(', ')}
- Description: ${prompt}

IMPORTANT: The technology stack is ${finalTechStack.join(', ')}. Make sure all generated configuration reflects this specific technology choice and doesn't suggest alternative technologies unless explicitly mentioned in the project description.

Make the content specific to this project while maintaining the template structure for the workflow files.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
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
