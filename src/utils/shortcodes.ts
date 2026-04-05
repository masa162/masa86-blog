/**
 * ショートコード処理ユーティリティ
 * Markdown変換前にショートコードをHTMLに変換します
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function processShortcodes(content: string): string {
  // YouTube shortcode: {{\< youtube VIDEO_ID \>}}
  content = content.replace(
    /\{\{<\s*youtube\s+([a-zA-Z0-9_-]+)\s*>\}\}/g,
    '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0;"><iframe src="https://www.youtube.com/embed/$1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe></div>'
  );

  // Amazon shortcode: {{ amazon link="URL" image="IMAGE_URL" title="TITLE" }}
  content = content.replace(
    /\{\{\s*amazon\s+link="([^"]+)"\s+image="([^"]+)"\s+title="([^"]+)"\s*\}\}/g,
    (match, link, image, title) => {
      return `<div class="amazon-card">
  <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer nofollow">
    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="amazon-image">
    <div class="amazon-info">
      <p class="amazon-title">${escapeHtml(title)}</p>
      <span class="amazon-button">Amazonで見る</span>
    </div>
  </a>
</div>`;
    }
  );

  // Audio shortcode: {{ audio src="URL" }}
  content = content.replace(
    /\{\{\s*audio\s+src="([^"]+)"\s*\}\}/g,
    (match, src) => {
      return `<audio controls style="width: 100%; margin: 20px 0;">
  <source src="${escapeHtml(src)}" type="audio/mpeg">
  お使いのブラウザはaudio要素をサポートしていません。
</audio>`;
    }
  );

  return content;
}

/**
 * コンテンツ内のaudioショートコードからURLを抽出
 * Podcast RSS生成時に使用
 */
export function extractAudioUrls(content: string): string[] {
  const urls: string[] = [];
  const regex = /\{\{\s*audio\s+src="([^"]+)"\s*\}\}/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}
