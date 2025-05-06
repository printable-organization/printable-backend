import "jsr:@std/dotenv/load";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import errorHandler from "./mainErrorHandler.ts";
import Routes from "./src/route/index.ts";
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api", Routes);

app.use(errorHandler);
const PORT = Deno.env.get("PORT") || 5000;
app.listen(PORT, () => console.log(`Server running on the port ${PORT}`));
