import React, { useState, useMemo } from 'react';
import { Split, FileDiff, Code2, ArrowRightLeft, X, Check, Copy, Trash2 } from 'lucide-react';
import './App.css'

const calculateDiff = (oldText, newText) => {
if (oldText === newText) return [];

const oldLines = oldText.split('\n');
const newLines = newText.split('\n');

const matrix = Array(oldLines.length + 1).fill(null).map(() => Array(newLines.length + 1).fill(0));

for (let i = 1; i <= oldLines.length; i++) {
for (let j = 1; j <= newLines.length; j++) {
if (oldLines[i - 1] === newLines[j - 1]) {
matrix[i][j] = matrix[i - 1][j - 1] + 1;
} else {
matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
}
}
}

let i = oldLines.length;
let j = newLines.length;
const diffs = [];

while (i > 0 || j > 0) {
if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
diffs.unshift({ type: 'equal', content: oldLines[i - 1], oldLine: i, newLine: j });
i--;
j--;
} else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
diffs.unshift({ type: 'add', content: newLines[j - 1], newLine: j });
j--;
} else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
diffs.unshift({ type: 'remove', content: oldLines[i - 1], oldLine: i });
i--;
}
}

return diffs;
};


const Button = ({ children, onClick, active, icon: Icon, variant = 'primary', className = '' }) => {
const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
const variants = {
primary: active
? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
: "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700",
ghost: "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
danger: "text-red-400 hover:text-red-300 hover:bg-red-900/30",
};

return (
<button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
  {Icon && <Icon size={16} />}
  {children}
</button>
);
};

const CodeEditor = ({ value, onChange, placeholder, title, color }) => (
<div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
  <div className={`px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between`}>
  <span className={`text-sm font-semibold ${color}`}>{title}</span>
  <div className="flex gap-2">
    <button
            onClick={() => navigator.clipboard.writeText(value)}
    className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
    title="Copy"
    >
    <Copy size={14} />
    </button>
    <button
            onClick={() => onChange('')}
    className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
    title="Clear"
    >
    <Trash2 size={14} />
    </button>
  </div>
</div>
<textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full bg-slate-950 p-4 font-mono text-sm text-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        spellCheck="false"
        placeholder={placeholder}
        />
        </div>
        );

