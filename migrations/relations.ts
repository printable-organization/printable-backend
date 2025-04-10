import { relations } from "drizzle-orm/relations";
import { users, orders, merchants, files, signRequestedFiles, signatureRequests, signatureStatuses } from "./schema";

export const ordersRelations = relations(orders, ({one}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	merchant: one(merchants, {
		fields: [orders.merchantId],
		references: [merchants.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	orders: many(orders),
	files: many(files),
	signatureRequests: many(signatureRequests),
	merchants: many(merchants),
	signatureStatuses: many(signatureStatuses),
}));

export const merchantsRelations = relations(merchants, ({one, many}) => ({
	orders: many(orders),
	user: one(users, {
		fields: [merchants.userId],
		references: [users.id]
	}),
}));

export const filesRelations = relations(files, ({one, many}) => ({
	user: one(users, {
		fields: [files.ownerId],
		references: [users.id]
	}),
	signRequestedFiles: many(signRequestedFiles),
}));

export const signRequestedFilesRelations = relations(signRequestedFiles, ({one}) => ({
	file: one(files, {
		fields: [signRequestedFiles.fileId],
		references: [files.id]
	}),
	signatureRequest: one(signatureRequests, {
		fields: [signRequestedFiles.requestId],
		references: [signatureRequests.id]
	}),
}));

export const signatureRequestsRelations = relations(signatureRequests, ({one, many}) => ({
	signRequestedFiles: many(signRequestedFiles),
	user: one(users, {
		fields: [signatureRequests.requestedBy],
		references: [users.id]
	}),
	signatureStatuses: many(signatureStatuses),
}));

export const signatureStatusesRelations = relations(signatureStatuses, ({one}) => ({
	signatureRequest: one(signatureRequests, {
		fields: [signatureStatuses.requestId],
		references: [signatureRequests.id]
	}),
	user: one(users, {
		fields: [signatureStatuses.userId],
		references: [users.id]
	}),
}));