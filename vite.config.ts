import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import {
  generatePersonalizedPromptsService,
  analyzeMoodPatternsService,
  reflectOnJournalEntryService,
  generateMoodForecastService,
  generateMindseraCommentService,
  reconcileMindseraDataService,
} from './src/server/geminiService';

function apiEndpointsPlugin(): Plugin {
  return {
    name: 'api-endpoints-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            res.setHeader('Content-Type', 'application/json');

            if (req.url === '/api/generate-prompts') {
              const prompts = await generatePersonalizedPromptsService(parsed);
              res.statusCode = 200;
              res.end(JSON.stringify({ prompts }));
              return;
            }

            if (req.url === '/api/analyze-patterns') {
              const result = await analyzeMoodPatternsService(parsed);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/entry-reflection') {
              const result = await reflectOnJournalEntryService(parsed);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/mood-forecast') {
              const result = await generateMoodForecastService(parsed);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/mindsera-comment') {
              const result = await generateMindseraCommentService(parsed);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
              return;
            }

            if (req.url === '/api/reconcile-data') {
              const result = await reconcileMindseraDataService(parsed);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
              return;
            }

            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
          } catch (err: any) {
            console.warn('API Notice in dev server:', err?.message || err);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ prompts: [] }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiEndpointsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

