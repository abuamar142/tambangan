import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("nahkoda"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tambangan = pgTable("tambangan", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nama: text("nama").notNull(),
  titikANama: text("titik_a_nama").notNull(),
  titikALat: doublePrecision("titik_a_lat"),
  titikALng: doublePrecision("titik_a_lng"),
  titikBNama: text("titik_b_nama").notNull(),
  titikBLat: doublePrecision("titik_b_lat"),
  titikBLng: doublePrecision("titik_b_lng"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const kapal = pgTable(
  "kapal",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    nama: text("nama").notNull(),
    tambanganId: integer("tambangan_id")
      .notNull()
      .references(() => tambangan.id, { onDelete: "cascade" }),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("titik_a"),
    departingFrom: text("departing_from"),
    timerEndAt: timestamp("timer_end_at", { withTimezone: true }),
    lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("kapal_tambangan_idx").on(t.tambanganId),
    index("kapal_owner_idx").on(t.ownerId),
    index("kapal_lastUpdated_status_idx").on(t.lastUpdatedAt, t.status),
  ],
);

export const kapalEvents = pgTable(
  "kapal_events",
  {
    id: serial("id").primaryKey(),
    kapalId: integer("kapal_id")
      .notNull()
      .references(() => kapal.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("kapal_events_kapal_idx").on(t.kapalId)],
);
