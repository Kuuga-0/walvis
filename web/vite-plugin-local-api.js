/**
 * Vite plugin to provide local API endpoints for WALVIS
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const WALVIS_DIR = join(homedir(), '.walvis');

export function localApiPlugin() {
  return {
    name: 'walvis-local-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Only handle /api/local/* routes
        if (!req.url.startsWith('/api/local/')) {
          return next();
        }

        try {
          // GET /api/local/manifest
          if (req.url === '/api/local/manifest' && req.method === 'GET') {
            const manifest = JSON.parse(readFileSync(join(WALVIS_DIR, 'manifest.json'), 'utf-8'));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest));
            return;
          }

          // GET /api/local/spaces/:id
          const spaceMatch = req.url.match(/^\/api\/local\/spaces\/([^\/]+)$/);
          if (spaceMatch && req.method === 'GET') {
            const spaceId = spaceMatch[1];
            const space = JSON.parse(readFileSync(join(WALVIS_DIR, 'spaces', `${spaceId}.json`), 'utf-8'));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(space));
            return;
          }

          // PATCH /api/local/spaces/:spaceId/items/:itemId/tags
          const tagsMatch = req.url.match(/^\/api\/local\/spaces\/([^\/]+)\/items\/([^\/]+)\/tags$/);
          if (tagsMatch && req.method === 'PATCH') {
            const [, spaceId, itemId] = tagsMatch;
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              const { tags } = JSON.parse(body);
              const spacePath = join(WALVIS_DIR, 'spaces', `${spaceId}.json`);
              const space = JSON.parse(readFileSync(spacePath, 'utf-8'));
              const item = space.items.find(i => i.id === itemId);

              if (item) {
                item.tags = tags;
                item.updatedAt = new Date().toISOString();
                writeFileSync(spacePath, JSON.stringify(space, null, 2));

                // Update manifest
                const manifestPath = join(WALVIS_DIR, 'manifest.json');
                const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
                if (manifest.items[itemId]) {
                  manifest.items[itemId].tags = tags;
                  manifest.items[itemId].updatedAt = item.updatedAt;
                  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
                }
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            });
            return;
          }

          // PATCH /api/local/spaces/:spaceId/items/:itemId/note
          const noteMatch = req.url.match(/^\/api\/local\/spaces\/([^\/]+)\/items\/([^\/]+)\/note$/);
          if (noteMatch && req.method === 'PATCH') {
            const [, spaceId, itemId] = noteMatch;
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
              const { notes } = JSON.parse(body);
              const spacePath = join(WALVIS_DIR, 'spaces', `${spaceId}.json`);
              const space = JSON.parse(readFileSync(spacePath, 'utf-8'));
              const item = space.items.find(i => i.id === itemId);

              if (item) {
                item.notes = notes;
                item.updatedAt = new Date().toISOString();
                writeFileSync(spacePath, JSON.stringify(space, null, 2));
              }

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            });
            return;
          }

          // GET /api/local/screenshots/:filename
          const screenshotMatch = req.url.match(/^\/api\/local\/screenshots\/([^\/]+)$/);
          if (screenshotMatch && req.method === 'GET') {
            const filename = screenshotMatch[1];
            const filePath = join(WALVIS_DIR, 'screenshots', filename);
            const file = readFileSync(filePath);
            res.setHeader('Content-Type', 'image/png');
            res.end(file);
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}
