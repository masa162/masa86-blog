/**
 * Posts API Route
 * 
 * Handles listing and creating posts
 */

export const runtime = 'edge';

import { getD1 } from '@/lib/d1';
import { postRowToPost, formatDate, generateNextSlug } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import type { PostRow, CreatePostRequest } from '@/types/database';

/**
 * GET /api/posts
 * Retrieve posts with optional filtering
 * Query params:
 * - limit: number of posts (default: 10)
 * - tag: filter by tag
 * - search: search in title and content
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const db = getD1();
    let query = 'SELECT * FROM posts WHERE 1=1';
    const params: any[] = [];

    // Filter by tag
    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%"${tag}"%`);
    }

    // Search in title and content
    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const stmt = db.prepare(query);
    const { results } = await stmt.bind(...params).all<PostRow>();
    
    const posts = (results || []).map(postRowToPost);

    return NextResponse.json({ 
      success: true, 
      data: posts 
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch posts',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * Create a new post
 * Requires Basic Authentication (via middleware)
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreatePostRequest = await req.json();
    const { title, content, tags } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          message: 'title and content are required' 
        }, 
        { status: 400 }
      );
    }

    const db = getD1();

    // Generate next slug
    const { results: maxSlugResults } = await db
      .prepare('SELECT slug FROM posts ORDER BY slug DESC LIMIT 1')
      .all<{ slug: string }>();
    
    const maxSlug = maxSlugResults && maxSlugResults.length > 0 ? maxSlugResults[0].slug : null;
    const slug = generateNextSlug(maxSlug);

    // Insert post
    const now = formatDate();
    const tagsJson = JSON.stringify(tags || []);

    await db
      .prepare(`
        INSERT INTO posts (
          slug, title, content, tags, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(slug, title, content, tagsJson, now, now)
      .run();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Post created successfully',
        data: { slug }
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create post',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

