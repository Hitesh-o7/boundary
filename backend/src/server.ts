import { createApp } from "./app";
import dotenv from "dotenv";

dotenv.config();

const app = createApp();
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Boundary Insights backend listening on port ${port}`);
});

