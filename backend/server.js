


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Message = require("./models/message");
const Conversation = require("./models/Conversation");
const conversationRoutes = require("./routes/conversationRoutes");
const authRoutes = require("./routes/authroutes");
const authMiddleware = require("./middleware/authmiddleware");

const app = express();

const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Conversation REST API
app.use("/api/conversations", conversationRoutes);
app.use("/api/auth", authRoutes);
// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Chatbot server is running"
    });
});
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You can access this protected route",
        userId: req.userId
    });
});

// Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});

// Socket connection
io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("sendMessage", async (data) => {

        try {

            console.log("User message:", data);

            const { conversationId, message } = data;
            // Find conversation
const conversation = await Conversation.findById(
    conversationId
);

// Save user message
await Message.create({
    conversationId: conversationId,
    sender: "user",
    message: message
});

// Update title if it is still "New Chat"
if (conversation && conversation.title === "New Chat") {

    const title =
        message.length > 30
            ? message.substring(0, 30) + "..."
            : message;

    await Conversation.findByIdAndUpdate(
        conversationId,
        {
            title: title
        },
        {
            new: true
        }
    );

    console.log(
        "Conversation title updated:",
        title
    );

    socket.emit("conversationUpdated", {
        conversationId: conversationId,
        title: title
    });
}

            

            await Message.create({
                conversationId: conversationId,
                sender: "user",
                message: message
            });

            console.log("User message saved");

           

            const botReply =
                "Hello! I received your message.";

            await Message.create({
                conversationId: conversationId,
                sender: "bot",
                message: botReply
            });

            console.log("Bot message saved");

            socket.emit("receiveMessage", {
                sender: "bot",
                message: botReply
            });

        } catch (error) {

            console.error(
                "Message error:",
                error.message
            );

        }

    });

    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});

// Port
const PORT = process.env.PORT || 5000;

// Connect MongoDB and start server
connectDB().then(() => {

    server.listen(PORT, () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    });

});