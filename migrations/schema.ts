import { pgTable, foreignKey, text, integer, jsonb, timestamp, unique, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const orders = pgTable("orders", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	merchantId: text("merchant_id"),
	status: text().default('pending').notNull(),
	totalAmount: integer("total_amount").notNull(),
	documents: jsonb().notNull(),
	paymentMethod: text("payment_method").notNull(),
	scheduledPrintTime: timestamp("scheduled_print_time", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	fulfillmentType: text("fulfillment_type").default('delivery').notNull(),
	state: text(),
	city: text(),
	address: text(),
	latitude: text(),
	longitude: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.merchantId],
			foreignColumns: [merchants.id],
			name: "orders_merchant_id_merchants_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	phone: text(),
	state: text(),
	city: text(),
	address: text(),
	latitude: text(),
	longitude: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_phone_unique").on(table.phone),
]);

export const files = pgTable("files", {
	id: serial().primaryKey().notNull(),
	ownerId: text("owner_id").notNull(),
	fileName: text("file_name").notNull(),
	fileKey: text("file_key").notNull(),
	fileSize: integer("file_size").notNull(),
	fileType: text("file_type").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp({ mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "files_owner_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const signRequestedFiles = pgTable("sign_requested_files", {
	id: serial().primaryKey().notNull(),
	fileId: integer("file_id").notNull(),
	requestId: integer("request_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.fileId],
			foreignColumns: [files.id],
			name: "sign_requested_files_file_id_files_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.requestId],
			foreignColumns: [signatureRequests.id],
			name: "sign_requested_files_request_id_signature_requests_id_fk"
		}).onDelete("cascade"),
]);

export const signatureRequests = pgTable("signature_requests", {
	id: serial().primaryKey().notNull(),
	requestedBy: text("requested_by").notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.requestedBy],
			foreignColumns: [users.id],
			name: "signature_requests_requested_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const merchants = pgTable("merchants", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	shopName: text("shop_name").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	images: text().array().default(["RAY"]),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "merchants_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const signatureStatus = pgTable("signature_statuses", {
	id: serial().primaryKey().notNull(),
	requestId: integer("request_id").notNull(),
	userId: text("user_id").notNull(),
	signatureKey: text("signature_key"),
	status: text().default('pending'),
	signedAt: timestamp("signed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.requestId],
			foreignColumns: [signatureRequests.id],
			name: "signature_statuses_request_id_signature_requests_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "signature_statuses_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
