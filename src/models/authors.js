import { getDatabase } from "../db.js";

const authorFields = { _id: 0, id: 1, name: 1, birthYear: 1 };

export const createAuthorsModel = (getDatabaseProvider = getDatabase) => {return {
  getAllAuthors: async () => {
    return getDatabaseProvider()
      .collection("authors")
      .find({}, { projection: authorFields })
      .sort({ id: 1 })
      .toArray();
  },

  getAuthorById: async (id) => {
    return getDatabaseProvider()
      .collection("authors")
      .findOne({ id }, { projection: authorFields });
  },

  authorExists: async (id) => {
    const author = await getDatabaseProvider().collection("authors").findOne(
      { id },
      { projection: { _id: 1 } }
    );
    return Boolean(author);
  },

  authorHasBooks: async (id) => {
    const book = await getDatabaseProvider().collection("books").findOne(
      { authorId: id },
      { projection: { _id: 1 } }
    );
    return Boolean(book);
  },

  createAuthor: async (author) => {
    return getDatabaseProvider().collection("authors").insertOne(author);
  },

  updateAuthor: async (id, updatedFields) => {
    return getDatabaseProvider().collection("authors").updateOne(
      { id },
      { $set: updatedFields }
    );
  },

  deleteAuthor: async (id) => {
    return getDatabaseProvider().collection("authors").deleteOne({ id });
  }
}};

const authorsModel = createAuthorsModel();
export const {
  getAllAuthors,
  getAuthorById,
  authorExists,
  authorHasBooks,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = authorsModel;

export { authorFields };
