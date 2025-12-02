import { html } from 'hono/html';

export interface SEOMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export interface SidebarData {
  tags?: string[];
  archives?: { year: number; month: number; count: number; label: string }[];
  hierarchicalArchives?: {
    year: number;
    months: {
      month: number;
      label: string;
      count: number;
      posts: {
        slug: string;
        title: string;
        createdAt: string;
      }[];
    }[];
  }[];
  currentSlug?: string;
}

export const layout = (title: string, content: string, seo?: SEOMetadata, sidebar?: SidebarData) => {
  const fullTitle = seo?.title || `${title} | 中山雑記`;
  const description = seo?.description || '中山正之の雑記ブログ';
  const keywords = seo?.keywords?.join(', ') || 'ブログ, 技術, プログラミング, 雑記';
  const ogUrl = seo?.ogUrl || 'https://blog.masa86.com';
  const ogImage = seo?.ogImage || '';  // OGP画像はテキストのみ
  const ogType = seo?.type || 'website';

  return html`<!DOCTYPE html>
<html lang="ja">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-21LTJSMZPJ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-21LTJSMZPJ');
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>

  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" type="image/x-icon">

  <!-- SEO Meta Tags -->
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="中山正之">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${ogUrl}">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  ${ogImage ? html`<meta property="og:image" content="${ogImage}">` : ''}
  <meta property="og:site_name" content="中山雑記">
  ${seo?.publishedTime ? html`<meta property="article:published_time" content="${seo.publishedTime}">` : ''}
  ${seo?.modifiedTime ? html`<meta property="article:modified_time" content="${seo.modifiedTime}">` : ''}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary">
  <meta property="twitter:url" content="${ogUrl}">
  <meta property="twitter:title" content="${fullTitle}">
  <meta property="twitter:description" content="${description}">
  ${ogImage ? html`<meta property="twitter:image" content="${ogImage}">` : ''}

  <!-- Canonical URL -->
  <link rel="canonical" href="${ogUrl}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      padding: 20px;
    }
    .content-wrapper {
      display: flex;
      gap: 20px;
    }
    .main-content {
      flex: 1;
      min-width: 0;
    }
    .sidebar {
      width: 220px;
      flex-shrink: 0;
    }
    @media (max-width: 768px) {
      .content-wrapper {
        flex-direction: column;
      }
      .sidebar {
        width: 100%;
      }
      .container {
        padding: 10px;
      }
    }
    header {
      margin-bottom: 30px;
      padding-bottom: 22px;
    }
    h1 {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 0;
      color: #333333;
    }
    .site-title {
      color: #333333;
      text-decoration: none;
    }
    .site-title:hover {
      color: #0066cc;
      text-decoration: none;
    }
    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #2d4a3a;
    }
    nav {
      margin-top: 15px;
    }
    nav a {
      margin-right: 1.5rem;
      text-decoration: none;
      color: #0066cc;
      font-size: 14px;
    }
    nav a:hover {
      color: #004499;
      text-decoration: underline;
    }
    article {
      background: #ffffff;
      padding: 15px;
      margin-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    article h2 {
      margin: 0 0 20px 0;
    }
    article h2 a {
      text-decoration: none;
      color: #2288bb;
      font-size: 24px;
      font-weight: 600;
    }
    article h2 a:hover {
      color: #33aaff;
      text-decoration: underline;
    }
    .post-meta {
      display: inline-block;
      background: #bbbbbb;
      color: #ffffff;
      font-size: 11px;
      padding: 5px 10px;
      margin-bottom: 10px;
    }
    .tag {
      display: inline-block;
      background: #eeeeee;
      color: #666666;
      padding: 3px 8px;
      font-size: 11px;
      margin-right: 5px;
      margin-bottom: 5px;
    }
    .content {
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #333333;
      line-height: 1.6;
    }
    .content h1 {
      color: #2d4a3a;
      font-size: 24px;
      font-weight: 700;
      margin: 30px 0 20px 0;
      padding-bottom: 8px;
      border-bottom: 3px solid #2d4a3a;
    }
    .content h2 {
      color: #2d4a3a;
      font-size: 24px;
      font-weight: 600;
      margin: 30px 0 15px 0;
      padding-bottom: 5px;
      border-bottom: 2px solid #e0e0e0;
    }
    .content h3 {
      color: #2d4a3a;
      font-size: 20px;
      font-weight: 600;
      margin: 25px 0 10px 0;
    }
    .content p {
      margin: 15px 0;
    }
    .content blockquote {
      margin: 15px 0;
      padding: 15px 20px;
      background-color: #f9f9f9;
      border-left: 4px solid #0066cc;
      font-style: italic;
      color: #666666;
    }
    .content code {
      font-family: 'Courier New', monospace;
      background-color: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 14px;
    }
    .content pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
    }
    .content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #dddddd;
    }
    th {
      background: #eeeeee;
      font-weight: bold;
      color: #666666;
      font-size: 12px;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      color: #004499;
      text-decoration: underline;
    }
    button, .primary, .secondary {
      padding: 8px 15px;
      margin-right: 8px;
      margin-bottom: 8px;
      border: 1px solid #dddddd;
      background: #ffffff;
      color: #666666;
      cursor: pointer;
      font-size: 12px;
      font-family: inherit;
    }
    button:hover, .primary:hover {
      background: #eeeeee;
    }
    button.primary {
      background: #0066cc;
      color: #ffffff;
      border-color: #0066cc;
    }
    button.primary:hover {
      background: #004499;
      border-color: #004499;
    }
    button.secondary {
      background: #ffffff;
      color: #666666;
      border-color: #dddddd;
    }
    button.secondary:hover {
      background: #eeeeee;
    }
    button.danger {
      background: #cc0000;
      color: #ffffff;
      border-color: #cc0000;
    }
    button.danger:hover {
      background: #dd0000;
    }
    input[type="text"], input[type="date"], select, textarea {
      font-size: 13px;
      font-family: inherit;
      color: #666666;
      border: 1px solid #dddddd;
      padding: 6px 8px;
    }
    input:disabled {
      background: #eeeeee;
      cursor: not-allowed;
    }
    label {
      font-size: 12px;
      color: #666666;
    }
    .back-link {
      display: inline-block;
      margin-top: 15px;
      color: #0066cc;
      text-decoration: none;
      font-size: 13px;
    }
    .back-link:hover {
      color: #004499;
      text-decoration: underline;
    }
    .sidebar-section {
      margin-bottom: 30px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    .sidebar-section h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333333;
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    .sidebar-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .sidebar-section li {
      margin-bottom: 8px;
    }
    .sidebar-section a {
      font-size: 14px;
      color: #0066cc;
      text-decoration: none;
    }
    .sidebar-section a:hover {
      color: #004499;
      text-decoration: underline;
    }
    .sidebar-section p {
      font-size: 14px;
      line-height: 1.5;
      color: #666666;
      margin: 0 0 10px 0;
    }
    .tag-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tag-cloud a {
      display: inline-block;
      background: #f0f0f0;
      color: #666666;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      text-decoration: none;
    }
    .tag-cloud a:hover {
      background: #e0e0e0;
      color: #333333;
    }
    /* 階層型アーカイブ */
    .archive-tree {
      font-size: 14px;
    }
    .archive-year {
      margin-bottom: 10px;
    }
    .archive-year-header {
      cursor: pointer;
      user-select: none;
      padding: 5px 0;
      font-weight: 600;
      color: #333333;
    }
    .archive-year-header:hover {
      color: #0066cc;
    }
    .archive-months {
      padding-left: 20px;
      margin-top: 5px;
    }
    .archive-months.collapsed {
      display: none;
    }
    .archive-month {
      margin-bottom: 8px;
    }
    .archive-month-header {
      cursor: pointer;
      user-select: none;
      padding: 3px 0;
      color: #555555;
    }
    .archive-month-header:hover {
      color: #0066cc;
    }
    .archive-posts {
      padding-left: 20px;
      margin-top: 5px;
    }
    .archive-posts.collapsed {
      display: none;
    }
    .archive-post {
      display: block;
      padding: 2px 0;
      color: #0066cc;
      text-decoration: none;
      font-size: 13px;
    }
    .archive-post:hover {
      color: #004499;
      text-decoration: underline;
    }
    .archive-post.current-post {
      font-weight: bold;
      color: #ff6600;
      background-color: #fff3e0;
      padding: 2px 4px;
      border-radius: 3px;
    }
    .expand-icon {
      display: inline-block;
      width: 12px;
      font-size: 12px;
      margin-right: 5px;
    }
    /* Amazon商品カード */
    .amazon-card {
      display: block;
      margin: 20px 0;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
      transition: box-shadow 0.3s ease;
    }
    .amazon-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .amazon-card a {
      display: flex;
      text-decoration: none;
      color: inherit;
    }
    .amazon-image {
      width: 150px;
      height: 150px;
      object-fit: contain;
      flex-shrink: 0;
      padding: 10px;
      background: #ffffff;
    }
    .amazon-info {
      flex: 1;
      padding: 15px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .amazon-title {
      font-size: 16px;
      font-weight: 600;
      color: #333333;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }
    .amazon-button {
      display: inline-block;
      background: #ff9900;
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      align-self: flex-start;
    }
    .amazon-card:hover .amazon-button {
      background: #e88800;
    }
    /* スマホ用 ↑ ボタン */
    #scroll-to-top {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #0066cc;
      color: #ffffff;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      display: none;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    #scroll-to-top:hover {
      background: #004499;
    }
    /* ハンバーガーメニュー */
    #hamburger-menu {
      display: none;
      position: fixed;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      flex-direction: column;
      justify-content: space-around;
      cursor: pointer;
      z-index: 1001;
    }
    #hamburger-menu span {
      display: block;
      width: 100%;
      height: 3px;
      background: #333;
      transition: 0.3s;
    }
    #hamburger-menu.active span:nth-child(1) {
      transform: rotate(45deg) translateY(12px);
    }
    #hamburger-menu.active span:nth-child(2) {
      opacity: 0;
    }
    #hamburger-menu.active span:nth-child(3) {
      transform: rotate(-45deg) translateY(-12px);
    }
    @media (max-width: 768px) {
      body {
        font-size: 16px;
        line-height: 1.6;
      }
      h1 {
        font-size: 32px;
      }
      article h2 a {
        font-size: 22px;
      }
      article {
        padding: 15px;
        margin-bottom: 45px;
      }
      header {
        margin-bottom: 30px;
        padding-bottom: 15px;
      }
      #scroll-to-top {
        display: block;
      }
      #hamburger-menu {
        display: flex;
      }
      .sidebar {
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        height: 100vh;
        background: #fff;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
        overflow-y: auto;
        transition: right 0.3s ease;
        z-index: 1000;
        padding: 80px 20px 20px 20px;
      }
      .sidebar.active {
        right: 0;
      }
      .amazon-card a {
        flex-direction: column;
      }
      .amazon-image {
        width: 100%;
        height: auto;
        max-height: 200px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1><a href="/" class="site-title">中山雑記</a></h1>
    </header>
    <div class="content-wrapper">
      <main class="main-content">
        ${content}
      </main>
      <aside class="sidebar">
        <div class="sidebar-section">
          <div style="text-align: center; margin-bottom: 15px;">
            <img src="/profile.jpg" alt="中山正之" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
          </div>
          <p style="font-weight: bold; text-align: center; margin-bottom: 5px;">中山正之</p>
          <p style="font-size: 12px; color: #666; margin-bottom: 3px;">1986年生まれ　神奈川県出身</p>
          <p style="font-size: 12px; color: #666;">belong2jazz@gmail.com</p>
          <p style="font-size: 12px; color: #666;">090-2405-5122</p>
        </div>

        <div class="sidebar-section">
          <h3>検索</h3>
          <form method="GET" action="/">
            <input type="text" name="keyword" placeholder="検索..." style="width: 100%; padding: 6px 8px; font-size: 13px;">
            <button type="submit" class="primary" style="width: 100%; margin-top: 8px;">検索</button>
          </form>
        </div>

        <div class="sidebar-section">
          <h3>記事一覧</h3>
          <ul>
            <li><a href="/">すべての記事</a></li>
            <li><a href="/archive">アーカイブ</a></li>
            <li><a href="/sitemap">サイトマップ</a></li>
          </ul>
        </div>

        ${sidebar?.hierarchicalArchives && sidebar.hierarchicalArchives.length > 0 ? html`
        <div class="sidebar-section">
          <h3>アーカイブ</h3>
          <div class="archive-tree">
            ${sidebar.hierarchicalArchives.map((yearData, yearIndex) => {
    let currentYearIndex = -1;
    let currentMonthIndex = -1;

    if (sidebar.currentSlug) {
      yearData.months.forEach((monthData, monthIdx) => {
        const foundPost = monthData.posts.find(p => p.slug === sidebar.currentSlug);
        if (foundPost) {
          currentYearIndex = yearIndex;
          currentMonthIndex = monthIdx;
        }
      });
    }

    const isLatestYear = yearIndex === 0;
    const isCurrentYear = currentYearIndex === yearIndex;
    const shouldExpandYear = isLatestYear || isCurrentYear;

    return html`
                <div class="archive-year">
                  <div class="archive-year-header" onclick="toggleYear(${yearIndex})">
                    <span class="expand-icon" id="year-icon-${yearIndex}">${shouldExpandYear ? '▼' : '▶'}</span>
                    ${yearData.year}年
                  </div>
                  <div class="archive-months${shouldExpandYear ? '' : ' collapsed'}" id="year-${yearIndex}">
                    ${yearData.months.map((monthData, monthIndex) => {
      const isLatestMonth = yearIndex === 0 && monthIndex === 0;
      const isCurrentMonth = currentYearIndex === yearIndex && currentMonthIndex === monthIndex;
      const shouldExpandMonth = isLatestMonth || isCurrentMonth;

      return html`
                        <div class="archive-month">
                          <div class="archive-month-header" onclick="toggleMonth(${yearIndex}, ${monthIndex})">
                            <span class="expand-icon" id="month-icon-${yearIndex}-${monthIndex}">${shouldExpandMonth ? '▼' : '▶'}</span>
                            ${monthData.label} (${monthData.count})
                          </div>
                          <div class="archive-posts${shouldExpandMonth ? '' : ' collapsed'}" id="month-${yearIndex}-${monthIndex}">
                            ${monthData.posts.map(post =>
        html`<a href="/posts/${post.slug}" class="archive-post${post.slug === sidebar.currentSlug ? ' current-post' : ''}">・${post.title}</a>`
      )}
                          </div>
                        </div>
                      `;
    })}
                  </div>
                </div>
              `;
  })}
          </div>
        </div>
        ` : ''}

        ${sidebar?.tags && sidebar.tags.length > 0 ? html`
        <div class="sidebar-section">
          <h3>タグ</h3>
          <div class="tag-cloud">
            ${sidebar.tags.map(tag =>
    html`<a href="/?tag=${encodeURIComponent(tag)}">${tag}</a>`
  )}
          </div>
        </div>
        ` : ''}
      </aside>
    </div>
  </div>

  <!-- ハンバーガーメニュー -->
  <div id="hamburger-menu">
    <span></span>
    <span></span>
    <span></span>
  </div>

  <!-- スクロールトップボタン -->
  <button id="scroll-to-top">↑</button>

  <script>
    // ハンバーガーメニュー
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.querySelector('.sidebar');

    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      sidebar.classList.toggle('active');
    });

    // サイドバー外をクリックしたら閉じる
    document.addEventListener('click', function(event) {
      if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
      }
    });

    // スクロールトップボタン
    const scrollBtn = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        scrollBtn.style.display = 'block';
      } else {
        scrollBtn.style.display = 'none';
      }
    });

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  </script>
  <script>
    function toggleYear(yearIndex) {
      const monthsEl = document.getElementById('year-' + yearIndex);
      const iconEl = document.getElementById('year-icon-' + yearIndex);

      if (monthsEl.classList.contains('collapsed')) {
        monthsEl.classList.remove('collapsed');
        iconEl.textContent = '▼';
      } else {
        monthsEl.classList.add('collapsed');
        iconEl.textContent = '▶';
      }
    }

    function toggleMonth(yearIndex, monthIndex) {
      const postsEl = document.getElementById('month-' + yearIndex + '-' + monthIndex);
      const iconEl = document.getElementById('month-icon-' + yearIndex + '-' + monthIndex);

      if (postsEl.classList.contains('collapsed')) {
        postsEl.classList.remove('collapsed');
        iconEl.textContent = '▼';
      } else {
        postsEl.classList.add('collapsed');
        iconEl.textContent = '▶';
      }
    }
  </script>
</body>
</html>`;
};

