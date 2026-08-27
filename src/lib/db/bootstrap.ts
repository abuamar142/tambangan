import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "./index";

let running: Promise<void> | null = null;

export function bootstrapDb(): Promise<void> {
  running ??= run();
  return running;
}

async function run() {
  // Seed tambangan + admin (idempotent)
  await seed();
}

async function seed() {
  await db.execute(sql`
    INSERT INTO tambangan (slug, nama, titik_a_nama, titik_a_lat, titik_a_lng, titik_b_nama, titik_b_lat, titik_b_lng)
    VALUES ('jatikalen-megaluh', 'Jatikalen - Megaluh', 'Jatikalen', -7.6009, 111.9105, 'Megaluh', -7.5566, 111.9878)
    ON CONFLICT (slug) DO NOTHING
  `);

  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = bcrypt.hashSync(adminPassword, 10);

  await db.execute(sql`
    INSERT INTO users (username, password_hash, role)
    VALUES (${adminUsername}, ${hash}, 'admin')
    ON CONFLICT (username) DO UPDATE SET role = 'admin', password_hash = ${hash}
  `);
}
