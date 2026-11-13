import { MongoClient, type Collection, type Document } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  resultsIndexed?: boolean;
};

export async function getResultsCollection(): Promise<Collection<Document>> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri);
  }

  await globalForMongo.mongoClient.connect();
  const collection = globalForMongo.mongoClient
    .db(process.env.MONGODB_DB || "iqtest")
    .collection("results");

  if (!globalForMongo.resultsIndexed) {
    await collection.createIndex({ submittedAt: -1 });
    globalForMongo.resultsIndexed = true;
  }

  return collection;
}
