var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const http = require("http");

require("dotenv").config();

const { connectToMongoDB, disconnectFromMongoDB } = require("./db/db");

var indexRouter = require("./routes/index");
var authRouter = require("./routes/authRouter");
var adminRouter = require("./routes/adminRouter");
var ownerRouter = require("./routes/ownerRouter");
var tenantRouter = require("./routes/tenantRouter");
var vendorRouter = require("./routes/vendorRouter");
var paymentRouter = require("./routes/paymentRouter");
var userCrudRouter = require("./routes/userCrudRouter");

var app = express();

app.use(logger("dev"));
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/index", indexRouter);
app.use("/users", authRouter);
app.use("/users/admin", adminRouter);
app.use("/users/owner", ownerRouter);
app.use("/users/tenant", tenantRouter);
app.use("/users/vendor", vendorRouter);
app.use("/users", paymentRouter);
app.use("/users", userCrudRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.json("error");
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
