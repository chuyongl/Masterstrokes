import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create directories
const assetsDir = path.join(__dirname, 'public', 'assets');
const quizDir = path.join(__dirname, 'public', 'quiz');

if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
if (!fs.existsSync(quizDir)) fs.mkdirSync(quizDir, { recursive: true });

// Generate placeholder SVG for main artwork
const mainArtwork = `<svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="600" height="800" fill="url(#bg)"/>
  
  <!-- Head Band Area (Top) -->
  <ellipse cx="300" cy="176" rx="150" ry="100" fill="#3b82f6" opacity="0.8"/>
  
  <!-- Face -->
  <ellipse cx="300" cy="400" rx="180" ry="220" fill="#f1f5f9"/>
  
  <!-- Left Eye Area -->
  <circle cx="228" cy="280" r="40" fill="#1e293b"/>
  <circle cx="235" cy="275" r="15" fill="#ffffff"/>
  
  <!-- Right Eye -->
  <circle cx="372" cy="280" r="40" fill="#1e293b"/>
  <circle cx="379" cy="275" r="15" fill="#ffffff"/>
  
  <!-- Ear Ring Area (Right side) -->
  <circle cx="300" cy="464" r="30" fill="#fbbf24" stroke="#f59e0b" stroke-width="4"/>
  
  <!-- Text -->
  <text x="300" y="750" font-family="Arial" font-size="24" fill="#94a3b8" text-anchor="middle">
    Girl with a Pearl Earring (Placeholder)
  </text>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'girl-with-pearl-earring.svg'), mainArtwork);

// Generate quiz option placeholders
const quizOptions = [
  // Eyes
  { name: 'eye-1.svg', color: '#3b82f6', label: 'Eye 1' },
  { name: 'eye-2.svg', color: '#8b5cf6', label: 'Eye 2' },
  { name: 'eye-3.svg', color: '#ec4899', label: 'Eye 3' },
  { name: 'eye-4.svg', color: '#10b981', label: 'Eye 4' },

  // Earrings
  { name: 'earring-1.svg', color: '#f59e0b', label: 'Ring 1' },
  { name: 'earring-2.svg', color: '#fbbf24', label: 'Ring 2' },
  { name: 'earring-3.svg', color: '#eab308', label: 'Ring 3' },
  { name: 'earring-4.svg', color: '#facc15', label: 'Ring 4' },

  // Headbands
  { name: 'headband-1.svg', color: '#3b82f6', label: 'Band 1' },
  { name: 'headband-2.svg', color: '#2563eb', label: 'Band 2' },
  { name: 'headband-3.svg', color: '#1d4ed8', label: 'Band 3' },
  { name: 'headband-4.svg', color: '#1e40af', label: 'Band 4' }
];

quizOptions.forEach(opt => {
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="${opt.color}"/>
  <text x="100" y="100" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${opt.label}
  </text>
</svg>`;

  fs.writeFileSync(path.join(quizDir, opt.name), svg);
});

console.log('✅ Generated placeholder assets:');
console.log('   - public/assets/girl-with-pearl-earring.svg');
console.log('   - public/quiz/*.svg (12 quiz options)');
