import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { from: /bg-white\/\[0\.04\]/g, to: 'bg-accent' },
  { from: /bg-white\/\[0\.03\]/g, to: 'bg-muted' },
  { from: /bg-white\/\[0\.01\]/g, to: 'bg-card/50' },
  { from: /bg-white\/40/g, to: 'bg-foreground/40' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete.');
