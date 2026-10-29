# Books API Specification

## Purpose

Provide a read-only JSON API that retrieves all books or one book by its custom
`id`.

## Data model

The MongoDB database is `cse341-books-db`, and the collection is `books`.
Each book has these required fields:

- `id`: string
- `author`: string
- `title`: string
- `publicationDate`: ISO 8601 date string in `YYYY-MM-DD` format

MongoDB's internal `_id` is not included in API responses.

## Endpoints

### `GET /`

Returns HTTP 200 and `{"message":"Server is running"}` as a deployment health
check.

### `GET /books`

Returns HTTP 200 and a JSON array containing `id`, `author`, `title`, and
`publicationDate` for every book, ordered by `id`.

Example:

```json
[
  {
    "id": "b1",
    "author": "Maya Rivera",
    "title": "Patterns of Light",
    "publicationDate": "2021-08-17"
  }
]
```

Unexpected database or server errors return HTTP 500:

```json
{ "message": "Internal server error" }
```

### `GET /books/:id`

Returns HTTP 200 and the matching book as a JSON object. If the `id` does not
match a book, returns HTTP 404:

```json
{ "message": "Book not found" }
```

Unexpected database or server errors return HTTP 500:

```json
{ "message": "Internal server error" }
```

Unknown routes return HTTP 404 with `{"message":"Route not found"}`. Stack
traces and database details are logged on the server and are not sent to
clients.

## Out of scope

Creating, updating, and deleting books; authentication and authorization.
