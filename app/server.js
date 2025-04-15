import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const previewDir = path.join(rootDir, 'preview');
const outputDir = path.join(rootDir, 'output');

// Verify directories silently
const previewExists = fs.existsSync(previewDir);
const outputExists = fs.existsSync(outputDir);

const app = new Hono();

// Add middleware to log requests (only for font files to minimize noise)
app.use('/output/*', async (c, next) => {
  console.log(`Loading font: ${c.req.path.split('/').pop()}`);
  await next();
});

// Serve index.html from the preview directory for the root path
app.get('/', async (c) => {
  const indexPath = path.join(previewDir, 'index.html');

  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    return c.html(content);
  } else {
    console.error(`Index file not found at ${indexPath}`);
    return c.text('Index file not found', 404);
  }
});

// Serve static files from preview directory
app.get('/index.html', async (c) => {
  const indexPath = path.join(previewDir, 'index.html');

  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    return c.html(content);
  } else {
    console.error(`Index file not found at ${indexPath}`);
    return c.text('Index file not found', 404);
  }
});

// Serve font files from the output directory
app.get('/output/:filename', async (c) => {
  const filename = c.req.param('filename');
  const fontPath = path.join(outputDir, filename);

  if (fs.existsSync(fontPath)) {
    const data = fs.readFileSync(fontPath);
    return new Response(data, {
      headers: {
        'Content-Type': 'font/woff2',
        'Content-Length': data.length.toString(),
      },
    });
  } else {
    console.error(`Font file not found: ${fontPath}`);
    return c.text('Font file not found', 404);
  }
});

// Add a basic error handler
app.onError((err, c) => {
  console.error(`Error:`, err);
  return c.text(`Internal Server Error: ${err.message}`, 500);
});

// Start the server
const port = 3000;
console.log(`
╭──────────────────────────────────────────╮
│                                          │
│    Font Preview Server                   │
│                                          │
│    🔍 http://localhost:${port}              │
│                                          │
│    Press Ctrl+C to stop                  │
│                                          │
╰──────────────────────────────────────────╯
`);

serve({
  fetch: app.fetch,
  port,
});
