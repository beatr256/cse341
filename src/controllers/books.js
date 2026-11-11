import { getDatabase } from "../db.js";
import { createBooksModel } from "../models/books.js";
import {
  hasDuplicateId,
  isNonEmptyString,
  isObject,
  isValidDate
} from "../validation.js";

const validBook = (book) => {
  return isObject(book)
    && isNonEmptyString(book.id)
    && isNonEmptyString(book.authorId)
    && isNonEmptyString(book.title)
    && isValidDate(book.publicationDate);
};

const validBookUpdate = (book) => {
  return isObject(book)
    && isNonEmptyString(book.authorId)
    && isNonEmptyString(book.title)
    && isValidDate(book.publicationDate);
};

export const createBookHandlers = (getDatabaseProvider = getDatabase) => {
  const booksModel = createBooksModel(getDatabaseProvider);

  return {
    getAllBooks: async (req, res) => {
      try {
        const books = await booksModel.getAllBooks();
        return res.status(200).json(books);
      } catch (error) {
        console.error("Failed to retrieve books:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    getBookById: async (req, res) => {
      try {
        const book = await booksModel.getBookById(req.params.id);
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json(book);
      } catch (error) {
        console.error("Failed to retrieve book:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    createBook: async (req, res) => {
      const newBook = req.body;

      if (!validBook(newBook)) {
        return res.status(400).json({
          message: "id, authorId, title, and a valid publicationDate are required"
        });
      }

      const book = {
        id: newBook.id.trim(),
        authorId: newBook.authorId.trim(),
        title: newBook.title.trim(),
        publicationDate: newBook.publicationDate
      };

      try {
        const hasAuthor = await booksModel.authorExists(book.authorId);
        if (!hasAuthor) {
          return res.status(400).json({ message: "Author not found" });
        }

        const result = await booksModel.createBook(book);
        if (!result.insertedId) {
          throw new Error("MongoDB did not confirm the book insert.");
        }
        return res.status(201).json(book);
      } catch (error) {
        if (hasDuplicateId(error)) {
          return res.status(400).json({ message: "Book id already exists" });
        }
        console.error("Failed to create book:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    updateBook: async (req, res) => {
      const updatedFields = req.body;

      if (!validBookUpdate(updatedFields)) {
        return res.status(400).json({
          message: "authorId, title, and a valid publicationDate are required"
        });
      }

      const fields = {
        authorId: updatedFields.authorId.trim(),
        title: updatedFields.title.trim(),
        publicationDate: updatedFields.publicationDate
      };

      try {
        const existingBook = await booksModel.getBookById(req.params.id);
        if (!existingBook) {
          return res.status(404).json({ message: "Book not found" });
        }

        const hasAuthor = await booksModel.authorExists(fields.authorId);
        if (!hasAuthor) {
          return res.status(400).json({ message: "Author not found" });
        }

        const result = await booksModel.updateBook(req.params.id, fields);
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Book not found" });
        }

        return res.status(200).json({ id: req.params.id, ...fields });
      } catch (error) {
        console.error("Failed to update book:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    deleteBook: async (req, res) => {
      try {
        const result = await booksModel.deleteBook(req.params.id);
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Book not found" });
        }

        return res.status(204).end();
      } catch (error) {
        console.error("Failed to delete book:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  };
};

const handlers = createBookHandlers();
export const { getAllBooks, getBookById, createBook, updateBook, deleteBook } = handlers;
