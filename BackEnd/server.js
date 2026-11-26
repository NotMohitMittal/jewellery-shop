import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/db/db.js";

connectDB(); // database connection

app.listen(process.env.PORT, () => {
  console.log("Server running");
});
