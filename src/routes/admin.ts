import { Hono } from 'hono';
import { basicAuth } from '../middleware/auth';
import * as postService from '../services/posts';
import { adminLayout } from '../views/layout';
import { adminPage } from '../views/admin';
import { adminNotesPage } from '../views/admin-notes';
import type { Env } from '../types';

const admin = new Hono<{ Bindings: Env }>();

// 管理画面（認証必須）- 検索・フィルター・ページネーション対応
admin.get('/', basicAuth, async (c) => {
  try {
    // 検索・フィルターパラメータを取得
    const keyword = c.req.query('keyword') || undefined;
    const tag = c.req.query('tag') || undefined;
    const slug = c.req.query('slug') || undefined;
    const createdStart = c.req.query('createdStart') || undefined;
    const createdEnd = c.req.query('createdEnd') || undefined;
    const updatedStart = c.req.query('updatedStart') || undefined;
    const updatedEnd = c.req.query('updatedEnd') || undefined;
    const page = parseInt(c.req.query('page') || '1');
    const perPage = 20;

    // searchPostsを使用してフィルター適用
    const result = await postService.searchPosts(c.env.DB, {
      keyword,
      tag,
      slug,
      startDate: createdStart,
      endDate: createdEnd,
      updatedStartDate: updatedStart,
      updatedEndDate: updatedEnd,
      limit: perPage,
      offset: (page - 1) * perPage
    });

    // タグ一覧を取得（ドロップダウン用）
    const allTags = await postService.getAllTags(c.env.DB);

    const content = adminPage(result.posts, {
      page,
      totalPages: Math.ceil(result.total / perPage),
      total: result.total,
      keyword,
      tag,
      slug,
      createdStart,
      createdEnd,
      updatedStart,
      updatedEnd,
      tags: allTags
    });

    return c.html(adminLayout('管理画面', content));
  } catch (error) {
    console.error('[ERROR] GET /admin:', error);
    return c.html(adminLayout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

// 次のSlug番号を取得（認証必須）
admin.get('/next-slug', basicAuth, async (c) => {
  try {
    const nextSlug = await postService.getNextSlugNumber(c.env.DB);
    return c.json({ nextSlug });
  } catch (error) {
    console.error('[ERROR] GET /admin/next-slug:', error);
    return c.json({ error: 'Failed to get next slug' }, 500);
  }
});

// タグスラッグ管理ページ（認証必須）
admin.get('/tag-slugs', basicAuth, async (c) => {
  try {
    const allTags = await postService.getAllTags(c.env.DB);
    const existingSlugs = await postService.getAllTagSlugs(c.env.DB);
    const slugMap = new Map(existingSlugs.map(ts => [ts.tag, ts.slug]));

    const rows = allTags.map(tag => {
      const slug = slugMap.get(tag) || '';
      return `
        <tr>
          <td style="padding: 8px 12px;">${tag}</td>
          <td style="padding: 8px 12px;">
            <input type="text" data-tag="${tag.replace(/"/g, '&quot;')}" value="${slug}"
                   placeholder="例: weekly-scrap"
                   style="width: 200px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 13px;">
          </td>
          <td style="padding: 8px 12px;">
            ${slug ? `<a href="/tag/${slug}" target="_blank" style="color: #0066cc; font-size: 13px;">/tag/${slug}</a>` : '<span style="color: #999; font-size: 13px;">未設定</span>'}
          </td>
          <td style="padding: 8px 12px;">
            <button onclick="saveSlug('${tag.replace(/'/g, "\\'")}', this)" class="primary" style="padding: 4px 12px; font-size: 13px;">保存</button>
          </td>
        </tr>
      `;
    }).join('');

    const content = `
      <h2><a href="/admin" style="color: #2d4a3a; text-decoration: none;">管理画面</a> &gt; タグURL設定</h2>
      <p style="color: #666; margin-bottom: 20px; font-size: 14px;">
        タグに英数字スラッグを設定すると <code>/tag/スラッグ</code> でアクセスできます。スラッグは小文字英数字とハイフンのみ使用可。
      </p>
      <table style="width: 100%; border-collapse: collapse; background: #fff;">
        <thead>
          <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
            <th style="padding: 10px 12px; text-align: left;">タグ名</th>
            <th style="padding: 10px 12px; text-align: left;">スラッグ</th>
            <th style="padding: 10px 12px; text-align: left;">URL</th>
            <th style="padding: 10px 12px; text-align: left;"></th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="4" style="padding: 20px; color: #999;">タグがありません</td></tr>'}
        </tbody>
      </table>
      <div id="saveMsg" style="margin-top: 15px; font-size: 14px;"></div>
      <script>
        async function saveSlug(tag, btn) {
          const row = btn.closest('tr');
          const input = row.querySelector('input[data-tag]');
          const slug = input.value.trim();
          if (!slug) { alert('スラッグを入力してください'); return; }
          if (!/^[a-z0-9-]+$/.test(slug)) {
            alert('スラッグは小文字英数字とハイフンのみ使用できます');
            return;
          }
          try {
            const res = await fetch('/api/tag-slugs', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ tag, slug })
            });
            if (res.ok) {
              const urlCell = row.cells[2];
              urlCell.innerHTML = '<a href="/tag/' + slug + '" target="_blank" style="color: #0066cc; font-size: 13px;">/tag/' + slug + '</a>';
              document.getElementById('saveMsg').textContent = '保存しました：' + tag + ' → /tag/' + slug;
              document.getElementById('saveMsg').style.color = '#2d7a3a';
            } else {
              const err = await res.json();
              alert('保存に失敗しました: ' + (err.error || 'Unknown error'));
            }
          } catch (e) {
            alert('保存に失敗しました: ' + e.message);
          }
        }
      </script>
    `;
    return c.html(adminLayout('タグURL設定', content));
  } catch (error) {
    console.error('[ERROR] GET /admin/tag-slugs:', error);
    return c.html(adminLayout('エラー', '<h2>ページの表示に失敗しました</h2>'), 500);
  }
});

// 特記事項ページ（認証必須）
admin.get('/notes', basicAuth, async (c) => {
  try {
    const content = adminNotesPage();
    return c.html(adminLayout('特記事項', content));
  } catch (error) {
    console.error('[ERROR] GET /admin/notes:', error);
    return c.html(adminLayout('エラー', '<h2>ページの表示に失敗しました</h2>'), 500);
  }
});

export default admin;
