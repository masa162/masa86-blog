/**
 * Utility functions
 */

import type { Post, PostRow } from '@/types/database';

/**
 * Convert PostRow from database to Post object
 */
export function postRowToPost(row: PostRow): Post {
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
  };
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Generate next slug (4-digit zero-padded)
 */
export function generateNextSlug(maxSlug: string | null): string {
  if (!maxSlug) {
    return '0001';
  }
  const nextNum = parseInt(maxSlug, 10) + 1;
  return nextNum.toString().padStart(4, '0');
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

/**
 * Extract plain text from markdown (simple version)
 */
// Re-export from markdown.ts for backward compatibility
export { markdownToPlainText } from './markdown';

export function markdownToPlainTextOld(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();
}

