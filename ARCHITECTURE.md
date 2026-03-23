# NovaMind Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript Frontend                                   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │  Landing   │  │    Auth    │  │ Dashboard  │  │   Navbar   │ │  │
│  │  │    Page    │  │  Modal     │  │  Router    │  │  Command   │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         7 APPLICATION MODULES                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Writing  │ │  Notes   │ │Document  │ │ Meeting  │ │ Language │    │
│  │Assistant │ │  Module  │ │ Research │ │  Trans   │ │ Learning │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐                                             │
│  │   Code   │ │Knowledge │                                             │
│  │  Engine  │ │  Graph   │                                             │
│  └──────────┘ └──────────┘                                             │
└─────────────────────────────────────────────────────────────────────────┘
       │                                │                        │
       │ RunAnywhere SDK                │ Backend API            │ IndexedDB
       │ (Local AI)                     │ (Data Sync)            │ (Offline)
       ▼                                ▼                        ▼
┌─────────────────┐          ┌──────────────────────┐   ┌──────────────┐
│  AI MODELS      │          │   BACKEND SERVER     │   │   LOCAL      │
│  (WebGPU/WASM)  │          │   Node.js + Express  │   │  STORAGE     │
│                 │          │                      │   │              │
│ • LFM2 350M/1.2B│          │  ┌────────────────┐  │   │ • IndexedDB  │
│ • LFM2-VL 450M  │◄─────────┤  │  Auth Routes   │  │   │ • OPFS       │
│ • Whisper Tiny  │          │  │  /api/auth     │  │   │ • LocalStor  │
│ • Piper TTS     │          │  └────────────────┘  │   │              │
│ • Silero VAD    │          │  ┌────────────────┐  │   │              │
│                 │          │  │ Module Routes  │  │   │              │
│ Stored in OPFS  │          │  │ /api/notes     │  │   │              │
└─────────────────┘          │  │ /api/writing   │  │   │              │
                             │  │ /api/documents │  │   │              │
                             │  │ /api/meetings  │  │   │              │
                             │  │ /api/language  │  │   │              │
                             │  │ /api/code      │  │   │              │
                             │  │ /api/knowledge │  │   │              │
                             │  │ /api/profile   │  │   │              │
                             │  └────────────────┘  │   │              │
                             │           │          │   │              │
                             │           ▼          │   │              │
                             │  ┌────────────────┐  │   │              │
                             │  │   Middleware   │  │   │              │
                             │  │  • JWT Auth    │  │   │              │
                             │  │  • Error Handle│  │   │              │
                             │  │  • CORS        │  │   │              │
                             │  └────────────────┘  │   │              │
                             └──────────┬───────────┘   └──────────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │    MONGODB DATABASE   │
                             │                      │
                             │  ┌───────────────┐  │
                             │  │ Users         │  │
                             │  │ Notes         │  │
                             │  │ WritingDocs   │  │
                             │  │ Documents     │  │
                             │  │ Meetings      │  │
                             │  │ LanguageProg  │  │
                             │  │ CodeSnippets  │  │
                             │  │ KnowledgeNode │  │
                             │  └───────────────┘  │
                             │                      │
                             │  8 Collections       │
                             │  Indexed & Optimized │
                             └──────────────────────┘
```

## Data Flow Diagrams

### Authentication Flow
```
┌──────┐     1. Login/Signup      ┌──────────┐
│ User │ ────────────────────────► │ Backend  │
└──────┘                           │ /api/auth│
   ▲                               └────┬─────┘
   │                                    │
   │                                    │ 2. Verify credentials
   │                                    │    Query MongoDB
   │                                    ▼
   │                               ┌─────────┐
   │ 4. Store token                │ MongoDB │
   │    + user data                │  Users  │
   │                               └────┬────┘
   │                                    │
   │                                    │ 3. Return JWT token
   │                                    │    + user data
   │                                    ▼
   │ ◄──────────────────────────── ┌──────────┐
   └───────────────────────────────┤ Response │
                                   └──────────┘
