import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定
const HUGO_POSTS_DIR = 'D:/github/masa86/content/posts';
const OUTPUT_SQL_FILE = path.join(__dirname, 'migration-data.sql');
const START_SLUG_NUMBER = 6; // 既存の0001-0005の次から
const TEST_MODE = process.argv.includes('--test'); // --test フラグでサンプル5件のみ
const TEST_LIMIT = 5;

// SQLエスケープ関数
function escapeSql(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

// 日付をISO形式に変換
function formatDate(date) {
  if (!date) return new Date().toISOString().slice(0, 19).replace('T', ' ');

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn(`Invalid date: ${date}, using current date`);
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Slug番号を4桁にフォーマット
function formatSlug(num) {
  return String(num).padStart(4, '0');
}

async function migrateFromHugo() {
  console.log('🚀 Starting migration from Hugo to masa86-blog...\n');

  // Markdownファイルを検索
  console.log(`📂 Scanning directory: ${HUGO_POSTS_DIR}`);
  const files = await glob(`${HUGO_POSTS_DIR}/**/*.md`, {
    ignore: ['**/templete_*.md', '**/*.ini']
  });

  console.log(`📄 Found ${files.length} markdown files\n`);

  // 各ファイルを解析
  const articles = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const { data: frontmatter, content: markdown } = matter(content);

      // 必須フィールドのチェック
      if (!frontmatter.title || !frontmatter.date) {
        console.warn(`⚠️  Skipping ${path.basename(file)}: missing title or date`);
        continue;
      }

      articles.push({
        originalFile: path.basename(file),
        title: frontmatter.title,
        date: frontmatter.date,
        oldSlug: frontmatter.slug || path.basename(file, '.md'),
        tags: frontmatter.tags || [],
        content: markdown.trim(),
        draft: frontmatter.draft || false
      });
    } catch (error) {
      console.error(`❌ Error parsing ${path.basename(file)}:`, error.message);
    }
  }

  console.log(`✅ Successfully parsed ${articles.length} articles\n`);

  // 日付順にソート（古い順）
  articles.sort((a, b) => new Date(a.date) - new Date(b.date));

  // テストモードの場合は最初の5件のみ
  const articlesToMigrate = TEST_MODE ? articles.slice(0, TEST_LIMIT) : articles;

  if (TEST_MODE) {
    console.log(`🧪 TEST MODE: Migrating only first ${TEST_LIMIT} articles\n`);
  }

  // SQLを生成
  console.log('📝 Generating SQL INSERT statements...\n');
  const sqlStatements = [];
  const mappingData = [];

  articlesToMigrate.forEach((article, index) => {
    const newSlug = formatSlug(START_SLUG_NUMBER + index);
    const title = escapeSql(article.title);
    const content = escapeSql(article.content);
    const tags = JSON.stringify(article.tags);
    const createdAt = formatDate(article.date);
    const updatedAt = createdAt; // 同じ日付を使用

    const sql = `INSERT INTO posts (slug, title, content, tags, created_at, updated_at)
VALUES ('${newSlug}', '${title}', '${content}', '${escapeSql(tags)}', '${createdAt}', '${updatedAt}');`;

    sqlStatements.push(sql);

    // マッピング情報を記録
    mappingData.push({
      newSlug,
      oldSlug: article.oldSlug,
      title: article.title,
      date: article.date,
      file: article.originalFile,
      draft: article.draft
    });

    console.log(`  ${newSlug} <- ${article.oldSlug} | ${article.title} | ${article.date}`);
  });

  // SQLファイルに書き出し
  const sqlContent = `-- Migration from Hugo blog (masa86) to masa86-blog
-- Generated: ${new Date().toISOString()}
-- Articles: ${articlesToMigrate.length}
-- Start Slug: ${formatSlug(START_SLUG_NUMBER)}
-- End Slug: ${formatSlug(START_SLUG_NUMBER + articlesToMigrate.length - 1)}
${TEST_MODE ? '-- ⚠️  TEST MODE: Only first 5 articles\n' : ''}
${sqlStatements.join('\n\n')}
`;

  fs.writeFileSync(OUTPUT_SQL_FILE, sqlContent, 'utf-8');
  console.log(`\n✅ SQL file generated: ${OUTPUT_SQL_FILE}`);

  // マッピングファイルも生成
  const mappingFile = path.join(__dirname, TEST_MODE ? 'migration-mapping-test.json' : 'migration-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(mappingData, null, 2), 'utf-8');
  console.log(`✅ Mapping file generated: ${mappingFile}`);

  // サマリー表示
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total articles found:     ${articles.length}`);
  console.log(`Articles to migrate:      ${articlesToMigrate.length}`);
  console.log(`Start slug:               ${formatSlug(START_SLUG_NUMBER)}`);
  console.log(`End slug:                 ${formatSlug(START_SLUG_NUMBER + articlesToMigrate.length - 1)}`);
  console.log(`SQL file:                 ${OUTPUT_SQL_FILE}`);
  console.log(`Mapping file:             ${mappingFile}`);

  const draftCount = articlesToMigrate.filter(a => a.draft).length;
  if (draftCount > 0) {
    console.log(`Draft articles included:  ${draftCount}`);
  }

  console.log('='.repeat(60));

  // 次のステップを表示
  console.log('\n📋 NEXT STEPS:');
  console.log('');
  console.log('1. Review the generated SQL file:');
  console.log(`   cat ${OUTPUT_SQL_FILE}`);
  console.log('');
  console.log('2. Test on local D1 database:');
  console.log('   npx wrangler d1 execute masa86-blog-db --local --file=scripts/migration-data.sql');
  console.log('');
  console.log('3. Verify in local dev server:');
  console.log('   npx wrangler dev');
  console.log('   Then open: http://localhost:8787');
  console.log('');
  console.log('4. If everything looks good, run full migration:');
  console.log('   node scripts/migrate-from-hugo.js  (without --test flag)');
  console.log('');
  console.log('5. Backup production database:');
  console.log('   npx wrangler d1 export masa86-blog-db --remote --output=backup-before-migration.sql');
  console.log('');
  console.log('6. Apply to production:');
  console.log('   npx wrangler d1 execute masa86-blog-db --remote --file=scripts/migration-data.sql');
  console.log('');
}

// 実行
migrateFromHugo().catch(error => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});
