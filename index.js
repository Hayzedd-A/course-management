require("dotenv").config();
const routemap = require("express-routemap");
const express = require("express");
const colors = require("colors");
const cors = require("cors");
const connectDB = require("./config/mongoose.config");
const authRoutes = require("./routes/authentication.routes");
const courseRoutes = require("./routes/course.routes");
const errorHandler = require("./middleware/ErrorHandler");
const path = require("path");

const app = express();

app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [process.env.FRONTEND_URL], // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    exposedHeaders: ["token"],
  })
);

connectDB();
app.listen(PORT, () => {
  routemap(app);
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Course management system, Prodly 🇳🇬",
  });
});

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error Handling middleware
app.use(errorHandler);
