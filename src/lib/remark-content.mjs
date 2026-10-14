// Preserve the original Markdown, including the old blogs' youtube: syntax.
export function youtubeId(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) ||
      !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(url.hostname)) return;
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1)
      : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
    if (id && /^[\w-]{11}$/.test(id)) return id;
  } catch { /* Invalid embeds remain readable inline code. */ }
}

export default function remarkContent() {
  return tree => {
    function visit(node) {
      if (node.type === 'inlineCode' && node.value.startsWith('youtube:')) {
        const id = youtubeId(node.value.slice(8));
        if (id) {
          node.type = 'html';
          node.value = `<span class="video-embed" data-video-id="${id}"><button type="button" hidden>Load YouTube video</button><a href="https://www.youtube.com/watch?v=${id}">Watch on YouTube</a></span>`;
        }
      }
      // This legacy image points to an HTML website, not an image. Keep its text and URL.
      if (node.type === 'image' && node.url === 'https://devk.or.kr/') {
        node.type = 'link';
        node.children = [{ type: 'text', value: node.alt }];
        delete node.alt;
      }
      if (!node.children) return;
      node.children.forEach(visit);
      node.children = node.children.flatMap(child => {
        if (child.type !== 'paragraph' || !child.children.some(item => item.type === 'image') ||
          !child.children.every(item => item.type === 'image' || (item.type === 'text' && !item.value.trim()))) return [child];
        return child.children.filter(item => item.type === 'image').map(img => ({
          type: 'paragraph', data: { hName: 'figure' }, children: [img,
            ...(img.alt ? [{ type: 'paragraph', data: { hName: 'figcaption' }, children: [{ type: 'text', value: img.alt }] }] : []),
          ],
        }));
      });
    }
    visit(tree);
  };
}

export function rehypeReadableBlocks() {
  return tree => {
    function visit(node) {
      if (node.type === 'element' && (node.tagName === 'pre' || node.properties?.className?.includes('katex-display'))) {
        node.properties = { ...node.properties, tabIndex: 0, role: 'region', ariaLabel: node.tagName === 'pre' ? 'Code block' : 'Math equation' };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
