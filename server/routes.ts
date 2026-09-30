import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pool } from "./db";
import { insertGameProgressSchema, insertUserAnswerSchema, insertSentenceSchema } from "@shared/schema";
import { z } from "zod";
import p2pPaymentsRouterModule from "./routes/p2p-payments";
const p2pPaymentsRouter = (p2pPaymentsRouterModule as any).default || p2pPaymentsRouterModule;
 
// Blacklist for difficult letters - exclude from letter generation
const BLACKLISTED_LETTERS = ['Ъ'];
 
// Retry wrapper for database operations
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error?.code === 'ECONNREFUSED' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'CONNECTION_ENDED' ||
        error?.message?.includes('Connection terminated') ||
        error?.message?.includes('timeout');
 
      if (attempt < retries && isRetryable) {
        console.warn(`DB retry attempt ${attempt + 1}/${retries}:`, error.message);
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Retry exhausted');
}
 
export async function registerRoutes(app: Express): Promise<Server> {

  // ─── P2P платежи на карту («Поддержать служение проекта») ─────────
  app.use("/api/p2p", p2pPaymentsRouter);

  // === AUTHENTICATION API ===
  // ⚠️ ПРАВКА: вся регистрация/вход/Google-вход/сброс пароля/выбор
  // уровня доступа удалены вместе с системой авторизации — сайт
  // полностью открыт, аккаунт пользователю больше не нужен.

  // Get available words
  app.get("/api/words", async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=120');
      const sessionId = req.query.sessionId as string || 'default-session';
      const getAllWords = req.query.all === 'true';
      const language = req.query.lang as string | undefined;
 
      if (language) {
        const wordsWithTranslations = await withRetry(() => storage.getAllWordsWithTranslations(language));
        return res.json(wordsWithTranslations);
      }
 
      const words = await withRetry(() =>
        getAllWords ? storage.getAllWords() : storage.getAvailableWords(sessionId)
      );
      res.json(words);
    } catch (error) {
      console.error("Error fetching words:", error);
      res.status(500).json({ message: "Failed to fetch words" });
    }
  });
 
  app.get("/api/words/:id", async (req, res) => {
    try {
      const language = req.query.lang as string | undefined;
      if (language) {
        const wordWithTranslation = await storage.getWordWithTranslation(req.params.id, language);
        if (!wordWithTranslation) {
          return res.status(404).json({ message: "Word not found" });
        }
        return res.json(wordWithTranslation);
      }
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.json(word);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word" });
    }
  });
 
  app.get("/api/words/:id/distractors", async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=300');
      const count = parseInt(req.query.count as string) || 3;
      const distractors = await withRetry(() => storage.getRandomWords(req.params.id, count));
      res.json(distractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch distractors" });
    }
  });
 
  app.get("/api/words/:id/spell-letters", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      const wordLetters = word.word.split('').sort(() => Math.random() - 0.5);
      res.json({ availableLetters: wordLetters });
    } catch (error) {
      console.error("Error getting spell letters:", error);
      res.status(500).json({ message: "Failed to get spell letters" });
    }
  });
 
  app.get("/api/words/:id/syllables", async (req, res) => {
    try {
      const word = await storage.getWord(req.params.id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      const { splitIntoSyllables } = await import("../client/src/lib/utils");
      const correctSyllables = splitIntoSyllables(word.word);
      const allWords = await storage.getAllWords();
      const allSyllables = new Set<string>();
      for (const w of allWords) {
        const wordSyllables = splitIntoSyllables(w.word);
        wordSyllables.forEach(syllable => {
          if (syllable && syllable.trim()) allSyllables.add(syllable);
        });
      }
      const validCorrectSyllables = correctSyllables.filter(s => s && s.trim());
      const distractorSyllables = Array.from(allSyllables).filter(
        syllable => syllable && syllable.trim() && !validCorrectSyllables.includes(syllable)
      );
      const selectedDistractors = distractorSyllables.sort(() => Math.random() - 0.5).slice(0, 3);
      const shuffledOptions = [...validCorrectSyllables, ...selectedDistractors]
        .filter(s => s && s.trim())
        .sort(() => Math.random() - 0.5);
      res.json({ syllables: shuffledOptions, correctSyllables: validCorrectSyllables });
    } catch (error) {
      console.error("Error getting syllables:", error);
      res.status(500).json({ message: "Failed to get syllables" });
    }
  });
 
  app.post("/api/game-progress", async (req, res) => {
    try {
      const validatedData = insertGameProgressSchema.parse(req.body);
      const progress = await storage.createGameProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid game progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create game progress" });
    }
  });
 
  app.get("/api/game-progress/:id", async (req, res) => {
    try {
      const progress = await storage.getGameProgress(req.params.id);
      if (!progress) {
        return res.status(404).json({ message: "Game progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game progress" });
    }
  });
 
  app.patch("/api/game-progress/:id", async (req, res) => {
    try {
      const progress = await storage.updateGameProgress(req.params.id, req.body);
      if (!progress) {
        return res.status(404).json({ message: "Game progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game progress" });
    }
  });
 
  app.get("/api/progress/today", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || 'default-session';
      const count = await withRetry(() => storage.getTodayCorrectAnswersCount(sessionId));
      res.json({ correctAnswersToday: count });
    } catch (error) {
      console.error("Error getting today's progress:", error);
      res.status(500).json({ message: "Failed to get today's progress" });
    }
  });
 
  app.get("/api/progress/stats", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || 'default-session';
      const fromDate = req.query.from as string;
      const toDate = req.query.to as string;
      if (!fromDate || !toDate) {
        return res.status(400).json({ message: "From and to dates are required" });
      }
      const stats = await storage.getProgressStats(sessionId, fromDate, toDate);
      res.json(stats);
    } catch (error) {
      console.error("Error getting progress stats:", error);
      res.status(500).json({ message: "Failed to get progress stats" });
    }
  });
 
  app.post("/api/answers", async (req, res) => {
    try {
      const validatedData = insertUserAnswerSchema.parse(req.body);
      const answer = await storage.recordAnswer(validatedData);
      res.status(201).json(answer);
    } catch (error) {
      console.error("Error recording answer:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record answer" });
    }
  });
 
  app.get("/api/sentences", async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=300');
      const sentences = await storage.getAllSentences();
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching sentences:", error);
      res.status(500).json({ message: "Failed to fetch sentences" });
    }
  });
 
  app.get("/api/sentences/:id", async (req, res) => {
    try {
      const sentence = await storage.getSentence(req.params.id);
      if (!sentence) {
        return res.status(404).json({ message: "Sentence not found" });
      }
      res.json(sentence);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sentence" });
    }
  });
 
  app.get("/api/sentences/category/:category", async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=300');
      const sentences = await storage.getSentencesByCategory(req.params.category);
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching sentences by category:", error);
      res.status(500).json({ message: "Failed to fetch sentences by category" });
    }
  });
 
  app.get("/api/sentences/difficulty/:difficulty", async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=300');
      const sentences = await storage.getSentencesByDifficulty(req.params.difficulty);
      res.json(sentences);
    } catch (error) {
      console.error("Error fetching sentences by difficulty:", error);
      res.status(500).json({ message: "Failed to fetch sentences by difficulty" });
    }
  });
 
  app.post("/api/sentences", async (req, res) => {
    try {
      const validatedData = insertSentenceSchema.parse(req.body);
      const sentence = await storage.createSentence(validatedData);
      res.status(201).json(sentence);
    } catch (error) {
      console.error("Error creating sentence:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sentence data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sentence" });
    }
  });
 
  app.get("/api/words/:id/translations", async (req, res) => {
    try {
      const translations = await storage.getWordTranslations(req.params.id);
      res.json(translations);
    } catch (error) {
      console.error("Error fetching word translations:", error);
      res.status(500).json({ message: "Failed to fetch word translations" });
    }
  });
 
  app.post("/api/words/:id/translations", async (req, res) => {
    try {
      const { language, translation } = req.body;
      if (!language || !translation) {
        return res.status(400).json({ message: "Language and translation are required" });
      }
      const wordTranslation = await storage.createWordTranslation(req.params.id, language, translation);
      res.status(201).json(wordTranslation);
    } catch (error) {
      console.error("Error creating word translation:", error);
      res.status(500).json({ message: "Failed to create word translation" });
    }
  });
 
  app.get("/api/material-world", async (req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=300');
      const activities = await withRetry(() => storage.getMaterialWorldActivities());
      res.json(activities);
    } catch (error) {
      console.error("Error fetching material world activities:", error);
      res.status(500).json({ message: "Failed to fetch material world activities" });
    }
  });
 
  app.get("/api/material-world/:id/distractors", async (req, res) => {
    try {
      const { id } = req.params;
      const distractors = await withRetry(() => storage.getRandomMaterialWorldItems(id, 3));
      res.json(distractors);
    } catch (error) {
      console.error("Error fetching material world distractors:", error);
      res.status(500).json({ message: "Failed to fetch distractors" });
    }
  });
 
  app.get("/api/kfc/words", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT id, ru, en, uk FROM kfc.words ORDER BY ru"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching kfc words:", error);
      res.status(500).json({ message: "Failed to fetch kfc words" });
    }
  });
 
  const httpServer = createServer(app);
  return httpServer;
}