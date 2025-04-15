import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'output');
const previewDir = path.join(__dirname, '..', 'preview');
const htmlFilePath = path.join(previewDir, 'index.html');

// --- Configuration (Adjust these mappings if needed) ---
const weightMap = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  book: 400, // Often used as an alternative to Regular
  normal: 400,
  regular: 400,
  roman: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
  extrablack: 950,
  ultrablack: 950,
};

const styleMap = {
  italic: 'italic',
  oblique: 'oblique',
};

// Playful dummy text collection
const dummyTexts = [
  'The quick brown fox jumps over the lazy dog, wondering why the dog never learned parkour. That fox has style.',
  "Pack my box with five dozen liquor jugs. The judge said it was weird but I'm sticking with my storage methods.",
  "How vexingly quick daft zebras jump! They're showing off again for the wildlife photographers.",
  "Sphinx of black quartz, judge my vow. That's what I said at my wedding to the mysterious Egyptian statue.",
  'Amazingly few discotheques provide jukeboxes. Most just have those fancy digital playlist systems now.',
  'Crazy Fredrick bought many very exquisite opal jewels. His family wondered about his sudden wealth.',
  'Sixty zippers were quickly picked from the woven jute bag. Someone has a zipper collection problem.',
  "The five boxing wizards jump quickly. They're late for their magic show at the gymnasium.",
  'Jackdaws love my big sphinx of quartz. Birds have strange taste in monumental architecture.',
  'Waltz, bad nymph, for quick jigs vex. The dance competition had unusual requirements this year.',
];

const shortQuotes = [
  'Typography is what language looks like.',
  'Good typography is invisible, bad typography is everywhere.',
  'Type is a beautiful group of letters, not a group of beautiful letters.',
  'Typography at its best is a visual form of language linking timelessness and time.',
  'Letters are the building blocks of our written language systems.',
  'The best fonts are the ones that carry meaning beyond the words they spell out.',
  'Typography is to literature as musical performance is to composition.',
  'The role of typography is to make text legible, readable and appealing.',
  'Type design involves the creation of letterforms that work harmoniously as a family.',
  'A typographic system is a collection of recurring elements in a design.',
];

// --- End Configuration ---

// Helper function to extract font properties from filename
function parseFontName(filename) {
  const baseName = path.basename(filename, path.extname(filename));
  const parts = baseName.split(/[-_ ]/); // Split by common separators

  let fontFamily = [];
  let weight = 'regular'; // Default weight
  let style = 'normal'; // Default style
  let weightNum = 400;

  parts.forEach((part) => {
    const lowerPart = part.toLowerCase();
    if (weightMap[lowerPart]) {
      weight = lowerPart;
      weightNum = weightMap[lowerPart];
    } else if (styleMap[lowerPart]) {
      style = styleMap[lowerPart];
    } else {
      // Assume it's part of the family name
      // Capitalize first letter for better readability (optional)
      fontFamily.push(part.charAt(0).toUpperCase() + part.slice(1));
    }
  });

  // Basic fallback if family name wasn't detected well
  if (fontFamily.length === 0) {
    fontFamily.push(parts[0] || 'UnknownFont');
  }

  return {
    family: fontFamily.join(' '),
    weight: weight,
    style: style,
    weightNum: weightNum,
    filename: filename,
    baseName: baseName,
  };
}

// Get a random item from an array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// --- Main Logic ---

// 1. Ensure preview directory exists
if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir, { recursive: true });
}

// 2. Read fonts from output directory
let fontFiles = [];
try {
  fontFiles = fs
    .readdirSync(outputDir)
    .filter((file) => /\.woff2$/i.test(file));

  if (fontFiles.length === 0) {
    console.log(`
❌ No WOFF2 fonts found in output dir

🔄 Run 'npm run build' first
    `);
    process.exit(0);
  }
} catch (err) {
  console.error(`
❌ Error reading output directory

🔄 Run 'npm run build' first
  `);
  process.exit(1);
}

// 3. Parse font names
const fonts = {};
let familyCount = 0;
let weightCount = 0;

fontFiles.forEach((file) => {
  const parsed = parseFontName(file);
  // Use absolute path for the server
  const fontUrl = `/output/${file}`;

  fonts[parsed.baseName] = {
    ...parsed,
    url: fontUrl,
  };
});

// 4. Generate font face styles and organize fonts by family
let fontFaceStyles = '';
const fontFamilies = {};

Object.values(fonts).forEach((font) => {
  // Add @font-face declaration
  fontFaceStyles += `@font-face {
  font-family: '${font.family}';
  font-style: ${font.style};
  font-weight: ${font.weightNum};
  src: url('${font.url}') format('woff2');
  font-display: swap;
}\n`;

  // Group by family name
  if (!fontFamilies[font.family]) {
    fontFamilies[font.family] = [];
    familyCount++;
  }
  fontFamilies[font.family].push(font);
  weightCount++;
});

