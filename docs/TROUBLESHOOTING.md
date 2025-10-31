# Troubleshooting - masa86-blog

## Admin page returns 500 Internal Server Error

### Symptoms
- Accessing `https://masa86-blog.pages.dev/admin` returns 500 error
- "Application error: a server-side exception has occurred"

### Cause
D1 database binding is not configured in Cloudflare Pages.

### Solution

1. Go to **Cloudflare Dashboard**
   - https://dash.cloudflare.com/

2. Navigate to **Workers & Pages** → **masa86-blog**

3. Go to **Settings** → **Functions** → **D1 database bindings**

4. Check if D1 binding exists:
   - **Variable name**: `DB`
   - **D1 database**: Your database name

5. If not configured:
   - Click **Add binding**
   - **Variable name**: `DB`
   - **D1 database**: Select your D1 database
   - Click **Save**

6. Go to **Deployments** → Click **Retry deployment** on the latest deployment

### Verify D1 Database

Check if the database exists:

```bash
# List D1 databases
wrangler d1 list

# If database doesn't exist, create it
wrangler d1 create masa86-blog-db

# Apply schema
wrangler d1 execute masa86-blog-db --file=db/migrations/0000_create_posts_table.sql --remote
```

### Verify Compatibility Flags

Go to **Settings** → **Functions** → **Compatibility Flags**:
- Production: Add `nodejs_compat`
- Preview: Add `nodejs_compat`

## Frontend pages require Basic Authentication

### Symptoms
Top page (/) requires Basic Authentication

### Cause
Middleware configuration issue or Cloudflare Pages cache

### Solution

1. **Verify middleware.ts**
```typescript
export const config = {
  matcher: ['/admin/:path*'],  // Only applies to /admin/*
};
```

2. **Clear Cloudflare Pages cache**
   - Settings → Build → Build cache → **Clear Cache**
   - Deployments → **Retry deployment**

## Other Errors

### Build Errors
```bash
# Test build locally
npm run build

# If errors occur, reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### D1 Connection Errors
```bash
# Check D1 database status
wrangler d1 execute masa86-blog-db --command="SELECT COUNT(*) as count FROM posts" --remote

# If no data, run migrations
wrangler d1 execute masa86-blog-db --file=db/migrations/0000_create_posts_table.sql --remote
```

