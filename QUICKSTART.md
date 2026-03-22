# 🚀 Quick Start Guide

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. First-Time Model Download

On first launch, the app will download AI models:

- **LFM2-350M** (~250MB) - Text generation model
- Models are cached in your browser's OPFS storage
- This is a one-time download - works offline afterward

---

## Using the App

### Command Palette (⌘K / Ctrl+K)

Press `⌘K` (Mac) or `Ctrl+K` (Windows/Linux) to open the command palette and quickly navigate between modules.

### Module Overview

#### 1. ✍️ Writing Assistant
- Select a writing mode (Email, Document, Blog, Creative)
- Type your content or use "Generate" to create with AI
- Click "Transform Tone" to rewrite in different styles
- Select text and click "Expand" or "Compress" for AI edits
- Toggle "Show Insights" for readability metrics

#### 2. 📓 Notes
- Click "New Note" to create a note
- AI auto-tags notes when you save
- Use search to find notes by content
- Click "Summarize" to generate a TL;DR
- Related notes appear automatically

#### 3. 📄 Document Research
- Click "Upload Documents" to add PDFs/TXT files
- Select documents you want to query
- Ask questions in natural language
- Get AI answers with document references
- Click "Summarize" on any document

#### 4. 🎙️ Meeting Transcription
- Click "Start Recording" to begin
- Type or paste meeting notes
- Click "Complete Meeting" when done
- AI extracts action items automatically
- View past meetings in the list

#### 5. 💻 Code Documentation
- Select programming language
- Choose analysis type (Explain, Document, Review, Test)
- Paste your code
- Click "Analyze" for AI insights

#### 6. 🌍 Language Learning
- Select target language and proficiency level
- Choose practice mode (Conversation, Grammar, Vocabulary)
- Chat with the AI in your target language
- Get instant feedback and corrections

#### 7. 🔒 Privacy Dashboard
- View storage statistics
- Check network status (Online/Air-Gap mode)
- Export/Import all your data
- See downloaded AI models
- Clear all data if needed

---

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

---

## Deployment

### Vercel (Recommended)

```bash
npx vercel --prod
```

The included `vercel.json` already sets the required headers.

### Other Hosts

Make sure your server sends these headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

---

## Troubleshooting

### Models Not Downloading
- Check browser console for errors
- Ensure you have a stable internet connection
- Try clearing browser cache and reload
- Check available disk space (models need ~500MB total)

### App Not Working Offline
- Ensure models are fully downloaded first
- Check that all models show "downloaded" status
- Clear browser cache if switching between versions

### Slow Performance
- Use Chrome/Edge 120+ for WebGPU acceleration
- Check "Privacy Dashboard" → should show "WebGPU" badge
- Close other browser tabs to free RAM
- Smaller models (LFM2-350M) are faster than larger ones

### Network Requests Showing
- Some initial requests are normal (model download)
- After models download, all inference is local
- Verify in Privacy Dashboard (should show Air-Gap mode when offline)

---

## Browser Compatibility

| Browser | Version | WebGPU | Status |
|---|---|---|---|
| Chrome | 120+ | ✅ | Recommended |
| Edge | 120+ | ✅ | Recommended |
| Firefox | 119+ | ❌ | Works (CPU-only) |
| Safari | 17+ | ❌ | Limited OPFS support |

---

## Privacy Guarantees

✅ **All AI runs locally in WebAssembly**  
✅ **No data sent to external servers**  
✅ **Works 100% offline after model download**  
✅ **No analytics or tracking**  
✅ **Data stored only in your browser**  

Verify by opening DevTools → Network tab → should be silent after model download.

---

## Support

For issues or questions:
1. Check the [README.md](README.md) for detailed information
2. Review the troubleshooting section above
3. Open an issue on GitHub
4. Check RunAnywhere SDK docs: https://docs.runanywhere.ai

---

**Built with ❤️ for the RunAnywhere SDK Hackathon**
