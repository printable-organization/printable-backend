import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").unique(),
  state: text("state"),
  city: text("city"),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const merchants = pgTable("merchants", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  shopName: text("shop_name").notNull(),
  shopImages: text("images")
    .array()
    .default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  merchantId: text("merchant_id").references(() => merchants.id, {
    onDelete: "cascade",
  }),
  status: text("status").default("pending").notNull(),
  totalAmount: integer("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  scheduledPrintTime: timestamp("scheduled_print_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  fulfillmentType: text("fulfillment_type").default("delivery").notNull(), // "takeaway" or "delivery"

  // Optional delivery address fields (if not taking away)
  state: text("state"),
  city: text("city"),
  address: text("address"),
  latitude: text("latitude"),
  longitude: text("longitude"),

  // JSONB to store multiple documents and their print settings
  documents: jsonb("documents").notNull(),
});

// RELATIONS
export const merchantsRelations = relations(merchants, ({ many }) => ({
  orders: many(orders), // A merchant can have multiple orders
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  merchant: one(merchants, {
    fields: [orders.merchantId],
    references: [merchants.id],
  }),
}));

// EXAMPLE OF JSONB FOR DOCUMENTS COLUMN IN ORDERS TABLE
// [
//   {
//     "fileName": "assignment.pdf",
//     "fileUrl": "https://example.com/assignment.pdf",
//     "copies": 2,
//     "colorType": "color",
//     "paperType": "A4",
//     "printType": "front_and_back",
//     "pageDirection": "vertical"
//   },
//   {
//     "fileName": "notes.pdf",
//     "fileUrl": "https://example.com/notes.pdf",
//     "copies": 1,
//     "colorType": "black_and_white",
//     "paperType": "Letter",
//     "printType": "front",
//     "pageDirection": "horizontal"
//   }
// ]
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  fileName: text("file_name").notNull(),
  fileKey: text("file_key").notNull(), // file access url
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export const signRequests = pgTable("signature_requests", {
  id: serial("id").primaryKey(),
  requestedBy: text("requested_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Requested owner
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const signRequestedFiles = pgTable("sign_requested_files", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id")
    .notNull()
    .references(() => files.id, {
      onDelete: "cascade",
    }),
  requestId: integer("request_id")
    .notNull()
    .references(() => signRequests.id, {
      onDelete: "cascade",
    }),
});

export const signatureStatus = pgTable("signature_status", {
  id: serial("id").primaryKey(),

  requestId: integer("request_id")
    .notNull()

    .references(() => signRequests.id, {
      onDelete: "cascade",
    }),

  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // Nullable for unregistered users

  email: text("email"), // Store email for unregistered users

  signatureKey: text("signature_key"), // Stores digital signature key (if signed)

  status: text("status").default("pending"), // "pending" | "signed"

  signedAt: timestamp("signed_at"),
});

// one user can have multiple files
export const userFileRelations = relations(users, ({ many }) => ({
  files: many(files),
}));

// one user can have multiple sign requests
export const userSignRequestRelations = relations(users, ({ many }) => ({
  signRequests: many(signRequests),
}));
// one sign request can have multiple files
export const signRequestFileRelations = relations(signRequests, ({ many }) => ({
  files: many(signRequestedFiles),
}));

//one file can have multiple signatures
export const fileSignaturesRelations = relations(files, ({ many }) => ({
  signatures: many(signatureStatus),
}));
//one sign request can have multiple signature status
export const signRequestWithsignaturesRelations = relations(
  signRequests,
  ({ many }) => ({
    signatures: many(signatureStatus),
  }),
);
