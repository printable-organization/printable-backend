import { config } from "dotenv";

import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema.ts";

import "jsr:@std/dotenv/load";

config({ path: ".env" });

// HTTP connection for non-transactional queries

export const db = drizzle(Deno.env.get("DATABASE_URL")!, { schema });
