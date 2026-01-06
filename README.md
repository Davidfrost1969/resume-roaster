# Resume Roaster

AI-powered resume analysis tool that provides brutally honest feedback to help job seekers improve their resumes.

## Features

- Upload PDF, DOCX, or TXT resumes
- Instant AI analysis powered by Claude
- Brutally honest "roast" feedback
- Overall score out of 100
- Top 3 actionable fixes
- Red flags identification
- Premium upgrade options

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add your Anthropic API key in `src/ResumeRoaster.jsx`:
```javascript
'x-api-key': 'YOUR_API_KEY_HERE'
```

3. Run locally:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## Deployment

This app is ready to deploy on Vercel, Netlify, or any static hosting service.

For Vercel:
1. Push to GitHub
2. Connect repository in Vercel
3. Deploy!

## Tech Stack

- React 18
- Tailwind CSS
- Lucide React (icons)
- Anthropic Claude API
