# Books API Specification

This document records the initial draft, its evaluation, and the final
specification for the Week 01 Books API assignment.

## Version 1: Initial draft

### Purpose

Create a basic web service that returns book data.

### Data model

Book fields:

- `id`: string
- `author`: string
- `title`: string
- `publicationDate`: string

### Endpoints

1. `GET /books`
   - Returns all books.
   - Returns HTTP 200 on success.
2. `GET /books/:id`
   - Returns one book with a matching ID.
   - Returns HTTP 200 on success.
   - Returns HTTP 404 if no book matches.

### Initial assumptions

- Data is stored in the MongoDB collection named `books`.
- The API returns JSON.

## Version 1 evaluation

Reviewing the draft against the assignment's guided questions revealed several
details that needed clarification:

- **Behavior and short-sighted decisions:** The draft did not define required
  fields, the date format, database name, or connection configuration. It also
  did not say whether list ordering is predictable or whether MongoDB's
  internal `_id` appears in responses.
- **Security:** Returning database errors or stack traces to clients could
  expose internal implementation details. The API should return a safe generic
  message instead. Authentication and authorization are outside this
  read-only feature's scope.
- **Performance:** An unbounded list may become slow as the collection grows.
  For this small Week 01 dataset, the API will return only the required fields
  in a predictable order; pagination can be considered if the dataset grows.
- **Examples and error behavior:** The draft lacked concrete JSON examples,
  did not define the 404 response body, and did not specify how unexpected
  database or server errors are reported. It should define success and error
  status codes and response shapes. Write methods and request bodies are out of
  scope.

These clarifications were incorporated into Version 2 below.

## Why Version 2 is improved

Version 2 turns assumptions into testable API behavior: it specifies the data
fields and date format, database and collection, supported methods and inputs,
response examples, ordering, and success and error status codes. Its generic
error message avoids exposing internal database details, while the explicit
read-only scope prevents confusion about methods that are not implemented.

## Version 2: Final specification

### Purpose

Provide a read-only JSON API that retrieves all books or one book by its custom
`id`.

### Data model

The MongoDB database is `cse341-books-db`, and the collection is `books`.
Each book has these required fields:

- `id`: string
- `author`: string
- `title`: string
- `publicationDate`: ISO 8601 date string in `YYYY-MM-DD` format

MongoDB's internal `_id` is not included in API responses.

### Endpoints

#### `GET /`

Returns HTTP 200 and `{"message":"Server is running"}` as a deployment health
check.

#### Request conventions

- All endpoints use the HTTP `GET` method and return JSON.
- No request body, query parameters, or special request headers are required.
- `GET /books/:id` receives the custom book ID as the `id` path parameter.

#### `GET /books`

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

#### `GET /books/:id`

Returns HTTP 200 and the matching book as a JSON object. If the `id` does not
match a book, returns HTTP 404:

Successful response example:

```json
{
  "id": "b1",
  "author": "Maya Rivera",
  "title": "Patterns of Light",
  "publicationDate": "2021-08-17"
}
```

Not-found response:

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

### Out of scope

Creating, updating, and deleting books; authentication and authorization.
