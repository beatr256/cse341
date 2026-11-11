const errorResponse = (description, example) => {return {
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: example }
    }
  }
}};

const bookRequest = {
  type: "object",
  required: ["id", "authorId", "title", "publicationDate"],
  properties: {
    id: { type: "string", example: "b4" },
    authorId: { type: "string", example: "a1" },
    title: { type: "string", example: "Example Book Title" },
    publicationDate: { type: "string", format: "date", example: "2026-01-15" }
  }
};

const bookUpdate = {
  type: "object",
  required: ["authorId", "title", "publicationDate"],
  properties: {
    authorId: { type: "string", example: "a2" },
    title: { type: "string", example: "Updated Book Title" },
    publicationDate: { type: "string", format: "date", example: "2026-02-20" }
  }
};

const authorRequest = {
  type: "object",
  required: ["id", "name", "birthYear"],
  properties: {
    id: { type: "string", example: "a1" },
    name: { type: "string", example: "Maya Rivera" },
    birthYear: {
      type: "integer",
      minimum: 1,
      maximum: new Date().getUTCFullYear(),
      example: 1980
    }
  }
};

const authorUpdate = {
  type: "object",
  required: ["name", "birthYear"],
  properties: {
    name: { type: "string", example: "Maya Rivera" },
    birthYear: {
      type: "integer",
      minimum: 1,
      maximum: new Date().getUTCFullYear(),
      example: 1981
    }
  }
};

const collectionGet = (entity, summary) => {return {
  summary,
  responses: {
    200: {
      description: `Array of ${entity}s`,
      content: {
        "application/json": {
          schema: { type: "array", items: { $ref: `#/components/schemas/${entity}` } }
        }
      }
    },
    500: errorResponse("Unexpected server or database error", "Internal server error")
  }
}};

const itemGet = (entity, summary) => {return {
  summary,
  parameters: [{
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string" },
    description: `Custom ${entity.toLowerCase()} ID`
  }],
  responses: {
    200: {
      description: `${entity} found`,
      content: {
        "application/json": { schema: { $ref: `#/components/schemas/${entity}` } }
      }
    },
    404: errorResponse(`${entity} not found`, `${entity} not found`),
    500: errorResponse("Unexpected server or database error", "Internal server error")
  }
}};

const createRoute = (entity, schema, errors) => {return {
  summary: `Create a ${entity.toLowerCase()}`,
  requestBody: {
    required: true,
    content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}` } } }
  },
  responses: {
    201: {
      description: `${entity} created`,
      content: {
        "application/json": { schema: { $ref: `#/components/schemas/${entity}` } }
      }
    },
    400: errorResponse("Invalid request or duplicate ID", errors),
    500: errorResponse("Unexpected server or database error", "Internal server error")
  }
}};

const updateRoute = (entity, schema, errors) => {return {
  summary: `Replace editable ${entity.toLowerCase()} fields`,
  parameters: [{
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string" },
    description: `Custom ${entity.toLowerCase()} ID; this value is not changed`
  }],
  requestBody: {
    required: true,
    content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}` } } }
  },
  responses: {
    200: {
      description: `${entity} updated`,
      content: {
        "application/json": { schema: { $ref: `#/components/schemas/${entity}` } }
      }
    },
    400: errorResponse("Invalid request", errors),
    404: errorResponse(`${entity} not found`, `${entity} not found`),
    500: errorResponse("Unexpected server or database error", "Internal server error")
  }
}};

const deleteRoute = (entity, { conflict } = {}) => {return {
  summary: `Delete a ${entity.toLowerCase()}`,
  parameters: [{
    name: "id",
    in: "path",
    required: true,
    schema: { type: "string" },
    description: `Custom ${entity.toLowerCase()} ID`
  }],
  responses: {
    204: { description: `${entity} deleted; no response body` },
    404: errorResponse(`${entity} not found`, `${entity} not found`),
    ...(conflict ? { 409: errorResponse(conflict, conflict) } : {}),
    500: errorResponse("Unexpected server or database error", "Internal server error")
  }
}};

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Books and Authors API",
    version: "2.0.0",
    description: "CRUD API using custom IDs. Books reference authors through authorId."
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Books", description: "Book records referencing authors" },
    { name: "Authors", description: "Author records" }
  ],
  paths: {
    "/": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "Service is running",
            content: {
              "application/json": {
                schema: { type: "object", properties: { message: { type: "string" } } },
                example: { message: "Server is running" }
              }
            }
          }
        }
      }
    },
    "/books": {
      get: { ...collectionGet("Book", "List books"), tags: ["Books"] },
      post: {
        ...createRoute("Book", "BookCreate", "Invalid book data, duplicate ID, or author not found"),
        tags: ["Books"]
      }
    },
    "/books/{id}": {
      get: { ...itemGet("Book", "Get a book by custom ID"), tags: ["Books"] },
      put: {
        ...updateRoute("Book", "BookUpdate", "Invalid book data or author not found"),
        tags: ["Books"]
      },
      delete: { ...deleteRoute("Book"), tags: ["Books"] }
    },
    "/authors": {
      get: { ...collectionGet("Author", "List authors"), tags: ["Authors"] },
      post: {
        ...createRoute("Author", "AuthorCreate", "Invalid author data or duplicate ID"),
        tags: ["Authors"]
      }
    },
    "/authors/{id}": {
      get: { ...itemGet("Author", "Get an author by custom ID"), tags: ["Authors"] },
      put: {
        ...updateRoute("Author", "AuthorUpdate", "Invalid author data"),
        tags: ["Authors"]
      },
      delete: {
        ...deleteRoute("Author", { conflict: "Author has books and cannot be deleted" }),
        tags: ["Authors"]
      }
    }
  },
  components: {
    schemas: {
      Book: {
        type: "object",
        required: ["id", "authorId", "title", "publicationDate"],
        properties: {
          id: { type: "string", example: "b1" },
          authorId: { type: "string", example: "a1" },
          title: { type: "string", example: "Patterns of Light" },
          publicationDate: { type: "string", format: "date", example: "2021-08-17" }
        }
      },
      BookCreate: bookRequest,
      BookUpdate: bookUpdate,
      Author: {
        type: "object",
        required: ["id", "name", "birthYear"],
        properties: {
          id: { type: "string", example: "a1" },
          name: { type: "string", example: "Maya Rivera" },
          birthYear: {
            type: "integer",
            minimum: 1,
            maximum: new Date().getUTCFullYear(),
            example: 1980
          }
        }
      },
      AuthorCreate: authorRequest,
      AuthorUpdate: authorUpdate,
      Error: {
        type: "object",
        required: ["message"],
        properties: { message: { type: "string" } },
        example: { message: "Internal server error" }
      }
    }
  }
};

export default openApiSpec;
