import { getDatabase } from "../db.js";

const bookFields = {
  _id: 0,
  id: 1,
  author: 1,
  title: 1,
  publicationDate: 1
};

export const getAllBooks = async (req, res) => {
  try {
    const books = await getDatabase()
      .collection("books")
      .find({}, { projection: bookFields })
      .sort({ id: 1 })
      .toArray();

    return res.status(200).json(books);
  } catch (error) {
    console.error("Failed to retrieve books:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await getDatabase()
      .collection("books")
      .findOne({ id: req.params.id }, { projection: bookFields });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Failed to retrieve book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
