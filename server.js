import express from "express";
import routes from "./src/routes/indexRoutes.js";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.40:5173",
  "http://192.168.1.247:5173",
  "http://10.241.74.41:5173",
  "http://192.168.100.12:5173",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(express.json());
app.use(helmet());
app.use(cors(corsOptions));

app.use("/api", routes);

export default app;
