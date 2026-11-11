# Books API Week 02 Specification

This document records Version 1, its evaluation, and the final Version 2
specification for the Week 02 Books and Authors API.

## Version 1

### Feature 1: Book CRUD Operations and Author References

#### Goal

Update the Week 01 Books API so each book refers to an author by custom ID and
the API supports all CRUD operations. Every route must be documented and
testable in Swagger at `/api-docs`.

#### Data model

Book documents are stored in the `books` collection. Required fields:

- `id`: non-empty custom string ID, such as `b1`
- `authorId`: non-empty string matching an author `id`
- `title`: non-empty string
- `publicationDate`: valid `YYYY-MM-DD` date string

The API uses the custom `id`, not MongoDB `_id`, in routes and responses.

#### Relationship

`authorId` references the `id` of a document in `authors`. Create and update
requests with a nonexistent author return `400`. Deleting an author with
referencing books is blocked with `409 Conflict`.

#### Routes and responses

All errors use `{"message":"..."}` JSON.

##### `GET /books`

Returns `200` and an array of books ordered by `id`. Unexpected errors return
`500`.

##### `GET /books/:id`

Returns `200` and the matching book, `404` with `{"message":"Book not found"}`
if absent, or `500` for unexpected errors.

##### `POST /books`

Request body:

```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

Returns `201` and the created book. Missing or invalid fields, duplicate IDs,
or an unknown author return `400`. Unexpected errors return `500`.

##### `PUT /books/:id`

Replaces the book's editable fields; the path ID is authoritative.

```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

Returns `200` and the updated book, `400` for missing or invalid fields or an
unknown author, `404` if no book has that ID, and `500` for unexpected errors.

##### `DELETE /books/:id`

Returns `204` with no body when deleted, `404` if absent, or `500` for
unexpected errors.

### Feature 2: Author CRUD Operations

#### Goal

Add a related `authors` collection and complete CRUD API for authors. Every
route must be documented and testable in Swagger at `/api-docs`.

#### Data model

Author documents are stored in `authors`. Required fields:

- `id`: non-empty custom string ID, such as `a1`
- `name`: non-empty string
- `birthYear`: integer from 1 through the current year

The API uses the custom `id`, not MongoDB `_id`, in routes and responses.

#### Routes and responses

All errors use `{"message":"..."}` JSON.

##### `GET /authors`

Returns `200` and an array ordered by `id`; unexpected errors return `500`.

##### `GET /authors/:id`

Returns `200` and the matching author, `404` with
`{"message":"Author not found"}` if absent, or `500` for unexpected errors.

##### `POST /authors`

Request body:

```json
{"id":"a1","name":"Maya Rivera","birthYear":1980}
```

Returns `201` and the created author. Missing or invalid fields or a duplicate
ID return `400`; unexpected errors return `500`.

##### `PUT /authors/:id`

Request body:

```json
{"name":"Maya Rivera","birthYear":1981}
```

Returns `200` and the updated author, `400` for missing or invalid fields,
`404` if absent, or `500` for unexpected errors.

##### `DELETE /authors/:id`

Returns `204` and no body when deleted. Returns `404` if absent and
`409 Conflict` if any book references the author. Unexpected errors return
`500`. The API does not cascade-delete books or rewrite their references.

## Version 1 evaluation

- **Correctness:** Both collections need unique custom IDs; otherwise writes
  and reads can become ambiguous. Date strings and numeric birth years should
  be validated for type and value, not just presence. Updates must use `$set`
  and must not allow the body to change the route ID.
- **Relationship integrity:** Book writes must verify an existing author.
  Author deletion must check for dependent books and consistently block the
  delete. These checks are application-level and are not MongoDB foreign keys.
- **Security:** Only documented fields should be copied from request bodies;
  internal MongoDB `_id` and raw database errors must not be returned. Malformed
  JSON and unknown routes should have predictable JSON errors. Authentication
  is out of scope for this course API.
- **Efficiency:** List queries should project only API fields and sort by ID.
  Unique indexes on `id` support lookups and enforce uniqueness. The API does
  not need `$lookup` or pagination for this assignment's small dataset.
- **Response clarity:** Duplicate IDs are defined as `400`; deleting a
  referenced author is `409`; successful deletes return `204` with no body.
  All other response bodies and status codes are specified above.

## Version 2: Final specification

Version 2 is the final checklist and supersedes Version 1 if any detail differs.

### Shared behavior

- Database name is configured with `MONGODB_DB_NAME`; collections are `books`
  and `authors`.
