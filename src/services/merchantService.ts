import { merchants} from "../db/schema.ts";
import { db } from "../configs/db.ts";
import { eq } from "drizzle-orm";

export interface MerchantCreatePayload {
  userId: string;
  shopName: string;
  address: string;
  contact: string;
}

export interface MerchantUpdatePayload {
  shopName?: string;
  address?: string;
  contact?: string;
}

export class MerchantService {
  public async getMerchant(merchantId: string) {
    const result = await db
      .select()
      .from(merchants)
      .where(eq(merchants.id, merchantId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  public async createMerchant(payload: MerchantCreatePayload) {
    const id = crypto.randomUUID();
    const result = await db
      .insert(merchants)
      .values({
        id,
        ...payload,
      })
      .returning();
    return result[0];
  }

  public async getMerchantWithOrder(merchant_id:string){
    const merchantWithOrders = await db.query.merchants.findFirst({
        where: (merchants, { eq }) => eq(merchants.id, merchant_id),
        with: {
          orders: true,
        },
      });
      
      console.log(merchantWithOrders);
      return merchantWithOrders
  }

  public async updateMerchant(
    merchantId: string,
    payload: MerchantUpdatePayload
  ) {
    const result = await db
      .update(merchants)
      .set(payload)
      .where(eq(merchants.id, merchantId))
      .returning();
    return result[0];
  }
}
