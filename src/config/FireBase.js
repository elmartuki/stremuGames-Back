import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const serviceAccount = require("./key.json");

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin inicializado correctamente");
} catch (error) {
  console.error("❌ Error inicializando Firebase Admin:", error);
}

export default admin;