- IDs are non-empty custom strings and unique within each collection.
- `id` and MongoDB `_id` are never mutable through update bodies. `_id` is
  omitted from all API responses.
- Request bodies must be JSON objects. Only the documented fields are written.
- Unexpected server/database errors return `500` with
  `{"message":"Internal server error"}`; details are logged server-side only.
- Invalid/malformed JSON returns `400` with a safe JSON message. Unknown routes
  return `404` with `{"message":"Route not found"}`.
- Swagger documents request/response schemas and all status codes for each
  route at `/api-docs`.

### Books

Required document fields are `id` (non-empty string), `authorId` (non-empty
string referencing an existing author `id`), `title` (non-empty string), and
`publicationDate` (a real calendar date in `YYYY-MM-DD` format).

| Route | Success | Error behavior |
|---|---|---|
| `GET /books` | `200`, array ordered by `id` | `500` |
| `GET /books/:id` | `200`, book object | `404` if absent; `500` |
| `POST /books` | `201`, created book | `400` invalid/missing fields, duplicate ID, or missing author; `500` |
| `PUT /books/:id` | `200`, updated book | `400` invalid/missing fields or missing author; `404` if book absent; `500` |
| `DELETE /books/:id` | `204`, no body | `404` if absent; `500` |

`POST /books` body: `{"id":"b4","authorId":"a1","title":"Example Book Title","publicationDate":"2026-01-15"}`.

`PUT /books/:id` body: `{"authorId":"a2","title":"Updated Book Title","publicationDate":"2026-02-20"}`. It updates all editable fields using `$set`; the URL ID is authoritative.

### Authors

Required document fields are `id` (non-empty string), `name` (non-empty
string), and `birthYear` (integer from 1 through the current year).

| Route | Success | Error behavior |
|---|---|---|
| `GET /authors` | `200`, array ordered by `id` | `500` |
| `GET /authors/:id` | `200`, author object | `404` if absent; `500` |
| `POST /authors` | `201`, created author | `400` invalid/missing fields or duplicate ID; `500` |
| `PUT /authors/:id` | `200`, updated author | `400` invalid/missing fields; `404` if absent; `500` |
| `DELETE /authors/:id` | `204`, no body | `404` if absent; `409` if books reference it; `500` |

`POST /authors` body: `{"id":"a1","name":"Maya Rivera","birthYear":1980}`.

`PUT /authors/:id` body: `{"name":"Maya Rivera","birthYear":1981}`. It updates
all editable fields using `$set`; the URL ID is authoritative.

No automatic joins are performed: book responses include `authorId`, not
embedded author details. Author deletion never deletes or modifies books.

## Part 2: GitHub issue drafts

### Issue 1: Update Book Collection to reference authors and finish Book API

#### Description

- Update existing book documents to use `authorId`.
- Implement and validate all book CRUD routes and author references.
- Add complete Swagger documentation and test the routes locally and after
  deployment.

#### Spec

Implement all Books requirements in Version 2 above, including the custom ID,
date validation, author existence checks, status codes, safe error responses,
and Swagger documentation.

#### Test Plan

- `GET /books` and `GET /books/:id` return `authorId` and omit `_id`.
- Create succeeds with `201`; missing/invalid data, duplicate ID, and unknown
  author return `400`.
- Update succeeds with `200`, uses URL ID, rejects bad data or missing author
  with `400`, and returns `404` for an unknown book.
- Delete succeeds with empty `204`; unknown book returns `404`.
- All book routes and response codes are testable in local Swagger and deployed
  Swagger; persisted data is confirmed in MongoDB.

### Issue 2: Implement Author Collection and API

#### Description

- Create and seed the authors collection with unique custom IDs.
- Implement and validate all author CRUD routes.
- Block deletion when books reference the author.
- Add complete Swagger documentation and verify all routes locally and after
  deployment.

#### Spec

Implement all Authors requirements in Version 2 above, including the
`id`, `name`, and `birthYear` fields; request bodies; safe response shapes;
status codes; and the `409` delete rule for referenced authors.

#### Test Plan

- List and get return author objects without `_id`; missing IDs return `404`.
- Create returns `201`; missing/invalid data and duplicate IDs return `400`.
- Update returns `200`, rejects invalid data with `400`, and returns `404` for
  unknown IDs.
- Deleting an unused author returns empty `204`; deleting a missing author
  returns `404`; deleting an author referenced by a book returns `409` and
  leaves both documents unchanged.
- All author routes and response codes are testable in local Swagger and
  deployed Swagger; persisted data is confirmed in MongoDB.