// Sort fonts within each family by weight
Object.keys(fontFamilies).forEach((family) => {
  fontFamilies[family].sort((a, b) => a.weightNum - b.weightNum);
});

// 5. Generate HTML content with Tailwind CSS
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Font Preview</title>
  <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
  <style>
    ${fontFaceStyles}
    
    /* Custom font classes */
    ${Object.values(fonts)
      .map((font) => {
        return `.font-${font.family.replace(/\s+/g, '-').toLowerCase()}-${
          font.weightNum
        } {
      font-family: '${font.family}', sans-serif;
      font-weight: ${font.weightNum};
      font-style: ${font.style};
    }`;
      })
      .join('\n')}
  </style>
</head>
<body class="bg-gray-50 text-gray-900 antialiased">
  <div class="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-20">
    <!-- Header Section -->
    <header class="mb-16 border-b border-gray-200 pb-8">
      <p class="text-base font-semibold text-indigo-600">Font Preview</p>
      <h1 class="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Your Typography Collection</h1>
      <p class="mt-6 text-xl text-gray-600 max-w-3xl">A showcase of all available fonts, weights, and styles in your collection. Perfect for exploring typography options for your next design project.</p>
    </header>
    
    <!-- Font Families Section -->
    <div class="space-y-24">
      ${Object.entries(fontFamilies)
        .map(([family, fonts]) => {
          const accentColor = [
            'indigo',
            'blue',
            'emerald',
            'amber',
            'rose',
            'violet',
            'teal',
          ][Math.floor(Math.random() * 7)];

          return `
        <section class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="border-b border-gray-100">
            <div class="px-6 py-6 sm:px-8">
              <h2 class="text-2xl font-bold tracking-tight text-gray-900">${family}</h2>
              <p class="mt-1 text-sm text-gray-500">${fonts.length} weight${
            fonts.length > 1 ? 's' : ''
          } available</p>
            </div>
          </div>
          
          <div class="divide-y divide-gray-100">
            ${fonts
              .map((font, index) => {
                const randomQuote = getRandomItem(shortQuotes);
                const randomText = getRandomItem(dummyTexts);

                return `
              <div class="p-6 sm:p-8">
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-4">
                  <h3 class="text-lg font-medium text-gray-900 font-${font.family
                    .replace(/\s+/g, '-')
                    .toLowerCase()}-${font.weightNum}">
                    ${
                      font.weight.charAt(0).toUpperCase() + font.weight.slice(1)
                    }
                    ${font.style !== 'normal' ? ' ' + font.style : ''}
                    <span class="text-sm text-gray-500 ml-2">${
                      font.weightNum
                    }</span>
                  </h3>
                  <div class="text-xs text-gray-500">
                    ${path.basename(font.url)}
                  </div>
                </div>
                
                <div class="space-y-6">
                  <div>
                    <h4 class="text-xs uppercase tracking-wider text-gray-500 mb-2">Quote</h4>
                    <blockquote class="text-xl sm:text-2xl leading-relaxed text-gray-900 font-${font.family
                      .replace(/\s+/g, '-')
                      .toLowerCase()}-${font.weightNum}">
                      "${randomQuote}"
                    </blockquote>
                  </div>
                  
                  <div>
                    <h4 class="text-xs uppercase tracking-wider text-gray-500 mb-2">Paragraph</h4>
                    <p class="text-base leading-relaxed text-gray-700 font-${font.family
                      .replace(/\s+/g, '-')
                      .toLowerCase()}-${font.weightNum}">
                      ${randomText}
                    </p>
                  </div>
                  
                  <div>
                    <h4 class="text-xs uppercase tracking-wider text-gray-500 mb-2">Sample Text</h4>
                    <p class="text-base font-${font.family
                      .replace(/\s+/g, '-')
                      .toLowerCase()}-${font.weightNum}">
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>
                      abcdefghijklmnopqrstuvwxyz<br>
                      0123456789 !@#$%^&*()-=_+[]{}|;':",./<>?
                    </p>
                  </div>
                </div>
              </div>
              `;
              })
              .join('\n')}
          </div>
        </section>`;
        })
        .join('\n')}
    </div>
    
    <footer class="mt-24 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
      <p>Generated by Font Converter & Preview</p>
      <p class="mt-2">
        <span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
          <svg class="h-1.5 w-1.5 fill-indigo-500" viewBox="0 0 6 6" aria-hidden="true">
            <circle cx="3" cy="3" r="3" />
          </svg>
          ${familyCount} Font Families
        </span>
        <span class="ml-3 inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200">
          <svg class="h-1.5 w-1.5 fill-emerald-500" viewBox="0 0 6 6" aria-hidden="true">
            <circle cx="3" cy="3" r="3" />
          </svg>
          ${weightCount} Font Variations
        </span>
      </p>
    </footer>
  </div>
</body>
</html>`;

// 6. Write HTML file
fs.writeFileSync(htmlFilePath, htmlContent);

console.log(`
✨ Font Preview Generated ✨

📋 ${familyCount} Font Families
🔤 ${weightCount} Font Variations
`);
