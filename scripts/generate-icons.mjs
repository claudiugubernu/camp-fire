#!/usr/bin/env node
/**
 * Generates placeholder PWA icons using sharp or falls back to a simple SVG.
 * Run: node scripts/generate-icons.mjs
 * For production: replace public/pwa-192x192.png and public/pwa-512x512.png
 * with proper icons from a design tool.
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

// Base64 encoded minimal PNG (1x1 orange pixel) as fallback
// Real icons should be created with a design tool
const orangePixelPNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==";

const buf = Buffer.from(orangePixelPNG, "base64");

writeFileSync(resolve(publicDir, "pwa-192x192.png"), buf);
writeFileSync(resolve(publicDir, "pwa-512x512.png"), buf);
writeFileSync(resolve(publicDir, "apple-touch-icon.png"), buf);

console.log("⚠️  Placeholder PWA icons created.");
console.log("Replace public/pwa-192x192.png, pwa-512x512.png, and apple-touch-icon.png");
console.log("with proper 🔥 icons for production.");
