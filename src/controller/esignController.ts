import { Request, Response, NextFunction } from "express";

import { EsignService } from "../services/esignService.ts";
const esignService = new EsignService();
export const sendSigningRequest = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await esignService.sendSigningRequest(req.body);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
// Check if user is can proceed to sign or no
export const canProceed = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("reached");
    const { fileId, gmail } = req.params;

    const order = await esignService.isValidSigner({signer_email: gmail, fileId: Number(fileId)});
    console.log(req.params);

    console.log(fileId, gmail);
    res.status(200).json(order);
  } catch (error) {
    console.log("error->");
    next(error);
  }
};

export const uploadSignedDocument = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order = await esignService.uploadSignedDocument();

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
