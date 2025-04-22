import express from "express";
import {
  sendSigningRequest,
  uploadSignedDocument,
  canProceed,
} from "../controller/esignController.ts";
const router = express.Router();
//router to signRequest
router.post("/signRequest", sendSigningRequest);
// router when user clicks on the sign link
router.get("/sign-document/:fileId/:userId", canProceed);

// router for submition of signature

router.post("/submitSignature", uploadSignedDocument);
export default router;
