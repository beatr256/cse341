# CSE 341 Books and Authors API

Express and MongoDB CRUD API for the Week 02 assignment. Books reference
authors by custom string ID.

## Assignment documentation

- [Week 01 API specification](./API_SPEC.md) records the original read-only API.
- [Week 02 specification and issue drafts](./spec-week02.md) include Version 1,
  its evaluation, the final implementation checklist, and GitHub issue content.
- Deployed service: <https://cse341-books-api-n8lw.onrender.com>

## Requirements

- Node.js 20.6 or newer
- A MongoDB database and connection string

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Replace `MONGODB_URI` with your MongoDB connection string. Keep `.env`
   private and out of Git.
4. Create or update sample authors and books with `npm run seed`.
5. Start the server with `npm run dev` or `npm start`.

The server connects to MongoDB, creates unique indexes for custom IDs, and
starts only after the database is ready. Missing or invalid database settings
prevent startup and are reported in the server logs.

## API

- `GET /` - health check.
- `/books` - `GET`, `POST`.
- `/books/:id` - `GET`, `PUT`, `DELETE`.
- `/authors` - `GET`, `POST`.
- `/authors/:id` - `GET`, `PUT`, `DELETE`.
- `/api-docs` - interactive Swagger documentation for all routes.
- `/api-docs.json` - OpenAPI JSON document used by Swagger.

Books contain an `authorId` reference. Book creates and updates require an
existing author. Authors cannot be deleted while books refer to them. All API
responses are JSON; unexpected errors return HTTP 500 with
`{"message":"Internal server error"}`.

## Checks

- Run `npm run swagger` to verify every CRUD route is in the OpenAPI spec.
- Run `npm run lint` to check the course JavaScript standards.
- Run `npm test` for controller behavior tests.

## Render deployment

Create a Render Web Service connected to this GitHub repository. Leave the
root directory blank, set the build command to `npm install`, and set the start
command to `node server.js`. Add `MONGODB_URI` and `MONGODB_DB_NAME`
(`cse341-books-db`) as Render environment variables. Do not set `PORT`; Render
provides it. The Render start command must not use `--env-file=.env`; Render
supplies configured environment variables directly.

After deploying the updated service, verify `/`, `/api-docs`, all CRUD routes,
relationship validation, and error responses. Do not run the seed script
against production unless intentionally resetting the sample records.
