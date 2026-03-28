import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { from: /text-slate-300/g, to: 'text-foreground/80' },
  { from: /text-slate-200/g, to: 'text-foreground' },
  { from: /bg-\[#0a0a0a\]/g, to: 'bg-popover' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete.');
