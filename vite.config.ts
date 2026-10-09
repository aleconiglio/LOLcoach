import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const lolCoachBackendPlugin = (): Plugin => ({
  name: 'lol-coach-backend-api',
  configureServer(server) {
    server.middlewares.use('/api/game-data/status', async (req, res) => {
      try {
        const vRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = vRes.ok ? await vRes.json() : ['15.3.1'];
        const patch = Array.isArray(versions) ? versions[0] : '15.3.1';
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          status: 'ok',
          patch,
          timestamp: Date.now(),
          backendSearchAvailable: !!(process.env.SEARCH_API_KEY || process.env.TAVILY_API_KEY || process.env.VITE_SEARCH_API_KEY),
        }));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      }
    });

    server.middlewares.use('/api/web-research', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          const query = parsed.query || '';
          const patch = parsed.patch || '16.20.1';
          const serverKey = process.env.SEARCH_API_KEY || process.env.TAVILY_API_KEY || process.env.VITE_SEARCH_API_KEY || '';

          // Keep key securely on backend
          let searchResult = null;
          if (serverKey && serverKey.startsWith('tvly-')) {
            const tavilyRes = await fetch('https://api.tavily.com/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                api_key: serverKey,
                query,
                max_results: 5,
              }),
            });
            if (tavilyRes.ok) {
              const data = await tavilyRes.json();
              searchResult = {
                provider: 'TAVILY',
                results: data.results,
              };
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            query,
            patch,
            data: searchResult,
            backendProtected: true,
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), lolCoachBackendPlugin()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});

