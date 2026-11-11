import { MongoClient } from "mongodb";

const authors = [
  { id: "a1", name: "Maya Rivera", birthYear: 1980 },
  { id: "a2", name: "Jordan Lee", birthYear: 1975 },
  { id: "a3", name: "Sam Patel", birthYear: 1985 }
];

const books = [
  { id: "b1", authorId: "a1", title: "Patterns of Light", publicationDate: "2021-08-17" },
  { id: "b2", authorId: "a2", title: "The Quiet Map", publicationDate: "2019-04-03" },
  { id: "b3", authorId: "a3", title: "Beyond the Harbor", publicationDate: "2023-11-12" }
];

const seedDatabase = async () => {
  const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

  if (!MONGODB_URI || !MONGODB_DB_NAME) {
    throw new Error("MONGODB_URI and MONGODB_DB_NAME must be configured.");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const database = client.db(MONGODB_DB_NAME);

    for (const [collectionName, documents] of [["authors", authors], ["books", books]]) {
      const collection = database.collection(collectionName);
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.bulkWrite(documents.map((document) => {
        return {
          replaceOne: {
            filter: { id: document.id },
            replacement: document,
            upsert: true
          }
        };
      }));
    }

    console.log("Seeded the authors and books collections.");
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
