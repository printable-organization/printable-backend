import {
  files,
  signatureStatus,
  signRequestedFiles,
  signRequests,
  users,
} from "../db/schema.ts";
// import { db } from "../configs/db.ts";
import { inArray, eq, and, sql } from "drizzle-orm";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
const pool = new Pool({
  connectionString: Deno.env.get("DATABASE_URL"),
});
const db = drizzle({ client: pool });

export interface esignRequestPayload {
  requestedBy: number;
  fileIds: number[];
  signers_email: string[];
  link: string;
}
export interface FilePayload {
  ownerId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  fileType: string;
}
export class EsignService {
  constructor() {}
  async createFile(payload: FilePayload) {
    const id = crypto.randomUUID();

    return await db
      .insert(files)
      .values({
        ...payload,
      })
      .returning();
  }

  async isValidSigner(payload: { signer_email: string; fileId: number }) {
    const result = await db
      .select({
        fileUrl: files.fileKey,
        view: sql<boolean>`true`.as("view"),
        sign: sql<boolean>`
        CASE 
          WHEN ${signatureStatus.email} = ${payload.signer_email} 
          THEN true 
          ELSE false 
        END
      `.as("sign"),
      })
      .from(files)
      .innerJoin(signRequestedFiles, eq(files.id, signRequestedFiles.fileId))
      .innerJoin(
        signatureStatus,
        eq(signRequestedFiles.requestId, signatureStatus.requestId),
      )
      .where(eq(files.id, payload.fileId))
      .limit(1);

    return result[0]; // return single object instead of array
  }

  async sendSigningRequest(payload: esignRequestPayload) {
    // const id = crypto.randomUUID();
    // check if requested user is the owner of file or not
    const response = await db
      .select()
      .from(files)
      .where(
        and(
          inArray(files.id, payload.fileIds),
          eq(files.ownerId, payload.requestedBy),
        ),
      );
    if (response.length === 0)
      return {
        status: 400,
        message: "Not eligible to send sign request",
      };

    const res = await db.transaction(async (tx) => {
      // create signRequest record in signRequest table
      const [signRequest] = await tx
        .insert(signRequests)
        .values({
          // id,
          requestedBy: payload.requestedBy,
          status: "pending",
        })
        .returning({ id: signRequests.id });

      const fileEntries = payload.fileIds.map((fileId) => ({
        fileId,
        requestId: signRequest.id,
      }));
      console.log(fileEntries)
      // create entry within signRequestFiles of newSignRequests
      await tx.insert(signRequestedFiles).values(fileEntries);
      console.log("signRequest file inserted")

      // Fetch registered users in a single query
      const existingUsers = await tx
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(inArray(users.email, payload.signers_email));

      const userMap = new Map(
        existingUsers.map((user) => [user.email, user.id]),
      );

      const signatureEntries = payload.signers_email.map((email) => ({
        requestId: signRequest.id,
        userId: userMap.get(email) || null, // use userId if found
        email: email, // store email if unregistered
        status: "pending",
      }));
     await tx.insert(signatureStatus).values(signatureEntries)

      console.log("email sent to singers:", payload.signers_email);

      // after generate link and send email
      return userMap
    });
    if(res) return {
        msg:"record for signRequest is saved! you can proceed for mailing..."
    }
    // next to proceed
    //
  }
}
