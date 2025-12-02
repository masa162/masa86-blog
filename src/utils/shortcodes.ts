/**
 * ショートコード処理ユーティリティ
 * Markdown変換前にショートコードをHTMLに変換します
 */

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
            // HTMLエスケープ処理
            const escapeHtml = (str: string) => {
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            const escapedLink = escapeHtml(link);
            const escapedImage = escapeHtml(image);
            const escapedTitle = escapeHtml(title);

            return `<div class="amazon-card">
  <a href="${escapedLink}" target="_blank" rel="noopener noreferrer nofollow">
    <img src="${escapedImage}" alt="${escapedTitle}" class="amazon-image">
    <div class="amazon-info">
      <p class="amazon-title">${escapedTitle}</p>
      <span class="amazon-button">Amazonで見る</span>
    </div>
  </a>
</div>`;
        }
    );

    return content;
}
