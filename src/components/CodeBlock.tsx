interface CodeBlockProps {
  code: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "sql",
  readOnly = false,
  onChange,
  placeholder = "코드를 입력하세요...",
  className = "",
}: CodeBlockProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 ${className}`}
    >
      <textarea
        value={code}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full h-64 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900 rounded border resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
      />
    </div>
  );
}
