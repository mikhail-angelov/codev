import dotenv from "dotenv";
import { createApp } from "./app.js";

dotenv.config();

const port = Number(process.env.PORT ?? 3020);
const app = createApp();

app.listen(port, () => {
  console.log(`Codev backend listening on port ${port}`);
});

