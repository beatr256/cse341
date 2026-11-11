import { getDatabase } from "../db.js";

const bookFields = { _id: 0, id: 1, authorId: 1, title: 1, publicationDate: 1 };

export const createBooksModel = (getDatabaseProvider = getDatabase) => {return {
  getAllBooks: async () => {
    return getDatabaseProvider()
      .collection("books")
      .find({}, { projection: bookFields })
      .sort({ id: 1 })
      .toArray();
  },

  getBookById: async (id) => {
    return getDatabaseProvider()
      .collection("books")
      .findOne({ id }, { projection: bookFields });
  },

  createBook: async (book) => {
    return getDatabaseProvider().collection("books").insertOne(book);
  },

  updateBook: async (id, updatedFields) => {
    return getDatabaseProvider().collection("books").updateOne(
      { id },
      { $set: updatedFields }
    );
  },

  deleteBook: async (id) => {
    return getDatabaseProvider().collection("books").deleteOne({ id });
  },

  authorExists: async (authorId) => {
    const author = await getDatabaseProvider().collection("authors").findOne(
      { id: authorId },
      { projection: { _id: 1 } }
    );
    return Boolean(author);
  }
}};

const booksModel = createBooksModel();
export const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists
} = booksModel;

export { bookFields };
