import { MongoClient } from "mongodb";

const books = [
  {
    id: "b1",
    author: "Maya Rivera",
    title: "Patterns of Light",
    publicationDate: "2021-08-17"
  },
  {
    id: "b2",
    author: "Jordan Lee",
    title: "The Quiet Map",
    publicationDate: "2019-04-03"
  },
  {
    id: "b3",
    author: "Sam Patel",
    title: "Beyond the Harbor",
    publicationDate: "2023-11-12"
  }
];

const seedDatabase = async () => {
  const { MONGODB_URI, MONGODB_DB } = process.env;

  if (!MONGODB_URI || !MONGODB_DB) {
    throw new Error("MONGODB_URI and MONGODB_DB must be configured.");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const collection = client.db(MONGODB_DB).collection("books");
    await collection.createIndex({ id: 1 }, { unique: true });

    await collection.bulkWrite(
      books.map((book) => {
        return {
          replaceOne: {
            filter: { id: book.id },
            replacement: book,
            upsert: true
          }
        };
      })
    );

    console.log("Seeded the books collection.");
  } finally {
    await client.close();
  }
};

try {
  await seedDatabase();
} catch (error) {
  console.error("Failed to seed the database:", error);
  process.exitCode = 1;
}
