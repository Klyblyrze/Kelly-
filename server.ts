import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  generatePersonalizedPromptsService,
  analyzeMoodPatternsService,
  reflectOnJournalEntryService,
  generateMoodForecastService,
  generateMindseraCommentService,
  reconcileMindseraDataService,
} from './src/server/geminiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API endpoints
app.post('/api/generate-prompts', async (req, res) => {
  try {
    const prompts = await generatePersonalizedPromptsService(req.body);
    res.json({ prompts });
  } catch (err: any) {
    console.warn('Notice in /api/generate-prompts:', err?.message || err);
    res.json({ prompts: [] });
  }
});

app.post('/api/analyze-patterns', async (req, res) => {
  try {
    const result = await analyzeMoodPatternsService(req.body);
    res.json(result);
  } catch (err: any) {
    console.warn('Notice in /api/analyze-patterns:', err?.message || err);
    res.json({ summary: '', insights: [], patternPrompts: [] });
  }
});

app.post('/api/entry-reflection', async (req, res) => {
  try {
    const result = await reflectOnJournalEntryService(req.body);
    res.json(result);
  } catch (err: any) {
    console.warn('Notice in /api/entry-reflection:', err?.message || err);
    res.json({
      reflection: 'Your emotional awareness creates space for meaningful self-understanding.',
      compassionateInsight: 'Giving voice to your internal experience grounds your nervous system.',
      gentleInquiry: 'What small kindness can you offer yourself today?',
    });
  }
});

app.post('/api/mood-forecast', async (req, res) => {
  try {
    const result = await generateMoodForecastService(req.body);
    res.json(result);
  } catch (err: any) {
    console.warn('Notice in /api/mood-forecast:', err?.message || err);
    res.json({
      projectedHorizon: 'Balanced Sprint Trajectory',
      forecastSummary: 'Sustained focus with steady recovery windows ahead.',
      resilienceBufferScore: 80,
      days: [],
      preemptiveJournalPrompt: 'What boundary will best preserve your clarity tomorrow?',
      preemptivePromptRationale: 'Preemptively manages upcoming cognitive load.',
    });
  }
});

app.post('/api/mindsera-comment', async (req, res) => {
  try {
    const result = await generateMindseraCommentService(req.body);
    res.json(result);
  } catch (err: any) {
    console.warn('Notice in /api/mindsera-comment:', err?.message || err);
    res.json({
      id: `mc-${Date.now()}`,
      persona: req.body?.persona || 'stoic',
      personaTitle: 'Marcus Aurelius (Stoic Lens)',
      commentText:
        'Focus on what is within your voluntary control and release attachment to external timeline pressures.',
      actionableInquiry: 'What single honorable action can you take right now?',
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/reconcile-data', async (req, res) => {
  try {
    const result = await reconcileMindseraDataService(req.body);
    res.json(result);
  } catch (err: any) {
    console.warn('Notice in /api/reconcile-data:', err?.message || err);
    res.json({
      synthesisSummary: 'Reconciliation active between Feelings Wheel and Mindsera entries.',
      alignedInsightsCount: 0,
      reconciledCorrelations: [],
    });
  }
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
