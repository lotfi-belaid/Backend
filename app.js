var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const http = require("http");

require("dotenv").config();

const { connectToMongoDB, disconnectFromMongoDB } = require("./db/db");

// Centralized API Router
var apiRouter = require("./routes/apiRouter");

var app = express();

app.use(logger("dev"));
app.use(
  express.json({
    verify: (req, res, buf) => {
      // Correct path for Stripe Webhooks in the new structure
      if (req.originalUrl === "/api/invoices/webhook") {
        req.rawBody = buf;
      }
    },
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Mount all API routes under /api
app.use("/api", apiRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json({
    success: false,
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Unexpected server error",
      details: req.app.get("env") === "development" ? err.stack : null,
    },
  });
});

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToMongoDB();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectFromMongoDB();
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
