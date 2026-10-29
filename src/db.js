import { MongoClient } from "mongodb";

let database;

export const connectToDatabase = async () => {
  const { MONGODB_URI, MONGODB_DB } = process.env;

  if (!MONGODB_URI || !MONGODB_DB) {
    throw new Error("MONGODB_URI and MONGODB_DB must be configured.");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    database = client.db(MONGODB_DB);
    return database;
  } catch (error) {
    await client.close();
    throw error;
  }
};

export const getDatabase = () => {
  if (!database) {
    throw new Error("Database connection has not been established.");
  }

  return database;
};
