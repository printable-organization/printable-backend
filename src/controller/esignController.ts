import { Request, Response, NextFunction } from "express";

import { EsignService } from "../services/esignService.ts";
const esignService = new EsignService();
export const sendSigningRequest = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await esignService.sendSigningRequest(req.body);
    console.log(response);

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
// Check if user is can proceed to sign or no
export const canProceed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId, userId } = req.params;
    console.log({ fileId, userId });

    const response = await esignService.isValidSigner({
      signer_userId: Number(userId),
      fileId: Number(fileId),
    });
    console.log(response);
    if (response)
      return res.status(200).json({ response: response, success: true });
    return res.status(404).json({ response: "file not found", success: false });
  } catch (error) {
    console.log("error->");
    next(error);
  }
};
//after signing the document
export const uploadSignedDocument = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    // const order = await esignService.uploadSignedDocument();

    // return res.status(200).json(order);
    return "";
  } catch (error) {
    next(error);
  }
};
