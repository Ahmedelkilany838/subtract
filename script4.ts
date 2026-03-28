import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { from: /bg-white text-black hover:bg-slate-100/g, to: 'bg-primary text-primary-foreground hover:bg-primary/90' },
  { from: /bg-white text-black hover:bg-slate-200/g, to: 'bg-primary text-primary-foreground hover:bg-primary/90' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete.');
