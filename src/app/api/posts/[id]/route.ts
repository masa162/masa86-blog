/**
 * Single Post API Route
 * 
 * Handles fetching, updating, and deleting individual posts
 */

export const runtime = 'edge';

import { getD1 } from '@/lib/d1';
import { postRowToPost, formatDate } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import type { PostRow, UpdatePostRequest } from '@/types/database';

/**
 * GET /api/posts/[id]
 * Retrieve a single post by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getD1();
    
    const { results } = await db
      .prepare('SELECT * FROM posts WHERE id = ?')
      .bind(parseInt(id, 10))
      .all<PostRow>();
    
    if (!results || results.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Post not found' 
        }, 
        { status: 404 }
      );
    }

    const post = postRowToPost(results[0]);

    return NextResponse.json({ 
      success: true, 
      data: post 
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch post',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/posts/[id]
 * Update a post
 * Requires Basic Authentication (via middleware)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePostRequest = await req.json();
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
    const now = formatDate();
    const tagsJson = JSON.stringify(tags || []);

    await db
      .prepare(`
        UPDATE posts 
        SET title = ?, content = ?, tags = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(title, content, tagsJson, now, parseInt(id, 10))
      .run();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Post updated successfully'
      }
    );
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update post',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete a post
 * Requires Basic Authentication (via middleware)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getD1();

    await db
      .prepare('DELETE FROM posts WHERE id = ?')
      .bind(parseInt(id, 10))
      .run();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Post deleted successfully'
      }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete post',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

