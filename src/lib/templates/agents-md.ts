export const agentsTemplate = (
  projectName?: string, 
  setupCommands?: string[], 
  codeStyle?: string[], 
  preferredAgent?: string,
  techStack?: string[]
) => `# AGENTS.md

## Setup commands

${setupCommands?.map(cmd => `- ${cmd}`).join('\n') || '- Install dependencies: `npm install`\n- Start dev server: `npm run dev`\n- Build for production: `npm run build`\n- Run linter: `npm run lint`'}

## Code style

${codeStyle?.map(style => `- ${style}`).join('\n') || '- TypeScript strict mode\n- Single quotes, no semicolons\n- Use functional patterns where possible'}

## Project overview

${projectName ? `This is the ${projectName} project.` : 'A powerful tool that generates essential markdown files for AI development workflows. Get both free template files and AI-generated custom files optimized for your specific project.'}

${preferredAgent ? `## Preferred Agent\n\n- ${preferredAgent}\n` : ''}${techStack && techStack.length > 0 ? `## Technology Stack\n\n${techStack.map(tech => `- ${tech}`).join('\n')}\n` : ''}

Add any additional context that would help AI coding agents work effectively with your project:
- Architecture patterns used
- Key conventions and best practices  
- Security considerations
- Testing guidelines
- Deployment steps
- Common gotchas or important notes

## Testing instructions

- Run all tests: \`npm test\`
- Run specific test: \`npm test -- [test-file-pattern]\`
- Run tests in watch mode: \`npm test -- --watch\`
- Generate coverage report: \`npm run test:coverage\`

## Build and deployment

- Build for production: \`npm run build\`
- Preview production build: \`npm run preview\`
- Deploy: \`npm run deploy\` (or your deployment command)

## Additional instructions

Add any other instructions that would help an AI agent work effectively with your codebase:
- Database setup steps
- Environment variables needed
- External service integrations
- API documentation links
- Design system guidelines
`;

export default agentsTemplate;
