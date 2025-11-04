import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, like, and, sql } from 'drizzle-orm';
import { posts, type Post, type NewPost } from '../db/schema';

export interface SearchOptions {
  keyword?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export async function getAllPosts(db: D1Database): Promise<Post[]> {
  const drizzleDb = drizzle(db);
  const result = await drizzleDb
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  return result.map(post => ({
    ...post,
    tags: JSON.parse(post.tags)
  }));
}

export async function searchPosts(db: D1Database, options: SearchOptions): Promise<{ posts: Post[]; total: number }> {
  const drizzleDb = drizzle(db);
  const conditions: any[] = [];

  // キーワード検索（タイトルまたは本文）
  if (options.keyword) {
    const keyword = `%${options.keyword}%`;
    conditions.push(
      sql`(${posts.title} LIKE ${keyword} OR ${posts.content} LIKE ${keyword})`
    );
  }

  // タグフィルタ
  if (options.tag) {
    conditions.push(sql`${posts.tags} LIKE ${'%"' + options.tag + '"%'}`);
  }

  // 日付範囲フィルタ
  if (options.startDate) {
    conditions.push(sql`${posts.createdAt} >= ${options.startDate}`);
  }
  if (options.endDate) {
    conditions.push(sql`${posts.createdAt} <= ${options.endDate}`);
  }

  // 条件を組み合わせてクエリ実行
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 総数取得
  const countResult = await drizzleDb
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(whereClause);
  const total = countResult[0]?.count || 0;

  // ページネーション付きデータ取得
  let query = drizzleDb
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  if (whereClause) {
    query = query.where(whereClause) as any;
  }

  if (options.limit) {
    query = query.limit(options.limit) as any;
  }

  if (options.offset) {
    query = query.offset(options.offset) as any;
  }

  const result = await query;

  return {
    posts: result.map(post => ({
      ...post,
      tags: JSON.parse(post.tags)
    })),
    total
  };
}

export async function getPostBySlug(db: D1Database, slug: string): Promise<Post | undefined> {
  const drizzleDb = drizzle(db);
  const result = await drizzleDb
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!result[0]) return undefined;

  return {
    ...result[0],
    tags: JSON.parse(result[0].tags)
  };
}

export async function createPost(db: D1Database, data: NewPost): Promise<Post> {
  const drizzleDb = drizzle(db);

  // タグをJSON文字列に変換
  const tagsJson = Array.isArray(data.tags)
    ? JSON.stringify(data.tags)
    : data.tags;

  const result = await drizzleDb
    .insert(posts)
    .values({ ...data, tags: tagsJson })
    .returning();

  return {
    ...result[0],
    tags: JSON.parse(result[0].tags)
  };
}

export async function updatePost(
  db: D1Database,
  slug: string,
  data: Partial<NewPost>
): Promise<Post | undefined> {
  const drizzleDb = drizzle(db);

  // タグをJSON文字列に変換
  const updateData: any = { ...data };
  if (data.tags && Array.isArray(data.tags)) {
    updateData.tags = JSON.stringify(data.tags);
  }

  const result = await drizzleDb
    .update(posts)
    .set({ ...updateData, updatedAt: new Date().toISOString() })
    .where(eq(posts.slug, slug))
    .returning();

  if (!result[0]) return undefined;

  return {
    ...result[0],
    tags: JSON.parse(result[0].tags)
  };
}

export async function deletePost(db: D1Database, slug: string): Promise<boolean> {
  const drizzleDb = drizzle(db);

  const result = await drizzleDb
    .delete(posts)
    .where(eq(posts.slug, slug))
    .returning();

  return result.length > 0;
}

