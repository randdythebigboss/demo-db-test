# demo-db-test

A minimal message board: HTML/CSS/JS frontend + Cloudflare Worker + D1 database.

---

## Setup

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create the D1 database

```bash
wrangler d1 create demo-db
```

Copy the `database_id` from the output and paste it into `wrangler.toml`.

### 3. Apply the schema

```bash
# Remote (production)
wrangler d1 execute demo-db --file=schema.sql

# Local (for local dev)
wrangler d1 execute demo-db --local --file=schema.sql
```

### 4. Run the Worker locally

```bash
wrangler dev
```

The Worker runs at `http://localhost:8787`.
Update `API_BASE` in `app.js` to `http://localhost:8787` for local testing.

Open `index.html` directly in your browser (or use any static server).

### 5. Deploy the Worker

```bash
wrangler deploy
```

Copy the deployed URL (e.g. `https://demo-db-test.YOUR_SUBDOMAIN.workers.dev`)
and update `API_BASE` in `app.js`.

Also uncomment and fill in your GitHub Pages origin in `src/index.js` → `ALLOWED_ORIGINS`.

### 6. Publish the frontend on GitHub Pages

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Set source to the `main` branch, root folder `/`.
4. Your site will be live at `https://YOUR_USERNAME.github.io/demo-db-test/`.
