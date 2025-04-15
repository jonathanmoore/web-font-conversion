/**
 * Font Converter Script
 * Converts OTF/TTF fonts to WOFF2 format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ttf2woff2 from 'ttf2woff2';

// Get directory paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, '..', 'input');
const outputDir = path.join(__dirname, '..', 'output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

// Check if input directory exists
if (!fs.existsSync(inputDir)) {
  console.error(`Error: Input directory '${inputDir}' not found.`);
  process.exit(1);
}

/**
 * Convert TTF/OTF to WOFF2 using ttf2woff2
 */
async function convertToWoff2(inputFile, outputFile) {
  try {
    const fontBuffer = fs.readFileSync(inputFile);
    const woff2Data = ttf2woff2(fontBuffer);
    fs.writeFileSync(outputFile, woff2Data);
    return true;
  } catch (error) {
    console.error(`Error converting to WOFF2: ${error.message}`);
    return false;
  }
}

/**
 * Process all font files in the input directory
 */
async function processFonts() {
  // Get all TTF/OTF files in the input directory
  const fontFiles = fs
    .readdirSync(inputDir)
    .filter((file) => /\.(ttf|otf)$/i.test(file));

  if (fontFiles.length === 0) {
    console.log(`No TTF/OTF files found in '${inputDir}'.`);
    return;
  }

  console.log(`Found ${fontFiles.length} font files to convert.`);

  for (const fontFile of fontFiles) {
    const inputPath = path.join(inputDir, fontFile);
    const baseName = path.basename(fontFile, path.extname(fontFile));
    const woff2OutputPath = path.join(outputDir, `${baseName}.woff2`);

    console.log(`Converting '${fontFile}'...`);

    // Convert to WOFF2
    const woff2Success = await convertToWoff2(inputPath, woff2OutputPath);
    if (woff2Success) {
      console.log(`  → Created '${path.basename(woff2OutputPath)}'`);
    }
  }

  console.log('Font conversion complete.');
}

// Start processing
processFonts().catch((error) => {
  console.error('Conversion failed:', error);
  process.exit(1);
});
