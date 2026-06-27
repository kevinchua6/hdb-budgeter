import { integer, real, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const transactions = sqliteTable(
  "transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    month: text("month").notNull(),
    flatType: text("flat_type").notNull(),
    block: text("block").notNull(),
    streetName: text("street_name").notNull(),
    storeyMin: integer("storey_min").notNull(),
    storeyMax: integer("storey_max").notNull(),
    resalePrice: integer("resale_price").notNull(),
    leaseCommenceDate: integer("lease_commence_date"),
    stationCode: text("station_code"),
    walkingMinutes: real("walking_minutes"),
  },
  (t) => [
    index("idx_filter").on(t.stationCode, t.flatType, t.storeyMin, t.month),
  ]
);
