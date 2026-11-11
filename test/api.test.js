import assert from "node:assert/strict";
import test from "node:test";
import { createAuthorHandlers } from "../src/controllers/authors.js";
import { createBookHandlers } from "../src/controllers/books.js";

class MemoryCollection {
  constructor(documents = []) {
    this.documents = documents;
  }

  findOne(filter) {
    return this.documents.find((document) => {
      return Object.entries(filter).every(([key, value]) => {return document[key] === value});
    }) ?? null;
  }

  find(filter, options = {}) {
    const projection = options.projection ?? {};
    let results = this.documents.filter((document) => {
      return Object.entries(filter).every(([key, value]) => {return document[key] === value});
    });

    return {
      sort: (sortFields) => {
        results = results.toSorted((first, second) => {
          const [field] = Object.keys(sortFields);
          return first[field].localeCompare(second[field]);
        });
        return {
          toArray: async () => {return results.map((document) => {return this.project(document, projection)})}
        };
      }
    };
  }

  async insertOne(document) {
    if (this.findOne({ id: document.id })) {
      const error = new Error("Duplicate ID");
      error.code = 11000;
      throw error;
    }

    document._id = `internal-${document.id}`;
    this.documents.push({ ...document });
    return { insertedId: `internal-${document.id}` };
  }

  async updateOne(filter, update) {
    const document = this.findOne(filter);
    if (!document) {
      return { matchedCount: 0 };
    }

    Object.assign(document, update.$set);
    return { matchedCount: 1 };
  }

  async deleteOne(filter) {
    const index = this.documents.findIndex((document) => {
      return Object.entries(filter).every(([key, value]) => {return document[key] === value});
    });
    if (index < 0) {
      return { deletedCount: 0 };
    }

    this.documents.splice(index, 1);
    return { deletedCount: 1 };
  }

  project(document, projection) {
    const included = Object.entries(projection)
      .filter(([, value]) => {return value === 1})
      .map(([key]) => {return key});
    return Object.fromEntries(included.map((key) => {return [key, document[key]]}));
  }
}

const createDatabase = ({ books = [], authors = [] } = {}) => {
  const collections = {
    books: new MemoryCollection(books),
    authors: new MemoryCollection(authors)
  };
  return { collection: (name) => {return collections[name]} };
};

const response = () => {return {
  statusCode: 200,
  body: undefined,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  end() {
    this.body = undefined;
    return this;
  }
}};

const author = { id: "a1", name: "Maya Rivera", birthYear: 1980 };
const book = {
  id: "b1",
  authorId: "a1",
  title: "Patterns of Light",
  publicationDate: "2021-08-17"
};

test("book creation validates required fields and author references", async () => {
  const database = createDatabase({ authors: [author] });
  const handlers = createBookHandlers(() => {return database});
  const created = response();
  await handlers.createBook({ body: { ...book, id: "b2" } }, created);
  assert.equal(created.statusCode, 201);
  assert.deepEqual(created.body, { ...book, id: "b2" });
  assert.equal(created.body._id, undefined);

  const invalidDate = response();
  await handlers.createBook({
    body: { ...book, id: "b3", publicationDate: "2026-02-30" }
  }, invalidDate);
  assert.equal(invalidDate.statusCode, 400);

  const missingAuthor = response();
  await handlers.createBook({
    body: { ...book, id: "b4", authorId: "missing" }
  }, missingAuthor);
  assert.equal(missingAuthor.statusCode, 400);

  const duplicate = response();
  await handlers.createBook({ body: { ...book, id: "b2" } }, duplicate);
  assert.equal(duplicate.statusCode, 400);
});

