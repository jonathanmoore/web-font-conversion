# Web Font Conversion & Preview 

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A simple, Node.js-based tool that converts OTF/TTF fonts to WOFF2 format and generates a beautiful live preview page. This project uses [ttf2woff2](https://www.npmjs.com/package/ttf2woff2) for efficient font conversion and [Hono](https://hono.dev) to serve the preview with Tailwind CSS.

## ✨ Features

- **Fast Conversion**: Convert OTF/TTF fonts to WOFF2 format with a single command 🏎️
- **Auto-detection**: Automatically detects font family, weight, and style from filenames 🔍
- **Live Preview**: Generates a beautiful preview page showing all your fonts 💎
- **Web Server**: Includes a lightweight server to view previews locally 🚀
- **Pure JavaScript**: No external dependencies beyond Node.js packages

## 📋 Requirements

- Node.js (v18.14.1 or higher)

## 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/font-converter-preview.git
   cd font-converter-preview
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🔧 Usage

### Quick Start ⚡

1. Place your OTF or TTF font files in the `input` directory.

2. Run the complete process:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser to view the font preview! ✨

### Individual Commands 📜

You can also run each step of the process individually:

- **Convert Fonts**:
  ```bash
  npm run build
  ```
  This converts all fonts in the `input` directory to WOFF2 format and places them in the `output` directory.

- **Generate Preview Files**:
  ```bash
  npm run preview
  ```
  This generates HTML and CSS files in the `preview` directory based on the WOFF2 files in `output`.

- **Start the Preview Server**:
  ```bash
  npm run serve
  ```
  This starts a local web server to view the preview files at http://localhost:3000.

## 📝 Font Naming

The preview generator automatically detects font properties from filenames. For best results, name your fonts using common weight and style descriptors:

### Supported Weight Keywords
- thin, hairline (100)
- extralight, ultralight (200)
- light (300)
- regular, normal, book, roman (400)
- medium (500)
- semibold, demibold (600)
- bold (700)
- extrabold, ultrabold (800)
- black, heavy (900)
- extrablack, ultrablack (950)

### Supported Style Keywords
- italic
- oblique

### Naming Examples 📚
- `OpenSans-Bold.ttf` → Family: "Open Sans", Weight: 700, Style: normal
- `Roboto-LightItalic.otf` → Family: "Roboto", Weight: 300, Style: italic
- `SourceSansPro-SemiBold.ttf` → Family: "Source Sans Pro", Weight: 600, Style: normal

## 📂 Directory Structure

```
.
├── app/                    # Application source files
│   ├── convert_fonts.js    # Font conversion script
│   ├── generate_preview.js # Preview generation script
│   └── server.js           # Preview server
├── input/                  # Place font files here
├── output/                 # Generated WOFF2 files
└── preview/                # Generated preview files
```

## 🔍 How It Works

1. The `convert_fonts.js` script reads TTF/OTF files from the `input` directory and converts them to WOFF2 using the ttf2woff2 library.

2. The `generate_preview.js` script analyzes the converted font files and generates:
   - A CSS file with @font-face declarations
   - An HTML preview page showing all fonts in different sizes

3. The `server.js` script provides a local web server using Hono to serve the preview files.

## 🙏 Credits

This tool uses the following open source projects:
- [ttf2woff2](https://www.npmjs.com/package/ttf2woff2) - Convert TTF/OTF files to WOFF2 format
- [Hono](https://hono.dev) - Ultrafast web framework for the Edges

## 📜 License

ISC 