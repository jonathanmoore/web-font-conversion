import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const previewDir = path.join(__dirname, 'preview');

// Debug logging
console.log('Preview directory:', previewDir);
console.log('Directory exists:', fs.existsSync(previewDir));
if (fs.existsSync(previewDir)) {
  console.log('Contents:', fs.readdirSync(previewDir));
}

const app = new Hono();

// Serve static files from preview directory
app.use('*', async (c, next) => {
  console.log('Request path:', c.req.path);
  await next();
});

app.use(
  '/*',
  serveStatic({
    root: './preview', // Try relative path instead
  })
);

// Add a basic error handler
app.onError((err, c) => {
  console.error(`Error:`, err);
  return c.text('Internal Server Error', 500);
});

// Start the server
const port = 3000;
console.log(`Server is running on http://localhost:${port}`);
console.log('Press Ctrl+C to stop the server');

serve({
  fetch: app.fetch,
  port,
});