```

### AI Processing Flow (100% Local)
```
┌──────┐   1. User input        ┌──────────────┐
│ User │ ──────────────────────► │ Module UI    │
└──────┘                         └──────┬───────┘
   ▲                                    │
   │                                    │ 2. Call generateText()
   │                                    ▼
   │                             ┌──────────────┐
   │                             │ ai-utils.ts  │
   │                             └──────┬───────┘
   │                                    │
   │                                    │ 3. Load model if needed
   │                                    ▼
   │                             ┌──────────────┐
   │                             │ RunAnywhere  │
   │                             │    SDK       │
   │                             └──────┬───────┘
   │                                    │
   │                                    │ 4. Inference on
   │                                    │    WebGPU/WASM
   │                                    ▼
   │                             ┌──────────────┐
   │ 6. Display result           │  AI Model    │
   │    (streaming)              │  (OPFS)      │
   │                             └──────┬───────┘
   │                                    │
   │                                    │ 5. Generate tokens
   │                                    │    (streaming)
   │                                    ▼
   └────────────────────────────  ┌──────────────┐
                                  │   Result     │
                                  └──────────────┘

NOTE: No network requests! Everything happens in the browser.
```

### Document Save Flow
```
┌──────┐  1. Save document      ┌──────────────┐
│ User │ ──────────────────────► │ Module UI    │
└──────┘                         └──────┬───────┘
                                        │
                                        │ 2. api.post('/writing')
                                        │    with JWT token
                                        ▼
                                 ┌──────────────┐
                                 │ Backend API  │
                                 │ /api/writing │
                                 └──────┬───────┘
                                        │
                                        │ 3. Verify JWT token
                                        ▼
                                 ┌──────────────┐
                                 │ Auth         │
                                 │ Middleware   │
                                 └──────┬───────┘
                                        │
                                        │ 4. Save to database
                                        ▼
                                 ┌──────────────┐
                                 │   MongoDB    │
                                 │ WritingDocs  │
                                 └──────┬───────┘
                                        │
                                        │ 5. Return saved doc
                                        ▼
┌──────┐  ◄───────────────────── ┌──────────────┐
│ User │  7. Update UI           │   Response   │
└──────┘                         └──────────────┘
   ▲                                    │
   │                                    │
   │ 6. Also cache locally              │
   │    in IndexedDB                    │
   └────────────────────────────────────┘
```

### Knowledge Graph Generation Flow
```
┌─────────────┐
│  All Modules│
│  Generate   │
│  Content    │
└──────┬──────┘
       │
       │ Whenever content is created/updated
       ▼
┌─────────────────┐
│  Backend API    │
│  Module routes  │
└──────┬──────────┘
       │
       │ Trigger AI analysis
       ▼
┌─────────────────┐
│  AI Analysis    │
│  • Extract      │
│    concepts     │
│  • Find         │
│    similarities │
│  • Detect       │
│    relationships│
└──────┬──────────┘
       │
       │ Create/update nodes
       ▼
┌─────────────────┐
│  MongoDB        │
│  KnowledgeNode  │
│  Collection     │
└──────┬──────────┘
       │
       │ Query graph data
       ▼
┌─────────────────┐
│  Knowledge      │
│  Graph UI       │
│  (D3.js)        │
└──────┬──────────┘
       │
       │ Interactive visualization
       ▼
┌─────────────────┐
│  User sees      │
│  connected      │
│  knowledge      │
└─────────────────┘
```

## Technology Stack Details

### Frontend Technologies
```
┌────────────────────────────────────────┐
│  React 19                              │
│  • Hooks: useState, useEffect, useRef  │
│  • Router: react-router-dom v7        │
│  • Context: For global state           │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  TypeScript 5.6                        │
│  • Strict mode enabled                 │
│  • Complete type coverage              │
│  • Interface definitions               │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  RunAnywhere SDK                       │
│  • LlamaCPP backend (LLM/VLM)          │
│  • ONNX backend (STT/TTS/VAD)          │
│  • WebGPU acceleration                 │
│  • WebAssembly fallback                │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  Supporting Libraries                  │
│  • D3.js v7 - Graph visualization      │
│  • Fuse.js - Fuzzy search              │
│  • pdfjs-dist - PDF processing         │
│  • idb - IndexedDB wrapper             │
└────────────────────────────────────────┘
```

### Backend Technologies
```
┌────────────────────────────────────────┐
│  Node.js + Express 5                   │
│  • RESTful API design                  │
│  • JSON payload handling               │
│  • CORS enabled                        │
│  • Health monitoring                   │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  MongoDB + Mongoose                    │
│  • Schema validation                   │
│  • Indexing for performance            │
│  • Population for relationships        │
│  • Text search indexes                 │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  Authentication                        │
│  • JWT tokens (7-day expiry)           │
│  • bcrypt password hashing             │
│  • Auth middleware                     │
│  • Secure routes                       │
└────────────────────────────────────────┘
```

### AI Models
```
┌────────────────────────────────────────┐
│  Language Models (LlamaCPP)            │
│  • LFM2 350M Q4_K_M   → ~250 MB        │
│  • LFM2 1.2B Tool     → ~800 MB        │
│  • LFM2-VL 450M       → ~500 MB        │
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│  Speech Models (ONNX/Sherpa)           │
│  • Whisper Tiny EN    → ~105 MB        │
│  • Piper TTS Lessac   → ~65 MB         │
│  • Silero VAD v5      → ~5 MB          │
└────────────────────────────────────────┘
```

## Security Architecture

```
┌──────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                      │
├──────────────────────────────────────────────────────┤
│  1. Authentication                                    │
│     • JWT tokens with 7-day expiry                   │
│     • bcrypt hashing (10 rounds)                     │
│     • Authorization headers                          │
├──────────────────────────────────────────────────────┤
│  2. Data Validation                                   │
│     • Mongoose schema validation                     │
│     • Type checking (TypeScript)                     │
│     • Input sanitization                             │
├──────────────────────────────────────────────────────┤
│  3. Privacy Protection                                │
│     • All AI processing local (no cloud)             │
│     • No telemetry or analytics                      │
│     • Optional AES-256 encryption                    │
│     • User data isolation (userId filtering)         │
├──────────────────────────────────────────────────────┤
│  4. Network Security                                  │
│     • CORS configuration                             │
│     • HTTPS in production                            │
│     • Environment variables for secrets              │
│     • No hardcoded credentials                       │
└──────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
Production Environment:

┌─────────────────┐         ┌──────────────────┐
│    Vercel       │         │   Railway/Render │
│   (Frontend)    │◄───────►│    (Backend)     │
│                 │  HTTPS  │                  │
│  • Static CDN   │         │  • Node.js       │
│  • Auto-scaling │         │  • Auto-restart  │
│  • Edge network │         │  • Health checks │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     │ Encrypted
                                     │ Connection
                                     ▼
                            ┌─────────────────┐
                            │  MongoDB Atlas  │
                            │   (Database)    │
                            │                 │
                            │  • Replica set  │
                            │  • Auto-backup  │
                            │  • Monitoring   │
                            └─────────────────┘
```

## Module Integration Map

```
                    ┌─────────────────┐
                    │   Command       │
                    │   Palette       │
                    │   (Cmd/Ctrl+K)  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌──────▼──────┐    ┌─────▼─────┐
    │  Writing  │     │    Notes    │    │ Document  │
    │ Assistant │     │   Module    │    │ Research  │
    └─────┬─────┘     └──────┬──────┘    └─────┬─────┘
          │                  │                  │
          └──────────┬───────┴───────┬──────────┘
                     │               │
              ┌──────▼───────┐  ┌────▼──────┐
              │  Knowledge   │  │ Meeting   │
              │    Graph     │  │   Trans   │
              └──────┬───────┘  └────┬──────┘
                     │               │
          ┌──────────┴───────┬───────┴──────┐
          │                  │              │
    ┌─────▼─────┐     ┌──────▼──────┐  ┌───▼────┐
    │ Language  │     │    Code     │  │Privacy │
    │ Learning  │     │   Engine    │  │  Dash  │
    └───────────┘     └─────────────┘  └────────┘

All modules share:
• AI utilities library
• Backend API client
• Storage management
• Theme system
• Navigation
```

---

## Performance Characteristics

### Frontend Performance
- **Bundle Size:** <500 KB (excluding AI models)
- **First Paint:** <1 second
- **Time to Interactive:** <2 seconds
- **Model Download:** 2-5 minutes (one-time)
- **Token Generation:** 10-30 tokens/second

### Backend Performance
- **API Response Time:** <100ms (local), <500ms (cloud)
- **Database Queries:** <50ms (indexed)
- **Concurrent Users:** 100+ (single instance)
- **Scalability:** Horizontal (multiple instances)

### Storage Requirements
- **AI Models:** 250 MB - 1.5 GB (OPFS)
- **User Data:** ~10-50 MB per user (MongoDB)
- **Cache:** ~50 MB (IndexedDB)
- **Total:** ~500 MB - 2 GB per user

---

This architecture provides:
✅ Scalability - Horizontal and vertical
✅ Performance - Fast AI, cached data
✅ Privacy - Local processing, encrypted storage
✅ Reliability - Error handling, auto-recovery
✅ Maintainability - Modular design, typed code