const DiffLine = ({ type, content, oldLineNum, newLineNum, mode }) => {
const styles = {
        equal: { bg: 'bg-transparent', text: 'text-slate-400', marker: ' ' },
        add: { bg: 'bg-green-900/20', text: 'text-green-300', marker: '+' },
        remove: { bg: 'bg-red-900/20', text: 'text-red-300', marker: '-' },
        };

        const style = styles[type];

        if (mode === 'unified') {
        return (
        <div className={`flex w-full group hover:bg-opacity-40 transition-colors ${style.bg}`}>
        <div className="w-12 flex-shrink-0 text-right select-none text-slate-600 text-xs py-1 pr-2 border-r border-slate-800 font-mono">
        {oldLineNum || ''}
        </div>
        <div className="w-12 flex-shrink-0 text-right select-none text-slate-600 text-xs py-1 pr-2 border-r border-slate-800 font-mono">
        {newLineNum || ''}
        </div>
        <div className="w-6 flex-shrink-0 text-center select-none text-slate-600 py-1 font-mono">
        {style.marker}
        </div>
        <pre className={`flex-1 font-mono text-sm py-1 pl-2 whitespace-pre-wrap break-all ${style.text}`}>
        {content || ' '}
        </pre>
        </div>
        );
}

return null;
        };

        export default function App() {
        const [originalCode, setOriginalCode] = useState(`<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <title>Original Page</title>
        </head>
        <body>
        <div class="container">
        <h1>Welcome to my website</h1>
        <p>This is a simple paragraph to demonstrate diffs.</p>

        <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        </ul>
        </div>
        </body>
        </html>`);

        const [modifiedCode, setModifiedCode] = useState(`<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Updated Page</title>
        <link rel="stylesheet" href="styles.css">
        </head>
        <body>
        <div class="container-fluid">
        <h1>Welcome to my AWESOME website</h1>
        <p>This is a simple paragraph to demonstrate diffs.</p>
        <p>We added a new paragraph here!</p>

        <ul>
        <li>Item 1</li>
        <li>Item 2 - Updated</li>
        <li>Item 4 (New)</li>
        </ul>
        </div>
        <script src="app.js"></script>
        </body>
        </html>`);

const [viewMode, setViewMode] = useState('split');

const diffs = useMemo(() => calculateDiff(originalCode, modifiedCode), [originalCode, modifiedCode]);

const stats = useMemo(() => {
        const adds = diffs.filter(d => d.type === 'add').length;
        const removes = diffs.filter(d => d.type === 'remove').length;
        return { adds, removes };
}, [diffs]);

const splitRows = useMemo(() => {
        const rows = [];
        let i = 0;
        while(i < diffs.length) {
        const current = diffs[i];
        if (current.type === 'equal') {
        rows.push({ left: current, right: current });
        i++;
} else if (current.type === 'remove') {
let next = diffs[i + 1];
        if (next && next.type === 'add') {
        rows.push({ left: current, right: next });
        i += 2;
        } else {
        rows.push({ left: current, right: null });
        i++;
        }
        } else if (current.type === 'add') {
        rows.push({ left: null, right: current });
        i++;
        }
        }
        return rows;
        }, [diffs]);

return (
<div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
<header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-16 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/20">
        <FileDiff className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
        DiffCheck
        </h1>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium bg-slate-900 border border-slate-800 rounded-lg p-1">
        <span className="flex items-center gap-1 px-3 py-1 text-green-400">
        <span className="text-xs">●</span> {stats.adds} <span className="hidden sm:inline">additions</span>
        </span>
        <div className="w-px h-4 bg-slate-800"></div>
        <span className="flex items-center gap-1 px-3 py-1 text-red-400">
        <span className="text-xs">●</span> {stats.removes} <span className="hidden sm:inline">deletions</span>
        </span>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
        <button
        onClick={() => setViewMode('split')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
        viewMode === 'split' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
        >
        <Split size={14} /> <span className="hidden sm:inline">Split</span>
        </button>
        <button
        onClick={() => setViewMode('unified')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
        viewMode === 'unified' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
        }`}
        >
        <Code2 size={14} /> <span className="hidden sm:inline">Unified</span>
        </button>
        </div>
        </div>
        </div>
        </header>

<main className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 flex-1 h-full overflow-hidden">

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto min-h-[400px] lg:h-[40%] flex-shrink-0">
        <CodeEditor
        title="Original Code"
        value={originalCode}
        onChange={setOriginalCode}
        placeholder="Paste original code here..."
        color="text-red-400"
        />
        <CodeEditor
        title="Modified Code"
        value={modifiedCode}
        onChange={setModifiedCode}
        placeholder="Paste modified code here..."
        color="text-green-400"
/>
</div>

<div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-xl shadow-black/20 min-h-[300px]">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2 shrink-0">
        <ArrowRightLeft size={16} className="text-blue-500" />
        <span className="text-sm font-semibold text-slate-200">Comparison Result</span>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
        {viewMode === 'unified' ? (
        <div className="min-w-full inline-block">
        {diffs.length === 0 && (
        <div className="p-8 text-center text-slate-500">No content to compare.</div>
        )}
        {diffs.map((diff, index) => (
        <DiffLine
        key={index}
        type={diff.type}
        content={diff.content}
        oldLineNum={diff.oldLine}
        newLineNum={diff.newLine}
        mode="unified"
        />
))}
</div>
) : (
<div className="min-w-full table border-collapse">
<div className="table-row-group min-w-[700px] block lg:table-row-group">
        {splitRows.length === 0 && (
        <div className="p-8 text-center text-slate-500 w-full">No content to compare.</div>
        )}
{splitRows.map((row, idx) => (
<div key={idx} className="table-row border-b border-slate-800/50">
<div className={`table-cell w-1/2 align-top ${
row.left?.type === 'remove' ? 'bg-red-900/10' : ''
}`}>
{row.left ? (
<div className="flex">
<div className="w-10 flex-shrink-0 text-right select-none text-slate-600 text-xs py-1 pr-2 border-r border-slate-800 font-mono">
{row.left.oldLine}
</div>
<pre className={`flex-1 font-mono text-sm py-1 pl-2 whitespace-pre-wrap break-all ${
row.left.type === 'remove' ? 'text-red-300' : 'text-slate-400'
}`}>
{row.left.content || ' '}
</pre>
</div>
) : (
<div className="flex bg-slate-900/30">
<div className="w-10 flex-shrink-0 border-r border-slate-800 py-1">&nbsp;</div>
<div className="flex-1 py-1">&nbsp;</div>
</div>
)}
</div>

<div className={`table-cell w-1/2 align-top border-l border-slate-800 ${
row.right?.type === 'add' ? 'bg-green-900/10' : ''
}`}>
{row.right ? (
<div className="flex">
<div className="w-10 flex-shrink-0 text-right select-none text-slate-600 text-xs py-1 pr-2 border-r border-slate-800 font-mono">
{row.right.newLine}
</div>
<pre className={`flex-1 font-mono text-sm py-1 pl-2 whitespace-pre-wrap break-all ${
row.right.type === 'add' ? 'text-green-300' : 'text-slate-400'
}`}>
{row.right.content || ' '}
</pre>
</div>
) : (
<div className="flex bg-slate-900/30">
<div className="w-10 flex-shrink-0 border-r border-slate-800 py-1">&nbsp;</div>
<div className="flex-1 py-1">&nbsp;</div>
</div>
)}
</div>
</div>
))}
</div>
</div>
)}
</div>
</div>
</main>
</div>
);
}

