export default function replitMdTemplate(
  projectName?: string,
  setupCommands?: string[],
  codeStyle?: string[],
  techStack?: string[]
): string {
  const name = projectName || 'My Project';
  const setup = setupCommands?.length ? setupCommands : [
    'Install dependencies: `npm install`',
    'Start development server: `npm run dev`',
    'Run tests: `npm test`'
  ];
  const style = codeStyle?.length ? codeStyle : [
    'Use TypeScript for all new JavaScript files',
    'Prefer functional components with hooks over class components',
    'Use consistent naming conventions (camelCase for variables, PascalCase for components)',
    'Include TypeScript types for function parameters and return values'
  ];
  const stack = techStack?.length ? techStack : ['React', 'TypeScript', 'Node.js'];

  return `# replit.md

## Project Overview
${name} is built with modern web technologies focusing on ${stack.join(', ')}. This configuration file helps Replit AI Agent understand the project structure, coding preferences, and development workflow.

## Technology Stack
**Frontend:** ${stack.filter(tech => 
  ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'TypeScript', 'JavaScript'].includes(tech)
).join(', ') || 'Web Technologies'}

**Backend:** ${stack.filter(tech => 
  ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Ruby', 'Rails', 'PHP'].includes(tech)
).join(', ') || 'Server Technologies'}

**Database:** ${stack.filter(tech => 
  ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis', 'Supabase', 'Firebase'].includes(tech)
).join(', ') || 'Data Storage'}

**Package Manager:** npm (prefer npm over yarn or pnpm)

## Setup Commands
${setup.map(command => `- ${command}`).join('\n')}

## Coding Style & Preferences

### General Guidelines
${style.map(guideline => `- ${guideline}`).join('\n')}

### Code Quality
- Write clean, readable, and maintainable code
- Include meaningful comments for complex logic
- Follow consistent indentation and formatting
- Use descriptive variable and function names

### Error Handling
- Implement proper error handling and validation
- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors appropriately for debugging

## Communication Preferences

### Development Approach
- Before implementing changes, explain what you're going to do and why
- Break down complex tasks into clear, manageable steps
- Ask for clarification if requirements are unclear or ambiguous
- Provide brief explanations for technical decisions and trade-offs

### Code Implementation
- Write code that follows the established patterns in the project
- Ensure new features integrate well with existing codebase
- Consider performance implications of implementation choices
- Test functionality before considering tasks complete

## Project Context

### Current Development Phase
- Active development focusing on core features
- Emphasis on code quality and maintainable architecture
- Regular testing and deployment cycles

### Key Priorities
1. User experience and interface design
2. Performance optimization and scalability
3. Security best practices and data protection
4. Comprehensive testing coverage
5. Clear documentation and code comments

## Best Practices

### File Organization
- Keep related files grouped in logical directories
- Use consistent file naming conventions
- Separate concerns (components, utilities, types, etc.)
- Maintain clean import/export patterns

### Dependencies
- Prefer well-maintained, popular packages
- Keep dependencies up to date and security-focused
- Minimize bundle size and avoid unnecessary dependencies
- Document the purpose of major dependencies

### Testing Strategy
- Write unit tests for critical business logic
- Include integration tests for API endpoints
- Test user interactions and edge cases
- Maintain good test coverage without over-testing

## Additional Notes
- This project values clean code, good documentation, and thoughtful architecture
- When in doubt, prioritize readability and maintainability over brevity
- Always consider the user experience when making technical decisions
- Keep security and performance in mind throughout development
`;
}
