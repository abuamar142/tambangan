import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "./index";

let running: Promise<void> | null = null;

export function bootstrapDb(): Promise<void> {
  running ??= run();
  return running;
}

async function run() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      username text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      role text NOT NULL DEFAULT 'nahkoda',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'nahkoda'`);

  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'nahkoda'`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS tambangan (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      nama text NOT NULL,
      titik_a_nama text NOT NULL,
      titik_a_lat double precision,
      titik_a_lng double precision,
      titik_b_nama text NOT NULL,
      titik_b_lat double precision,
      titik_b_lng double precision,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kapal (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      nama text NOT NULL,
      tambangan_id integer NOT NULL REFERENCES tambangan(id) ON DELETE CASCADE,
      owner_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'titik_a',
      departing_from text,
      timer_end_at timestamptz,
      last_updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS kapal_tambangan_idx ON kapal (tambangan_id)`,
  );
  await db.execute(sql`CREATE INDEX IF NOT EXISTS kapal_owner_idx ON kapal (owner_id)`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS kapal_events (
      id serial PRIMARY KEY,
      kapal_id integer NOT NULL REFERENCES kapal(id) ON DELETE CASCADE,
      event text NOT NULL,
      meta jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS kapal_events_kapal_idx ON kapal_events (kapal_id)`,
  );

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
