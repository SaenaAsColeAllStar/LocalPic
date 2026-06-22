# LocalPic Converter

Fast, privacy-first image conversion tool that runs entirely in the browser.

Convert PNG, JPG, and other image formats into optimized JPEG files without uploading any data to external servers.

## Live Demo

Add your deployed URL here.

---

## Features

- Client-side image conversion
- PNG → JPEG conversion
- JPG → JPEG conversion
- No server processing required
- Privacy-focused workflow
- Fast browser-based processing
- Responsive interface
- Mobile-friendly experience

---

## Why LocalPic?

Most online image converters upload user files to remote servers.

LocalPic processes images directly inside the browser, meaning:

- Faster conversion
- Better privacy
- No file uploads
- Reduced bandwidth usage
- Works entirely on the client side

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite

### Styling

- Tailwind CSS

### AI Integration

- Google Gemini SDK

### Deployment

- Static Hosting
- Cloudflare Pages
- Vercel
- Netlify

---

## Project Architecture

```text
User Upload
     │
     ▼
Browser Processing
     │
     ▼
Image Conversion
     │
     ▼
JPEG Output
```

All image processing is performed locally inside the user's browser.

No image data is transmitted to external servers.

---

## Use Cases

- Website image optimization
- Content creation workflows
- Digital marketing assets
- Portfolio image preparation
- Social media content

---

## Installation

```bash
npm install
npm run dev
```

---

## Environment Variables

```env
GEMINI_API_KEY=your_api_key
```

---

## Author

Saepul Husna

Frontend Developer & AI-Assisted Full Stack Product Builder

Portfolio:
https://porto.ctos.web.id

GitHub:
https://github.com/SaenaAsColeAllStar
