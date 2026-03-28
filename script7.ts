import fs from 'fs';

const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { from: /text-blue-400/g, to: 'text-blue-500 dark:text-blue-400' },
  { from: /text-purple-400/g, to: 'text-purple-500 dark:text-purple-400' },
  { from: /text-pink-400/g, to: 'text-pink-500 dark:text-pink-400' },
  { from: /text-emerald-400/g, to: 'text-emerald-500 dark:text-emerald-400' },
  { from: /text-red-400/g, to: 'text-red-500 dark:text-red-400' },
  { from: /text-rose-400/g, to: 'text-rose-500 dark:text-rose-400' },
  { from: /bg-blue-400\/10/g, to: 'bg-blue-500\/10 dark:bg-blue-400\/10' },
  { from: /bg-purple-400\/10/g, to: 'bg-purple-500\/10 dark:bg-purple-400\/10' },
  { from: /bg-pink-400\/10/g, to: 'bg-pink-500\/10 dark:bg-pink-400\/10' },
  { from: /bg-emerald-400\/10/g, to: 'bg-emerald-500\/10 dark:bg-emerald-400\/10' },
  { from: /bg-red-400\/10/g, to: 'bg-red-500\/10 dark:bg-red-400\/10' },
  { from: /bg-rose-500\/10/g, to: 'bg-rose-500\/10 dark:bg-rose-400\/10' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(file, content, 'utf8');
console.log('Replacements complete.');