// 管理画面専用レイアウト（サイドバーなし）
export const adminLayout = (title: string, content: string) => {
  return html`<!DOCTYPE html>
<html lang="ja">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-21LTJSMZPJ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-21LTJSMZPJ');
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | 中山雑記 管理画面</title>
  <link rel="icon" href="/favicon.ico" type="image/x-icon">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    h1 {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #333333;
    }
    h1 a {
      color: #333333;
      text-decoration: none;
    }
    h1 a:hover {
      color: #0066cc;
    }
    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #2d4a3a;
    }
    h2 a {
      color: #2d4a3a;
      text-decoration: none;
    }
    h2 a:hover {
      color: #0066cc;
      text-decoration: underline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #dddddd;
    }
    th {
      background: #f5f5f5;
      font-weight: bold;
      color: #333333;
      font-size: 14px;
    }
    button, .primary, .secondary, .danger {
      padding: 8px 15px;
      margin-right: 8px;
      margin-bottom: 8px;
      border: 1px solid #dddddd;
      background: #ffffff;
      color: #666666;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      border-radius: 4px;
    }
    button:hover {
      background: #f0f0f0;
    }
    button.primary {
      background: #0066cc;
      color: #ffffff;
      border-color: #0066cc;
    }
    button.primary:hover {
      background: #004499;
      border-color: #004499;
    }
    button.secondary {
      background: #999999;
      color: #ffffff;
      border-color: #999999;
    }
    button.secondary:hover {
      background: #666666;
      border-color: #666666;
    }
    button.danger {
      background: #dc3545;
      color: #ffffff;
      border-color: #dc3545;
    }
    button.danger:hover {
      background: #c82333;
      border-color: #c82333;
    }
    input[type="text"],
    input[type="date"],
    textarea,
    select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      color: #004499;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1><a href="/">中山雑記</a></h1>
      <p style="color: #666; font-size: 14px;">管理画面</p>
    </header>
    <main>
      ${content}
    </main>
  </div>
</body>
</html>`;
};
