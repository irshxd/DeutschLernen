import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application build files not found. Please run "npm run build" first.');
  }
});

app.listen(PORT, () => {
  console.log(`\n===================================================`);
  console.log(`  DeutschLernen production server running`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`===================================================\n`);
});
