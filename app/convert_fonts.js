/**
 * Font Converter Script
 * Converts OTF/TTF fonts to WOFF2 format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ttf2woff2 from 'ttf2woff2';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

// Get directory paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputDir = path.join(__dirname, '..', 'input');
const outputDir = path.join(__dirname, '..', 'output');

// If this is a worker thread, do the font conversion
if (!isMainThread) {
  const { inputFile, outputFile } = workerData;
  try {
    const fontBuffer = fs.readFileSync(inputFile);
    const woff2Data = ttf2woff2(fontBuffer);
    fs.writeFileSync(outputFile, woff2Data);
    parentPort.postMessage({ success: true });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
} else {
  // This is the main thread - continue with the rest of the script
  // Spinner animation frames and colors
  const spinnerFrames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
  const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
  };

  // Spinner class for better management
  class Spinner {
    constructor() {
      this.frame = 0;
      this.timer = null;
      this.text = '';
      this.active = false;
    }

    start(text) {
      this.text = text;
      this.active = true;
      this.frame = 0;

      if (this.timer) {
        clearInterval(this.timer);
      }

      // Clear the current line
      process.stdout.write('\r\x1b[K');

      this.timer = setInterval(() => {
        if (!this.active) return;
        const frame = spinnerFrames[this.frame];
        process.stdout.write(
          `\r${colors.cyan}${frame}${colors.reset} ${this.text}`
        );
        this.frame = (this.frame + 1) % spinnerFrames.length;
      }, 80);

      return this;
    }

    stop(finalText, success = true) {
      this.active = false;
      clearInterval(this.timer);
      this.timer = null;

      const symbol = success
        ? `${colors.green}✓${colors.reset}`
        : `${colors.red}✗${colors.reset}`;
      process.stdout.write(`\r\x1b[K${symbol} ${finalText}\n`);

      return this;
    }

    update(text) {
      this.text = text;
      return this;
    }
  }

  const spinner = new Spinner();

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(
      `${colors.cyan}✨${colors.reset} Created output directory: ${outputDir}`
    );
  }

  // Check if input directory exists
  if (!fs.existsSync(inputDir)) {
    console.error(
      `${colors.red}❌${colors.reset} Error: Input directory '${inputDir}' not found.`
    );
    process.exit(1);
  }

  /**
   * Convert TTF/OTF to WOFF2 using ttf2woff2 in a worker thread
   */
  async function convertToWoff2(inputFile, outputFile) {
    return new Promise((resolve) => {
      const worker = new Worker(new URL(import.meta.url), {
        workerData: { inputFile, outputFile },
      });

      worker.on('message', (data) => {
        if (data.success) {
          resolve(true);
        } else {
          console.error(
            `${colors.red}❌${colors.reset} Error converting to WOFF2: ${data.error}`
          );
          resolve(false);
        }
      });

      worker.on('error', (error) => {
        console.error(
          `${colors.red}❌${colors.reset} Worker error: ${error.message}`
        );
        resolve(false);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(
            `${colors.red}❌${colors.reset} Worker stopped with exit code ${code}`
          );
          resolve(false);
        }
      });
    });
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
      console.log(
        `${colors.yellow}📭${colors.reset} No TTF/OTF files found in '${inputDir}'.`
      );
      return;
    }

    console.log(
      `${colors.cyan}🔍${colors.reset} Found ${fontFiles.length} font files to convert.\n`
    );

    let completedCount = 0;

    for (const fontFile of fontFiles) {
      const inputPath = path.join(inputDir, fontFile);
      const baseName = path.basename(fontFile, path.extname(fontFile));
      const woff2OutputPath = path.join(outputDir, `${baseName}.woff2`);

      spinner.start(`Converting '${fontFile}'...`);

      try {
        const success = await convertToWoff2(inputPath, woff2OutputPath);

        if (success) {
          spinner.stop(
            `Converted '${fontFile}' → '${path.basename(woff2OutputPath)}'`,
            true
          );
          completedCount++;
        } else {
          spinner.stop(`Failed to convert '${fontFile}'`, false);
        }
      } catch (error) {
        spinner.stop(`Error converting '${fontFile}': ${error.message}`, false);
      }
    }

    console.log(
      `\n${colors.green}🎉${colors.reset} Font conversion complete! ${completedCount}/${fontFiles.length} files converted successfully.`
    );
  }

  // Start processing
  processFonts().catch((error) => {
    if (spinner.timer) {
      spinner.stop('Process interrupted', false);
    }
    console.error(`\n${colors.red}❌${colors.reset} Conversion failed:`, error);
    process.exit(1);
  });
}
