import "jsr:@std/dotenv/load";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../configs/s3.ts";
import { EsignService, FilePayload } from "../services/esignService.ts";
const esignService = new EsignService();
console.log(Deno.env.get("BUCKET_NAME"));

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: Deno.env.get("BUCKET_NAME"),
        metadata: (req: any, file: any, cb: any) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req: any, file: any, cb: any) => {
            cb(null, `documents/${Date.now()}_${file.originalname}`);
        },
    }),
}).single("file");


export const uploadFile = async (req: any, res: any) => {

  console.log("upload in progress")
  upload(req, res, async (err: any) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!req.file?.location) {
      return res.status(400).json({ error: "File upload failed" });
    }

    const { ownerId } = req.body;
    console.log(ownerId)

    const payload: FilePayload = {
      ownerId,
      fileName: req.file.originalname,
      fileKey: req.file.location,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    };

   try {
      // create uploaded file entry in database
      const response=await esignService.createFile(payload);
      console.log(response)
      return res.json({ message: "File uploaded successfully", fileUrl: req.file.location });
    } catch (error) {
      console.error("❌ Database save failed. Rolling back AWS upload...", error);

      //if file create Failed in Database ( Rollback: Delete file from AWS)
      await deleteFile({ params: { filename: req.file.key } }, res);
      return res.status(500).json({ error: "File upload failed due to database error" });
    }
  });
};   

export const getFile = async (req:any, res:any) => {
  console.log("req params",req.params);
  console.log("req body",req.body);

  
  try {
    const params = {
      Bucket: Deno.env.get("BUCKET_NAME"),
      Key: `documents/${req.params.filename}`,
    };

    const command = new GetObjectCommand(params);
    const { Body } = await s3.send(command); 
    
    res.attachment(req.params.filename);
    Body.pipe(res);
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFile = async (req:any, res:any) => {
  try {
    const params = {
      Bucket: Deno.env.get("BUCKET_NAME"),
      Key: `documents/${req.params.filename}`,
    };

    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    res.json({ message: "File deleted successfully" });
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
};
