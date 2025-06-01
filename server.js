const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config({ path: ".env" });
const morgan = require("morgan");
const connectDb = require("./config/db");
//dot en configuration
dotenv.config();
//DB connection
connectDb();
//rest object
const app = express();
//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads")); 
app.use('/upload',require("./routes/uploadRoutes"));
//route
app.use("/auth", require("./routes/authRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/product", require("./routes/productRoutes"));
app.use("/event", require("./routes/eventRoutes"));

app.get("/", (req, res) => {
  return res
    .status(200)
    .send("<h1>Welcome </h1>");
});
//PORT 
const PORT = process.env.PORT || 5000;
//listen
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`.white.bgMagenta);
});


