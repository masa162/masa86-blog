export interface Env {
  DB: D1Database;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
}

export interface PostCreateRequest {
  slug: string;
  title: string;
  content: string;
  tags: string[];
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  tags?: string[];
}
