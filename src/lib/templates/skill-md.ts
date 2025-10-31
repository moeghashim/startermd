export const skillMdTemplate = (
  skillName?: string,
  projectName?: string,
  techStack?: string[],
  setupCommands?: string[]
) => {
  const sanitizedSkillName = skillName 
    ? skillName.toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 64)
    : 'project-helper';

  const description = projectName
    ? `Helper for ${projectName} development tasks. Use when working with ${techStack?.join(', ') || 'this project'} or when the user needs project-specific guidance.`
    : 'Helper for development tasks. Use when the user needs project-specific guidance, setup help, or development workflow assistance.';

  return `---
name: ${sanitizedSkillName}
description: ${description}
---

# ${projectName || 'Project'} Development Helper

## Instructions

This skill provides project-specific guidance and helps with common development tasks.

### Project Setup

${setupCommands?.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n') || `1. Install dependencies: \`npm install\`
2. Start development server: \`npm run dev\`
3. Run tests: \`npm test\`
4. Build for production: \`npm run build\``}

${techStack && techStack.length > 0 ? `### Technology Stack

This project uses:
${techStack.map(tech => `- **${tech}**`).join('\n')}

When helping with development:
- Follow best practices for each technology
- Use the appropriate package managers and tooling
- Refer to official documentation when needed
` : ''}

### Development Workflow

1. **Before starting work:**
   - Pull the latest changes
   - Check for any dependency updates
   - Review open issues or tasks

2. **During development:**
   - Write tests alongside new features
   - Follow the project's code style
   - Keep commits atomic and well-described

3. **Before committing:**
   - Run linting and type checking
   - Ensure all tests pass
   - Review your changes

### Common Tasks

**Running the application:**
\`\`\`bash
npm run dev
\`\`\`

**Running tests:**
\`\`\`bash
npm test
\`\`\`

**Building for production:**
\`\`\`bash
npm run build
\`\`\`

**Linting and formatting:**
\`\`\`bash
npm run lint
\`\`\`

### Best Practices

- Write clear, self-documenting code
- Add comments for complex logic
- Use meaningful variable and function names
- Handle errors gracefully
- Keep functions small and focused
- Follow SOLID principles where applicable

### Troubleshooting

**Common issues and solutions:**

1. **Dependency issues:**
   - Delete \`node_modules\` and package lock file
   - Run \`npm install\` again
   - Check for version conflicts

2. **Build errors:**
   - Check for type errors
   - Verify all imports are correct
   - Clear build cache if needed

3. **Test failures:**
   - Check test environment setup
   - Verify mock data is correct
   - Ensure tests are isolated

## Examples

### Example 1: Adding a new feature

\`\`\`bash
# Create a new branch
git checkout -b feature/new-feature

# Make your changes
# ...

# Run tests
npm test

# Run linting
npm run lint

# Commit changes
git add .
git commit -m "feat: add new feature"
\`\`\`

### Example 2: Debugging an issue

\`\`\`bash
# Check logs
npm run dev

# Run specific test
npm test -- path/to/test

# Use debugger
# Add breakpoints and use your IDE's debugger
\`\`\`

### Example 3: Preparing for deployment

\`\`\`bash
# Run all checks
npm run lint
npm test
npm run build

# Review build output
# Verify environment variables
# Test production build locally
\`\`\`

## Additional Resources

For more information, refer to:
- Project README.md
- AGENTS.md for AI development guidelines
- CLAUDE.md for Claude-specific configuration
- Project documentation in /docs (if available)
`;
};

export default skillMdTemplate;
