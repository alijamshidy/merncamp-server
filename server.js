const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { dbConnect } = require("./utils/db");
const { readdirSync } = require("fs");
const socket = require("socket.io");
require("dotenv").config();
const port = process.env.PORT;

const app = express();
const http = require("http").createServer(app);
//db
const io = socket(http, {
  cors: {
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-type"],
  },
});
dbConnect();

//middlewares

app.use(express.json({ limit: "5mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
  })
);

//autoload routes
readdirSync("./routes").map(file => {
  app.use("/api", require(`./routes/${file}`)); // ✅ Fix: Clean route usage
});
io.on("connect", socket => {
  socket.on("new-post", newPost => {
    console.log(newPost);
    socket.broadcast.emit("new-post", newPost);
  });
});
http.listen(port, () => console.log(`server is running on port ${port}`));
