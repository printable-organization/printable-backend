import { Request, Response, NextFunction } from "express";
import {
  MerchantService,
  MerchantCreatePayload,
  MerchantUpdatePayload,
} from "../services/merchantService.ts";

const merchantService = new MerchantService();

export const getMerchant = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) res.status(400).json({ error: "Merchant ID is required" });

    const merchant = await merchantService.getMerchantWithOrder(id);
    if (!merchant) res.status(404).json({ error: "Merchant not found" });

    res.status(200).json(merchant);
  } catch (error) {
    next(error);
  }
};

export const createMerchant = async (
  req: Request<{}, {}, MerchantCreatePayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = req.body;
    const newMerchant = await merchantService.createMerchant(payload);
    res.status(201).json({
      message: "Merchant created successfully",
      merchant: newMerchant,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMerchant = async (
  req: Request<{ id: string }, {}, MerchantUpdatePayload>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    if (!id) res.status(400).json({ error: "Merchant ID is required" });

    const updatedMerchant = await merchantService.updateMerchant(id, payload);
    if (!updatedMerchant)
      res.status(404).json({ error: "Merchant not found or update failed" });

    res.status(200).json({
      message: "Merchant updated successfully",
      merchant: updatedMerchant,
    });
  } catch (error) {
    next(error);
  }
};
