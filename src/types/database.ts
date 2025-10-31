/**
 * Database types
 */

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PostRow {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  tags: string[];
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  tags: string[];
}

