# Photothèque

A French-language photo library web application. Organize your photos into named albums, upload images, and manage them through a simple browser interface.

---

## Architecture Overview

```
Phototeque/
├── index.js                  # Entry point – Express app, DB connection, middleware
├── package.json
│
├── models/
│   └── Album.js              # Mongoose schema: { title, images[], timestamps }
│
├── controllers/
│   └── album.controller.js   # All business logic (list, create, view, upload, delete)
│
├── routes/
│   └── album.routes.js       # Route → controller mapping
│
├── helpers/
│   └── catchAsync.js         # Wraps async handlers to forward errors to Express
│
├── views/                    # EJS templates (server-side rendered)
│   ├── albums.ejs            # Album list page
│   ├── album.ejs             # Single album + image upload
│   ├── new-album.ejs         # Create album form
│   └── partials/
│       ├── head.ejs          # HTML <head> with Bootstrap CSS
│       ├── nav.ejs           # Navigation bar
│       └── scripts.ejs       # Bootstrap JS bundle
│
└── public/
    └── uploads/
        └── <albumId>/        # Uploaded images stored per album
```

### Request Flow

```
Browser → Express Router → Controller → Mongoose (MongoDB)
                                     ↓
                               EJS Template → Browser
```

### Data Model

```js
Album {
  title:      String  (required)
  images:     [String]   // list of filenames
  createdAt:  Date    (auto)
  updatedAt:  Date    (auto)
}
```

---

## Setup Instructions

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18.x |
| MongoDB | ≥ 6.x (running locally) |

### 1. Clone and install

```bash
git clone <repo-url>
cd Phototeque
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) below for details.

### 3. Start MongoDB

```bash
# macOS / Linux
mongod --dbpath /data/db

# Windows
mongod
```

### 4. Start the application

```bash
npm start
# or for development with auto-restart:
npx nodemon index.js
```

The app will be available at **http://localhost:3000**

---

## Environment Variables

Create a `.env` file at the project root (see `.env.example`):

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Port the server listens on | `3000` |
| `MONGODB_URI` | Yes | Full MongoDB connection string | `mongodb://127.0.0.1/phototheque` |
| `SESSION_SECRET` | Yes | Secret key used to sign session cookies. Use a long random string in production. | `change-me-to-a-random-secret` |

> **Security:** Never commit `.env` to version control. It is listed in `.gitignore`.

---

## Routes Reference

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Redirects to `/albums` |
| `GET` | `/albums` | List all albums |
| `GET` | `/albums/create` | Show create-album form |
| `POST` | `/albums/create` | Submit create-album form |
| `GET` | `/albums/:id` | View single album and its images |
| `POST` | `/albums/:id` | Upload an image to the album |
| `GET` | `/albums/:id/delete` | Delete an album and all its images |
| `GET` | `/albums/:id/delete/:imageIndex` | Delete a single image from an album |

---

## Deployment Workflow

### Development

```bash
npm install
# Set up .env
npm start
```

### Production (manual)

1. Set `NODE_ENV=production` in your environment.
2. Set a strong `SESSION_SECRET` (min. 32 random characters).
3. Point `MONGODB_URI` to your production MongoDB instance (Atlas, etc.).
4. Use a process manager:

```bash
npm install -g pm2
pm2 start index.js --name phototheque
pm2 save
pm2 startup
```

5. Put a reverse proxy (Nginx or Caddy) in front of the Node process to handle HTTPS.

### Docker (optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

```bash
docker build -t phototheque .
docker run -p 3000:3000 --env-file .env phototheque
```

---

## Coding Conventions

- **MVC pattern**: routes stay thin (only map URLs to controller functions), all logic lives in controllers.
- **Async error handling**: always wrap `async` controller functions with `catchAsync()` so unhandled promise rejections are forwarded to the Express error handler.
- **Flash messages**: use `req.flash('error', message)` + redirect for user-facing validation errors — never send raw error objects to views.
- **File storage**: uploaded files are stored under `public/uploads/<albumId>/` using the original filename. The album document stores only the filename string, not the full path.
- **Language**: UI text and variable names are in French. Code (functions, routes, schema fields) is in English.

---

## Recommended Improvements

### Security (High Priority)

- [ ] **Move secrets to `.env`** — `SESSION_SECRET` and `MONGODB_URI` are currently hardcoded in `index.js`. Use the `dotenv` package.
- [ ] **Sanitize filenames** — `image.name` from an upload can contain path traversal characters (e.g. `../../etc/passwd`). Use a library like `sanitize-filename` or generate a UUID-based filename.
- [ ] **Limit upload size** — add `express-fileupload` limits to prevent large file DoS attacks: `{ limits: { fileSize: 5 * 1024 * 1024 } }`.
- [ ] **CSRF protection** — POST forms have no CSRF token. Add `csurf` or use the built-in `SameSite` cookie attribute.
- [ ] **Delete via POST** — album and image deletion are triggered by `GET` requests, which can be triggered by `<img src="...">` or link prefetching. Use `POST`/`DELETE` with a confirmation step.

### Code Quality

- [ ] **Fix `errors` in `Album.create()`** — `errors: req.flash('error')` is passed to `Album.create()` but `errors` is not in the schema. Remove it.
- [ ] **Add `npm start` script** — add `"start": "node index.js"` to `package.json`.
- [ ] **Add `nodemon` for development** — add `"dev": "nodemon index.js"` as a dev script.
- [ ] **Consistent error handling** — some controller functions use `try/catch` inside a `catchAsync` wrapper (redundant). Choose one approach.
- [ ] **Fix typo in `albums.ejs`** — `<li clss="...">` should be `<li class="...">`.

### Features

- [ ] Add pagination to the album list for large collections.
- [ ] Add image thumbnail generation (e.g. with `sharp`).
- [ ] Add user authentication so albums are private.
