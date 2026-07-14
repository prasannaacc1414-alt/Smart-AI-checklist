import React from 'react';

/** Renders inline markdown-lite: ***bold italic***, **bold**, *italic*, `code`. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const token =
    /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|`([^`]+)`|\*(.+?)\*|_(.+?)_)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = token.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const full = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (full.startsWith('***') && full.endsWith('***')) {
      nodes.push(
        <strong key={key} className="font-semibold italic text-slate-900">
          {match[2]}
        </strong>
      );
    } else if (full.startsWith('**') && full.endsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-900">
          {match[3]}
        </strong>
      );
    } else if (full.startsWith('`') && full.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="px-1 py-0.5 rounded bg-slate-100 text-[0.85em] font-mono text-slate-700"
        >
          {match[4]}
        </code>
      );
    } else if (full.startsWith('*') && full.endsWith('*')) {
      nodes.push(
        <em key={key} className="italic text-slate-700">
          {match[5]}
        </em>
      );
    } else {
      nodes.push(
        <em key={key} className="italic text-slate-700">
          {match[6]}
        </em>
      );
    }
    last = match.index + full.length;
  }

  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes.length ? nodes : [text];
}

function bulletEmoji(content: string, index: number): string {
  const lower = content.toLowerCase();
  if (/\b(done|complete|finished|success)\b/.test(lower)) return '✅';
  if (/\b(pending|todo|waiting)\b/.test(lower)) return '⏳';
  if (/\b(overdue|missed|urgent|asap)\b/.test(lower)) return '🚨';
  if (/\b(today|tonight)\b/.test(lower)) return '📌';
  if (/\b(tomorrow)\b/.test(lower)) return '🗓️';
  if (/\b(time|o'?clock|\d{1,2}:\d{2}|am|pm)\b/.test(lower)) return '⏰';
  if (/\b(date|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(lower)) {
    return '📅';
  }
  const cycle = ['✨', '🔹', '💫', '🔸'];
  return cycle[index % cycle.length];
}

/**
 * Lightweight markdown renderer for AI chat bubbles:
 * bold, italic, code, headings, bullets, checklists — with emoji accents.
 */
export default function FormattedChatText({ text }: { text: string }) {
  const lines = text.split('\n');
  let bulletIndex = 0;

  return (
    <div className="space-y-1.5 break-words text-[13.5px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trimStart();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" aria-hidden />;
        }

        // Headings: # ## ###
        const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (heading) {
          const level = heading[1].length;
          const content = heading[2];
          const size =
            level === 1 ? 'text-base font-bold' : level === 2 ? 'text-[15px] font-bold' : 'text-sm font-semibold';
          return (
            <p key={idx} className={`m-0 mt-1 ${size} text-slate-900`}>
              <span className="mr-1" aria-hidden>
                {level === 1 ? '🌟' : level === 2 ? '✨' : '📎'}
              </span>
              {renderInline(content, `h${idx}`)}
            </p>
          );
        }

        // Checklist: - [ ] / - [x]
        if (/^[-*]\s+\[[ xX]\]\s+/.test(trimmed)) {
          const checked = /^\s*[-*]\s+\[[xX]\]/.test(line);
          const content = trimmed.replace(/^[-*]\s+\[[ xX]\]\s+/, '');
          return (
            <div key={idx} className="flex gap-2 items-start pl-0.5">
              <span className="shrink-0 select-none leading-none mt-0.5" aria-hidden>
                {checked ? '✅' : '⬜'}
              </span>
              <span className={checked ? 'text-slate-500 line-through' : undefined}>
                {renderInline(content, `c${idx}`)}
              </span>
            </div>
          );
        }

        // Numbered list: 1. item
        const numbered = trimmed.match(/^(\d+)\.\s+(.+)$/);
        if (numbered) {
          return (
            <div key={idx} className="flex gap-2 items-start pl-0.5">
              <span className="shrink-0 select-none font-semibold text-blue-600 tabular-nums min-w-[1.25rem]">
                {numbered[1]}.
              </span>
              <span>{renderInline(numbered[2], `n${idx}`)}</span>
            </div>
          );
        }

        // Bullet list: - * •
        if (/^[-*•]\s+/.test(trimmed)) {
          const content = trimmed.replace(/^[-*•]\s+/, '');
          const emoji = bulletEmoji(content, bulletIndex++);
          return (
            <div key={idx} className="flex gap-2 items-start pl-0.5">
              <span className="shrink-0 select-none leading-none mt-0.5" aria-hidden>
                {emoji}
              </span>
              <span>{renderInline(content, `b${idx}`)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="m-0">
            {renderInline(line, `p${idx}`)}
          </p>
        );
      })}
    </div>
  );
}
