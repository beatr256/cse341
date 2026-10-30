# CSE 341 Books API

Read-only Express and MongoDB API for the Week 01 assignment.

## Assignment documentation

- [API specification](./API_SPEC.md) includes the initial draft, its evaluation, and the final specification.
- Deployed service: <https://cse341-books-api-n8lw.onrender.com>

## Requirements

- Node.js 20.6 or newer
- A MongoDB database and connection string

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Replace `MONGODB_URI` with your MongoDB connection string. Keep `.env` private and out of Git.
4. Create the database and sample books with `npm run seed`.
5. Start the server with `npm run dev` or `npm start`.

The server connects to MongoDB before it starts listening. Missing or invalid database settings prevent startup and are reported in the server logs.

## API

- `GET /` - health check.
- `GET /books` - all books, ordered by `id`.
- `GET /books/:id` - one book, or HTTP 404 if it does not exist.

All API responses are JSON. Unexpected route/database errors return HTTP 500 with `{"message":"Internal server error"}`.

## Checks

- Run `npm run lint` to check the course JavaScript standards.
- The `test` script is the course-provided placeholder; it is not an automated test suite.

## Render deployment

Create a Render Web Service connected to this GitHub repository. Leave the root directory blank, set the build command to `npm install`, and set the start command to `node server.js`. Add `MONGODB_URI` and `MONGODB_DB_NAME` (`cse341-books-db`) as Render environment variables. Do not set `PORT`; Render provides it. The Render start command must not use `--env-file=.env`; Render supplies configured environment variables directly.

Run `npm run seed` locally against the production database before testing the deployed endpoints. Verify `/`, `/books`, an existing book ID, and a missing ID.

The deployed service has been verified: the root health check returns HTTP 200, `GET /books` returns HTTP 200 with three seeded books, an existing book ID returns HTTP 200, and a missing ID returns HTTP 404 with the expected JSON message.
