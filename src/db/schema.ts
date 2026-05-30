import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: text('tags').notNull().default('[]'), // JSON string
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`)
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const tagSlugs = sqliteTable('tag_slugs', {
  tag: text('tag').primaryKey(),
  slug: text('slug').notNull().unique()
});

export type TagSlug = typeof tagSlugs.$inferSelect;
