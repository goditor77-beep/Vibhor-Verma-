/**
 * Lightweight, safe markdown formatter for Quick Notes scratchpad
 */
export function formatMarkdown(text: string): string {
  if (!text) return '';

  let html = text
    // Escape basic HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-zinc-300">$1</em>');

  // Inline Code / Formula: `text`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-zinc-800 text-white px-1.5 py-0.5 rounded text-[11px] font-mono border border-zinc-700">$1</code>'
  );

  // Unordered list items: - item or * item
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc text-zinc-300">$1</li>');

  // Line breaks
  html = html.replace(/\n/g, '<br/>');

  return html;
}
