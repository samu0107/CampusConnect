const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const chatSocket = require("./socket/chatSocket");

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true },
});

app.use(cors());
app.use(express.json());

chatSocket(io);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));
app.use("/api/applications", require("./routes/applications"));
app.use("/api/accommodations", require("./routes/accommodation"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/time", require("./routes/timeManagement"));
connectDB();

app.get("/", (req, res) => res.send("CampusConnect API running"));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));