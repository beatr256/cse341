import app from "./src/app.js";
import { connectToDatabase } from "./src/db.js";

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectToDatabase();

    app.listen(port, () => {
      console.log(`Books API listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start the Books API:", error);
    process.exitCode = 1;
  }
};

await startServer();
