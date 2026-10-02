// Deliberately tiny — we generate this content ourselves (AI answers), so a
// full markdown library is overkill. Escapes HTML first, then supports
// **bold**, *italic*, `code`, and simple "- " bullet lists.
function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(str: string) {
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

export function renderMarkdown(raw: string): string {
  const escaped = escapeHtml(raw);
  const lines = escaped.split('\n');
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ''))}</li>`);
    } else {
      if (inList) {
        html.push('</ul>');
        inList = false;
      }
      if (trimmed) html.push(`<p>${inline(trimmed)}</p>`);
    }
  }
  if (inList) html.push('</ul>');
  return html.join('');
}

export function Markdown({ content }: { content: string }) {
  return (
    <div
      className="prose-agriya"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
