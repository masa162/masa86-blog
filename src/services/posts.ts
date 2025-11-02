import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { posts, type Post, type NewPost } from '../db/schema';

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
