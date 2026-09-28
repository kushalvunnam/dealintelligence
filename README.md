# DealMind

AI Deal Intelligence Agent powered by Hindsight.

## 1. Problem
Sales representatives waste hours manually reviewing old CRM notes, emails, and call transcripts trying to remember specific customer concerns before critical meetings. Standard AI chatbots can't solve this because they suffer from "context amnesia"—they forget everything the moment the chat window closes.

## 2. Solution
DealMind acts as a proactive AI memory system. It automatically extracts key facts from daily sales activities (objections, competitor mentions, pricing pushback) and stores them in a persistent vector memory bank powered by **Hindsight**. When a rep needs to prepare for a call, DealMind instantly recalls the relevant semantic history and uses an LLM to generate a personalized, strategic briefing.

## 3. Key Features
- **Persistent AI Memory**: Silently tracks and categorizes deal history into semantic memory vectors.
- **1-Click Deal Intelligence**: Generates meeting briefs, objection analysis, and competitor strategies instantly.
- **Conversational Assistant**: Chat seamlessly with your historical deal memory.
- **Memory Transparency**: Shows exactly *why* an AI recommendation was made by exposing the raw Hindsight memory fragments used.
- **Learning Impact Dashboard**: Visually tracks how the AI's intelligence improves as the deal matures.

## 4. Architecture

```text
Sales Representative
        ↓
   React Frontend
        ↓
    Express API
        ↓
   AI Deal Agent
   ↙          ↘
MongoDB     Hindsight
  (CRM)         ↓
          Persistent Memory
                ↓
           LLM (OpenAI/Groq)
                ↓
       Deal Intelligence
```

## 5. Technology Stack
- **Frontend**: React, Vite, Tailwind CSS v4, Recharts, Lucide Icons
- **Backend**: Node.js, Express, Helmet (Security), CORS, Rate Limiting
- **Database**: MongoDB (Atlas for Production, memory-server for local dev)
- **AI / Memory**: `@vectorize-io/hindsight-client` for Hindsight persistent memory, `openai` Node SDK

## 6. Hindsight Integration
**Why Hindsight is required:** Without Hindsight, we would have to stuff the entire historical text of a 6-month sales cycle into an LLM context window, which is expensive, slow, and prone to hallucinations. 
**How it works:** DealMind uses Hindsight's `retain()` to map every Deal Activity into a structured `Memory Item` categorized by a specific `bankId` (the Deal's unique ID). When insight is requested, the backend uses `recall()` to selectively pull only the semantically relevant memories needed to answer the prompt.

## 7. AI Workflow
1. User requests "Prepare Meeting".
2. Backend queries Hindsight for the deal's history.
3. Backend merges standard CRM metadata (Company, Stage) with the stringified Hindsight memories.
4. Backend securely prompts the LLM to synthesize the data into a strict JSON schema.
5. The UI renders the parsed JSON along with a "Memory Used" transparency block.

## 8. Demo Workflow
To witness the system in action:
1. Navigate to the **Learning Demo** page.
2. Click **Start Learning Demo**.
3. Watch as the system runs a parallel execution, comparing a standard LLM response (No Memory) with a DealMind response backed by 10 historical Hindsight interactions.

## 9. Installation
```bash
git clone https://github.com/your-username/dealmind.git
cd dealmind

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## 10. Environment Variables
Create `.env` files in both the `server/` and `client/` directories based on the `.env.example` templates.

**Backend (`server/.env`)**
```env
HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key
OPENAI_API_KEY=your_openai_api_key
# GROQ_API_KEY=your_groq_key # Alternative to OpenAI
MONGODB_URI=your_mongodb_atlas_uri
CLIENT_URL=https://your-production-frontend.vercel.app
PORT=5000
NODE_ENV=production
```

**Frontend (`client/.env`)**
```env
VITE_API_BASE_URL=https://your-production-backend.onrender.com/api
```

## 11. Local Development
```bash
# Terminal 1 (Backend)
cd server
npm run dev

# Terminal 2 (Frontend)
cd client
npm run dev
```

## 12. Production Deployment
1. Deploy the `server/` directory to **Render**, supplying the production environment variables.
2. Deploy the `client/` directory to **Vercel**, supplying the `VITE_API_BASE_URL` pointing to Render.
3. Ensure CORS in the backend (`CLIENT_URL`) matches your Vercel domain.

## 13. API Documentation
- `GET /api/health` - Check database and Hindsight connectivity.
- `GET /api/deals` - Retrieve all active deals.
- `GET /api/deals/:id` - Retrieve specific deal metadata.
- `POST /api/deals/:id/activities` - Log a new interaction (Auto-syncs to Hindsight).
- `GET /api/deals/:id/memories` - Retrieve all Hindsight memories for a deal.
- `POST /api/ai/chat` - Chat with deal memory.
- `POST /api/ai/prepare-meeting` - Generate personalized meeting brief.
- `POST /api/ai/analyze-objections` - Analyze historical pricing/technical objections.
- `POST /api/ai/analyze-competitors` - Extract competitor insights.
- `POST /api/ai/patterns` - Dynamically detect recurring themes across a deal's lifetime.
- `POST /api/demo/reset` - (Dev only) Reset and re-seed database.

## 14. Project Structure
- `/client` - React frontend (Vite, Tailwind, Recharts)
- `/server` - Express backend (Mongoose, Hindsight, OpenAI)
- `/docs` - Hackathon presentation and video scripts

## 15. Hackathon Demo
We have included a pre-seeded fictional deal ("ABC Motors") that spans a 42-day sales cycle. The backend is programmed to automatically inject this timeline into your Hindsight memory bank upon first startup to ensure you have a flawless, data-rich demo environment out-of-the-box.

## 16. Future Improvements
- Native Email & Calendar Integration to automatically ingest memories without manual entry.
- Multi-deal comparison logic (e.g., "How did we beat AutoCorp in other deals?").
- Voice-to-text integration for post-meeting debriefs.
