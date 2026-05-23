import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./db";

// Routes
import authRoutes from "./routes/auth";
import mascotRoutes from "./routes/mascot";
import wellnessRoutes from "./routes/wellness";
import journalRoutes from "./routes/journals";
import chatRoutes from "./routes/chats";
import exerciseRoutes from "./routes/exercises";
import calendarRoutes from "./routes/calendar";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "SereneMind API", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/mascot", mascotRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/calendar", calendarRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function bootstrap() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n[API] SereneMind API running at http://localhost:${PORT}`);
    console.log(`[Health] Health check: http://localhost:${PORT}/health\n`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;
