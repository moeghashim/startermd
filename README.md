# STARTER.md

A powerful tool that generates essential markdown files for AI development workflows. Get both free template files and AI-generated custom files optimized for your specific project.

## 🌟 Features

### Free Features
- **Agent Configuration Files**: Generate AGENTS.md or CLAUDE.md based on your preferred coding agent
- **Basic Customization**: Project name, technology stack, and agent selection
- **Template Downloads**: Get all 4 essential workflow files:
  - Agent configuration (AGENTS.md/CLAUDE.md)
  - PRD creation template (create-prd.md)
  - Task generation template (generate-tasks.md)
  - Task processing template (process-task-list.md)

### AI-Powered Generation ($5)
- **Custom File Generation**: AI analyzes your project description and generates tailored files
- **Project-Specific Content**: Templates filled with examples relevant to your domain
- **Optimized Configuration**: Setup commands, code style, and guidelines specific to your tech stack
- **GPT-4 Powered**: Advanced AI understanding of your project requirements

## 🚀 Live Demo

Visit [STARTER.md](https://startermd-8m7tn61v3-bannaa.vercel.app) to try it out!

## 🛠 Tech Stack

- **Frontend**: TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Integration**: OpenAI GPT-4
- **Payments**: Stripe
- **Deployment**: Vercel

## 📋 Supported Agents

- **Cursor** (AGENTS.md)
- **Amp** (AGENTS.md) 
- **Jules** (AGENTS.md)
- **RooCode** (AGENTS.md)
- **Codex** (AGENTS.md)
- **Factory** (AGENTS.md)
- **Claude Code** (CLAUDE.md - custom configuration)

## 🔧 Development Setup

1. Clone the repository:
```bash
git clone https://github.com/moeghashim/startermd.git
cd startermd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your API keys:
- `OPENAI_API_KEY`: Your OpenAI API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 API Endpoints

- `POST /api/generate` - Generate custom files using AI
- `POST /api/create-payment-intent` - Create Stripe payment intent

## 🎯 Based On

This project builds upon the excellent work from:
- [agents.md](https://agents.md) - The AGENTS.md format specification
- [ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks) - Structured AI development workflow templates

## 👤 Author

Built by [@moeghashim](https://x.com/moeghashim)

## 📄 License

MIT License - feel free to use and modify for your own projects!
