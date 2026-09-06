const fs = require('fs');

const code = `import express from "express";
import path from "path";
import multer from "multer";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import fsUtils from "fs";
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';

// Initialize Gemini SDK
let aiClient = null;
function getAi() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  const upload = multer({ storage: multer.memoryStorage() });

  // 1. Process Complaint (Multimodal Audio/Image)
  app.post("/api/process-complaint", upload.single("file"), async (req, res) => {
    try {
      const ai = getAi();
      const { city, lat, lng, input_type, text_content } = req.body;
      const file = req.file;

      let promptContent = "You are an expert AI Civil Engineering & Governance analyst for Infra.ai. Analyze the incoming citizen input. Extract and return a JSON-like text containing: 1. category (e.g., Water Supply, Road & Transport, Power Grid, Drainage) 2. urgency_score (1 to 10) 3. english_summary (crisp 2-sentence summary) 4. recommended_structural_fix (what civil structure is needed).";

      if (text_content) {
          promptContent += \`\\nCitizen Input Text: \${text_content}\`;
      }

      if (file) {
          promptContent += \`\\n[Attached Multimodal Media File: \${file.originalname}]\`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: promptContent,
      });

      res.json({
        status: "success",
        processed_location: { city, lat, lng },
        ai_analysis: response.text
      });

    } catch (error) {
      console.error("Process complaint error:", error);
      res.status(500).json({ detail: error.message });
    }
  });

  // 2. Get Hotspots
  app.get("/api/hotspots", async (req, res) => {
    res.json({
      status: "success",
      hotspot_clusters: [
        {
            cluster_id: "CLS-IND-01",
            center: { lat: 22.7196, lng: 75.8577 },
            radius_km: 4.5,
            complaint_count: 1420,
            risk_level: "Critical"
        },
        {
            cluster_id: "CLS-SAG-02",
            center: { lat: 23.8388, lng: 78.7378 },
            radius_km: 3.0,
            complaint_count: 680,
            risk_level: "High"
        }
      ]
    });
  });

  // 3. Generate Tender
  app.post("/api/generate-tender", async (req, res) => {
    try {
      const ai = getAi();
      const { city_name, issue_category, total_complaints, suggested_structure } = req.body;

      const tenderPrompt = \`Draft a formal government civil engineering tender document for \${city_name}. Issue Category: \${issue_category}. Total Citizen Requests Backing This: \${total_complaints}. Required Proposed Structure: \${suggested_structure}. Include sections for: Project Scope, Estimated Concrete Volume (m3), Estimated Steel Rebar (Tons), Execution Timeline, and Financial Budget Allocation under standard Indian public infrastructure norms.\`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: tenderPrompt
      });

      res.json({
        status: "success",
        city: city_name,
        tender_document: response.text
      });

    } catch (error) {
      console.error("Generate tender error:", error);
      res.status(500).json({ detail: error.message });
    }
  });

  // 4. Auth test route
  app.post("/api/auth/register", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { uid, email } = req.user;
      const user = await getOrCreateUser(uid, email || '');
      res.json({ success: true, user });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: error.message || "Failed to register" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = createServer(app);
  
  // WebSocket Server for Live API (gemini-3.1-flash-live-preview)
  const wss = new WebSocketServer({ server: httpServer, path: '/live' });
  
  wss.on("connection", async (clientWs) => {
    try {
      const ai = getAi();
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a voice assistant for a digital public infrastructure platform in India. You help citizens report issues like potholes, waterlogging, or electrical hazards. Ask them for details step by step. Keep answers very brief.",
        },
        callbacks: {
          onmessage: (message) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("WS Message Error:", e);
        }
      });
      
      clientWs.on("close", () => {
        // cleanup session if needed
      });
    } catch (e) {
      console.error("Live API Connect Error:", e);
      clientWs.send(JSON.stringify({ error: "Failed to connect to Live API" }));
    }
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
  });
}

startServer().catch(console.error);
`;

fs.writeFileSync('server.ts', code);
console.log('done');
