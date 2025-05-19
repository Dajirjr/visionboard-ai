---
layout: default
title: Weekly Reports
description: Learn how to use AI-powered weekly reports
---

# Weekly Reports

VisionBoard AI's weekly reports feature uses GPT-4 to generate comprehensive summaries of your work.

## Generating Reports

1. Navigate to the "Weekly Report" section
2. Select your date range using the date pickers
3. Configure your summary settings:

### Summary Settings

#### Tone Options
- **Formal**: Professional language suitable for stakeholders
- **Casual**: Conversational tone for team updates
- **Bullet Points**: Concise, scannable format

#### Additional Options
- **TL;DR Section**: Adds a brief overview at the start
- **Task Labels**: Includes categorized task lists

## Report Structure

Each report includes:

1. **TL;DR** (if enabled)
   - Brief 2-3 sentence overview
   - Key highlights

2. **Highlights**
   - Major achievements
   - Important milestones
   - Key decisions

3. **Achievements**
   - Completed tasks
   - Delivered features
   - Resolved issues

4. **Challenges**
   - Blockers encountered
   - Areas needing attention
   - Resource constraints

5. **Next Steps**
   - Upcoming priorities
   - Action items
   - Follow-up tasks

6. **Task Categories** (if enabled)
   - Development
   - Design
   - Documentation
   - Testing
   - DevOps

## Saving Reports

Reports can be saved to:

1. **Supabase Storage**
   - Default storage option
   - Automatic public URL generation
   - Easy sharing capabilities

2. **GitHub Repository**
   - Saves to `/docs/weekly-updates/`
   - Automatic versioning
   - Markdown format

## Best Practices

1. **Date Selection**
   - Use consistent time periods (e.g., Monday-Friday)
   - Avoid overlapping date ranges
   - Consider your team's sprint cycles

2. **Tone Selection**
   - Match your audience's expectations
   - Be consistent across reports
   - Consider your company culture

3. **Content Organization**
   - Use clear section headings
   - Include specific metrics when possible
   - Link to relevant resources

4. **Review Process**
   - Always review AI-generated content
   - Add missing context if needed
   - Verify sensitive information

## Tips for Better Summaries

1. **Be Specific**
   - Include concrete numbers
   - Reference specific projects
   - Mention team members involved

2. **Stay Focused**
   - Keep to the selected time period
   - Prioritize important updates
   - Avoid unnecessary details

3. **Maintain Context**
   - Link to relevant documents
   - Reference previous reports
   - Explain ongoing projects

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter`: Generate summary
- `Ctrl/Cmd + S`: Save report
- `Ctrl/Cmd + C`: Copy to clipboard

## Troubleshooting

Common issues and solutions:

1. **Generation Fails**
   - Check your OpenAI API key
   - Verify your internet connection
   - Try a shorter date range

2. **Save Errors**
   - Confirm storage permissions
   - Check file name conflicts
   - Verify storage quota

3. **Format Issues**
   - Clear browser cache
   - Try a different tone setting
   - Check markdown syntax 