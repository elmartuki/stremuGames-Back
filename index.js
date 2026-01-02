import express from "express";
import routes from "./src/routes/indexRoutes.js";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(express.json());
app.use(helmet());
app.use(cors(corsOptions));

app.use("/api", routes);

app.listen(3000, () => {
  console.log("Servidor corriendo en el puerto 3000");
});

export default app;
