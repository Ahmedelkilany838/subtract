import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { from: /bg-white\/\[0\.02\]/g, to: 'bg-card' },
  { from: /border-white\/5/g, to: 'border-border' },
  { from: /border-white\/10/g, to: 'border-border' },
  { from: /border-white\/20/g, to: 'border-ring' },
  { from: /text-white/g, to: 'text-foreground' },
  { from: /text-slate-400/g, to: 'text-muted-foreground' },
  { from: /text-slate-500/g, to: 'text-muted-foreground' },
  { from: /bg-white\/5/g, to: 'bg-muted' },
  { from: /bg-white\/10/g, to: 'bg-accent' },
  { from: /hover:bg-white\/5/g, to: 'hover:bg-muted' },
  { from: /hover:bg-white\/10/g, to: 'hover:bg-accent' },
  { from: /hover:text-white/g, to: 'hover:text-foreground' },
  { from: /group-hover:text-white/g, to: 'group-hover:text-foreground' },
  { from: /focus-within:text-white/g, to: 'focus-within:text-foreground' },
  { from: /placeholder:text-slate-500/g, to: 'placeholder:text-muted-foreground' },
  { from: /placeholder:text-slate-600/g, to: 'placeholder:text-muted-foreground' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete.');