test("book updates preserve route ID and deletes return expected status", async () => {
  const database = createDatabase({ books: [book], authors: [author] });
  const handlers = createBookHandlers(() => {return database});
  const updated = response();
  await handlers.updateBook({
    params: { id: "b1" },
    body: { authorId: "a1", title: "Updated Title", publicationDate: "2022-01-02", id: "b2" }
  }, updated);

  assert.equal(updated.statusCode, 200);
  assert.equal(updated.body.id, "b1");
  assert.equal(updated.body.title, "Updated Title");

  const missingUpdate = response();
  await handlers.updateBook({
    params: { id: "unknown" },
    body: { authorId: "a1", title: "Title", publicationDate: "2022-01-02" }
  }, missingUpdate);
  assert.equal(missingUpdate.statusCode, 404);

  const missingBook = response();
  await handlers.getBookById({ params: { id: "unknown" } }, missingBook);
  assert.equal(missingBook.statusCode, 404);

  const list = response();
  await handlers.getAllBooks({}, list);
  assert.equal(list.statusCode, 200);
  assert.equal(list.body[0]._id, undefined);
  assert.equal(list.body[0].authorId, "a1");

  const missing = response();
  await handlers.deleteBook({ params: { id: "unknown" } }, missing);
  assert.equal(missing.statusCode, 404);

  const deleted = response();
  await handlers.deleteBook({ params: { id: "b1" } }, deleted);
  assert.equal(deleted.statusCode, 204);
  assert.equal(deleted.body, undefined);
});

test("author CRUD validates inputs and protects referenced authors", async () => {
  const database = createDatabase({ authors: [author], books: [book] });
  const handlers = createAuthorHandlers(() => {return database});
  const duplicate = response();
  await handlers.createAuthor({ body: author }, duplicate);
  assert.equal(duplicate.statusCode, 400);

  const updated = response();
  await handlers.updateAuthor({
    params: { id: "a1" },
    body: { name: "Maya R.", birthYear: 1981 }
  }, updated);
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.body.id, "a1");

  const invalid = response();
  await handlers.updateAuthor({
    params: { id: "a1" },
    body: { name: "", birthYear: 1981 }
  }, invalid);
  assert.equal(invalid.statusCode, 400);

  const missing = response();
  await handlers.getAuthorById({ params: { id: "unknown" } }, missing);
  assert.equal(missing.statusCode, 404);

  const authorList = response();
  await handlers.getAllAuthors({}, authorList);
  assert.equal(authorList.statusCode, 200);
  assert.equal(authorList.body[0]._id, undefined);

  const blockedDelete = response();
  await handlers.deleteAuthor({ params: { id: "a1" } }, blockedDelete);
  assert.equal(blockedDelete.statusCode, 409);

  const created = response();
  await handlers.createAuthor({
    body: { id: "a2", name: "Jordan Lee", birthYear: 1975 }
  }, created);
  assert.equal(created.statusCode, 201);
  assert.equal(created.body._id, undefined);

  const deleted = response();
  await handlers.deleteAuthor({ params: { id: "a2" } }, deleted);
  assert.equal(deleted.statusCode, 204);

  const missingDelete = response();
  await handlers.deleteAuthor({ params: { id: "unknown" } }, missingDelete);
  assert.equal(missingDelete.statusCode, 404);
});

test("health, Swagger documentation, and JSON errors are available over HTTP", async (t) => {
  const { default: app } = await import("../src/app.js");
  const server = app.listen(0);
  t.after(() => {
    server.close();
  });

  await new Promise((resolve) => {
    server.once("listening", resolve);
  });
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const health = await fetch(`${baseUrl}/`);
  assert.equal(health.status, 200);

  const docs = await fetch(`${baseUrl}/api-docs/`);
  assert.equal(docs.status, 200);
  assert.match(await docs.text(), /Swagger UI/);

  const openApi = await fetch(`${baseUrl}/api-docs.json`);
  const spec = await openApi.json();
  assert.equal(openApi.status, 200);
  assert.equal(spec.info.title, "Books and Authors API");
  assert.ok(spec.paths["/books/{id}"].delete);
  assert.ok(spec.paths["/authors/{id}"].delete);

  const malformedJson = await fetch(`${baseUrl}/books`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{"
  });
  assert.equal(malformedJson.status, 400);
  assert.deepEqual(await malformedJson.json(), { message: "Invalid JSON request body" });

  const unknownRoute = await fetch(`${baseUrl}/unknown`);
  assert.equal(unknownRoute.status, 404);
  assert.deepEqual(await unknownRoute.json(), { message: "Route not found" });
});
