/** biome-ignore-all lint/style/noNonNullAssertion: .env.local will always have DATABASE_URL */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const sql = postgres(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
  schema,
  relations: schema.relations,
  logger: process.env.NODE_ENV !== "production",
});
