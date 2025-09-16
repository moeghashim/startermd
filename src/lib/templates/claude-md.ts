export const claudeMdTemplate = (
  projectName?: string, 
  setupCommands?: string[], 
  codeStyle?: string[], 
  techStack?: string[]
) => `# Project Configuration for Claude Code

## Project Overview

${projectName ? `This is the ${projectName} project.` : 'A powerful tool that generates essential markdown files for AI development workflows. Get both free template files and AI-generated custom files optimized for your specific project.'}

${techStack && techStack.length > 0 ? `## Technology Stack

${techStack.map(tech => `- ${tech}`).join('\n')}
` : ''}

## Setup Commands

${setupCommands?.map(cmd => `- ${cmd}`).join('\n') || '- Install dependencies: `npm install`\n- Start development server: `npm run dev`\n- Build for production: `npm run build`\n- Run linter: `npm run lint`'}

## Code Style Guidelines

${codeStyle?.map(style => `- ${style}`).join('\n') || '- TypeScript strict mode\n- Single quotes, no semicolons\n- Use functional patterns where possible'}

## Development Guidelines

- Follow existing architectural patterns
- Write comprehensive tests for new features
- Maintain consistent code formatting
- Document complex business logic
- Handle errors gracefully with proper error messages

## Testing Instructions

- Run all tests: \`npm test\`
- Run specific test: \`npm test -- [test-file-pattern]\`
- Generate coverage report: \`npm run test:coverage\`
- Run linting: \`npm run lint\`

## Build and Deployment

- Build for production: \`npm run build\`
- Preview production build: \`npm run preview\`
- Type checking: \`npm run type-check\`

## Additional Context

Add any project-specific information that would help with development:
- Environment variables and configuration
- Database schemas and migrations
- API endpoints and documentation
- External service integrations
- Known issues or limitations
`;

export default claudeMdTemplate;
