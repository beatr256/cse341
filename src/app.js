import express from "express";
import swaggerUi from "swagger-ui-express";
import authorsRouter from "./routes/authors.js";
import booksRouter from "./routes/books.js";
import openApiSpec from "./openapi.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server is running" });
});

app.get("/api-docs.json", (req, res) => {
  return res.status(200).json(openApiSpec);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.use("/books", booksRouter);
app.use("/authors", authorsRouter);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON request body" });
  }

  console.error("Unhandled request error:", error);
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