export async function getAllTags(db: D1Database): Promise<string[]> {
  const drizzleDb = drizzle(db);
  const allPosts = await drizzleDb.select({ tags: posts.tags }).from(posts);

  const tagsSet = new Set<string>();
  allPosts.forEach(post => {
    const tags = JSON.parse(post.tags);
    tags.forEach((tag: string) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

export interface ArchiveEntry {
  year: number;
  month: number;
  count: number;
  label: string;
}

export async function getArchives(db: D1Database): Promise<ArchiveEntry[]> {
  const drizzleDb = drizzle(db);
  const allPosts = await drizzleDb
    .select({ createdAt: posts.createdAt })
    .from(posts)
    .orderBy(desc(posts.createdAt));

  const archiveMap = new Map<string, number>();

  allPosts.forEach(post => {
    const date = new Date(post.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    archiveMap.set(key, (archiveMap.get(key) || 0) + 1);
  });

  return Array.from(archiveMap.entries())
    .map(([key, count]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        year,
        month,
        count,
        label: `${year}年${month}月`
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
}

export async function getPostsByYearMonth(db: D1Database, year: number, month: number): Promise<Post[]> {
  const drizzleDb = drizzle(db);

  // 月の開始日と終了日を計算
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const result = await drizzleDb
    .select()
    .from(posts)
    .where(
      and(
        sql`${posts.createdAt} >= ${startDate}`,
        sql`${posts.createdAt} < ${endDate}`
      )
    )
    .orderBy(desc(posts.createdAt));

  return result.map(post => ({
    ...post,
    tags: JSON.parse(post.tags)
  }));
}

export async function getNextSlugNumber(db: D1Database): Promise<string> {
  const drizzleDb = drizzle(db);
  const allPosts = await drizzleDb
    .select({ slug: posts.slug })
    .from(posts);

  // 既存のslugから数値部分を抽出し、最大値を取得
  let maxNumber = 0;
  allPosts.forEach(post => {
    const match = post.slug.match(/^(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  });

  // 次の番号を4桁ゼロパディングで返す
  const nextNumber = maxNumber + 1;
  return String(nextNumber).padStart(4, '0');
}

export interface HierarchicalArchive {
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
}

export async function getAdjacentPosts(db: D1Database, currentSlug: string): Promise<{ prev: Post | null; next: Post | null }> {
  const drizzleDb = drizzle(db);

  // すべての記事を作成日時順（降順）で取得
  const allPosts = await drizzleDb
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt));

  // 現在の記事のインデックスを見つける
  const currentIndex = allPosts.findIndex(post => post.slug === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  // 前の記事（新しい記事）= index - 1
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // 次の記事（古い記事）= index + 1
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return {
    prev: prevPost ? { ...prevPost, tags: JSON.parse(prevPost.tags) } : null,
    next: nextPost ? { ...nextPost, tags: JSON.parse(nextPost.tags) } : null
  };
}

export async function getHierarchicalArchives(db: D1Database): Promise<HierarchicalArchive[]> {
  const drizzleDb = drizzle(db);
  const allPosts = await drizzleDb
    .select({
      slug: posts.slug,
      title: posts.title,
      createdAt: posts.createdAt
    })
    .from(posts)
    .orderBy(desc(posts.createdAt));

  // 年→月→記事の階層構造を構築
  const yearMap = new Map<number, Map<number, { slug: string; title: string; createdAt: string }[]>>();

  allPosts.forEach(post => {
    const date = new Date(post.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (!yearMap.has(year)) {
      yearMap.set(year, new Map());
    }

    const monthMap = yearMap.get(year)!;
    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }

    monthMap.get(month)!.push({
      slug: post.slug,
      title: post.title,
      createdAt: post.createdAt
    });
  });

  // Map を配列に変換してソート
  const result: HierarchicalArchive[] = [];

  Array.from(yearMap.entries())
    .sort((a, b) => b[0] - a[0]) // 年を降順でソート
    .forEach(([year, monthMap]) => {
      const months = Array.from(monthMap.entries())
        .sort((a, b) => b[0] - a[0]) // 月を降順でソート
        .map(([month, postList]) => ({
          month,
          label: `${month}月`,
          count: postList.length,
          posts: postList
        }));

      result.push({ year, months });
    });

  return result;
}
