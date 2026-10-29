import express from "express";
import booksRouter from "./routes/books.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server is running" });
});

app.use("/books", booksRouter);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

export default app;
