---
layout: default
title: Getting Started
description: Get started with VisionBoard AI
---

# Getting Started with VisionBoard AI

This guide will help you set up and run VisionBoard AI locally.

## Prerequisites

- Node.js 20 or later
- npm 9 or later
- A Supabase account
- An OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dahirjr/vue-ts-pinia-project.git
   cd vue-ts-pinia-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:4173
   ```

## User Roles

VisionBoard AI has three user roles:

| Role    | Permissions                                    |
|---------|-----------------------------------------------|
| Admin   | Full access, can manage users and settings    |
| Editor  | Can create, edit, and delete summaries        |
| User    | Can view and generate summaries               |

## Features

### Weekly Reports

1. Navigate to "Weekly Report" in the sidebar
2. Select your date range
3. Choose your summary settings:
   - Tone (formal, casual, bullet points)
   - Include TL;DR
   - Include task labels
4. Click "Generate with AI"
5. Review and save your summary

### Archive

1. Access your saved summaries in the "Archive" view
2. Use the search bar to find specific summaries
3. Sort by date (newest/oldest)
4. Download or view summaries in your browser

## Next Steps

- Read the [FAQ](./faq.md) for common questions
- Check out our [Roadmap](./roadmap.md)
- Join our community on [GitHub Discussions](https://github.com/dahirjr/vue-ts-pinia-project/discussions)

## Troubleshooting

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables
3. Ensure you have the correct Node.js version
4. Clear your browser cache
5. Check our [GitHub Issues](https://github.com/dahirjr/vue-ts-pinia-project/issues) 