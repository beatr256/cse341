# CSE 341 Books API

Read-only Express and MongoDB API for the Week 01 assignment.

## Requirements

- Node.js 20.6 or newer
- A MongoDB database and connection string

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Replace `MONGODB_URI` with your MongoDB connection string. Keep `.env`
   private and out of Git.
4. Create the database and sample books with `npm run seed`.
5. Start the server with `npm run dev` or `npm start`.

The server connects to MongoDB before it starts listening. Missing or invalid
database settings prevent startup and are reported in the server logs.

## API

- `GET /` — health check.
- `GET /books` — all books, ordered by `id`.
- `GET /books/:id` — one book, or HTTP 404 if it does not exist.

All API responses are JSON. Unexpected route/database errors return HTTP 500
with `{"message":"Internal server error"}`.

## Checks

- Run `npm run lint` to check the course JavaScript standards.
- The `test` script is the course-provided placeholder; it is not an automated
  test suite.

## Render deployment

Create a Render Web Service connected to this GitHub repository. Set the build
command to `npm install` and start command to `npm start`. Add `MONGODB_URI`,
`MONGODB_DB` (`cse341-books-db`), and optionally `PORT` as Render environment
variables. Run `npm run seed` locally against the production database before
testing the deployed endpoints. Verify `/`, `/books`, an existing book ID, and
a missing ID. Record the deployed URL here after deployment.
