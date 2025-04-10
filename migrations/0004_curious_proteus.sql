CREATE TABLE "signature_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"user_id" text,
	"email" text,
	"signature_key" text,
	"status" text DEFAULT 'pending',
	"signed_at" timestamp
);
--> statement-breakpoint
DROP TABLE "signature_status" CASCADE;--> statement-breakpoint
ALTER TABLE "signature_statuses" ADD CONSTRAINT "signature_statuses_request_id_signature_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."signature_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signature_statuses" ADD CONSTRAINT "signature_statuses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;