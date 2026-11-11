import { getDatabase } from "../db.js";
import { createAuthorsModel } from "../models/authors.js";
import {
  hasDuplicateId,
  isNonEmptyString,
  isObject
} from "../validation.js";

const validBirthYear = (year) => {
  return Number.isInteger(year) && year >= 1 && year <= new Date().getUTCFullYear();
};

const validAuthor = (author) => {
  return isObject(author)
    && isNonEmptyString(author.id)
    && isNonEmptyString(author.name)
    && validBirthYear(author.birthYear);
};

const validAuthorUpdate = (author) => {
  return isObject(author)
    && isNonEmptyString(author.name)
    && validBirthYear(author.birthYear);
};

export const createAuthorHandlers = (getDatabaseProvider = getDatabase) => {
  const authorsModel = createAuthorsModel(getDatabaseProvider);

  return {
    getAllAuthors: async (req, res) => {
      try {
        const authors = await authorsModel.getAllAuthors();
        return res.status(200).json(authors);
      } catch (error) {
        console.error("Failed to retrieve authors:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    getAuthorById: async (req, res) => {
      try {
        const author = await authorsModel.getAuthorById(req.params.id);
        if (!author) {
          return res.status(404).json({ message: "Author not found" });
        }

        return res.status(200).json(author);
      } catch (error) {
        console.error("Failed to retrieve author:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    createAuthor: async (req, res) => {
      const newAuthor = req.body;

      if (!validAuthor(newAuthor)) {
        return res.status(400).json({
          message: "id, name, and a valid integer birthYear are required"
        });
      }

      const author = {
        id: newAuthor.id.trim(),
        name: newAuthor.name.trim(),
        birthYear: newAuthor.birthYear
      };

      try {
        const result = await authorsModel.createAuthor(author);
        if (!result.insertedId) {
          throw new Error("MongoDB did not confirm the author insert.");
        }
        return res.status(201).json(author);
      } catch (error) {
        if (hasDuplicateId(error)) {
          return res.status(400).json({ message: "Author id already exists" });
        }
        console.error("Failed to create author:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    updateAuthor: async (req, res) => {
      const updatedFields = req.body;

      if (!validAuthorUpdate(updatedFields)) {
        return res.status(400).json({
          message: "name and a valid integer birthYear are required"
        });
      }

      const fields = {
        name: updatedFields.name.trim(),
        birthYear: updatedFields.birthYear
      };

      try {
        const result = await authorsModel.updateAuthor(req.params.id, fields);
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Author not found" });
        }

        return res.status(200).json({ id: req.params.id, ...fields });
      } catch (error) {
        console.error("Failed to update author:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    },

    deleteAuthor: async (req, res) => {
      try {
        const author = await authorsModel.getAuthorById(req.params.id);
        if (!author) {
          return res.status(404).json({ message: "Author not found" });
        }

        const hasBooks = await authorsModel.authorHasBooks(req.params.id);
        if (hasBooks) {
          return res.status(409).json({ message: "Author has books and cannot be deleted" });
        }

        const result = await authorsModel.deleteAuthor(req.params.id);
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Author not found" });
        }

        return res.status(204).end();
      } catch (error) {
        console.error("Failed to delete author:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  };
};

const handlers = createAuthorHandlers();
export const {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor
} = handlers;
