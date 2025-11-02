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
