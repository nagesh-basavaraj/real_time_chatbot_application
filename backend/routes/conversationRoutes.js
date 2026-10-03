const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/message");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();


// ========================================
// Create a new conversation
// ========================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const conversation = await Conversation.create({
            userId: req.userId,
            title: "New Chat"
        });

        res.status(201).json(conversation);

    } catch (error) {

        console.error(
            "Create conversation error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to create conversation",
            error: error.message
        });
    }

});


// ========================================
// Get logged-in user's conversations
// ========================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const conversations = await Conversation.find({
            userId: req.userId
        }).sort({
            updatedAt: -1
        });

        res.json(conversations);

    } catch (error) {

        console.error(
            "Get conversations error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to get conversations",
            error: error.message
        });
    }

});


// ========================================
// Get messages for a conversation
// ========================================

router.get(
    "/:id/messages",
    authMiddleware,
    async (req, res) => {

        try {

            // Check that conversation belongs to user
            const conversation =
                await Conversation.findOne({
                    _id: req.params.id,
                    userId: req.userId
                });

            if (!conversation) {

                return res.status(404).json({
                    message: "Conversation not found"
                });

            }

            const messages =
                await Message.find({
                    conversationId: req.params.id
                }).sort({
                    createdAt: 1
                });

            res.json(messages);

        } catch (error) {

            console.error(
                "Get messages error:",
                error.message
            );

            res.status(500).json({
                message: "Failed to get messages",
                error: error.message
            });
        }

    }
);


// ========================================
// Update conversation title
// ========================================

router.put(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const { title } = req.body;

            const conversation =
                await Conversation.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        userId: req.userId
                    },
                    {
                        title: title
                    },
                    {
                        new: true
                    }
                );

            if (!conversation) {

                return res.status(404).json({
                    message: "Conversation not found"
                });

            }

            res.json(conversation);

        } catch (error) {

            res.status(500).json({
                message: "Failed to update conversation",
                error: error.message
            });
        }

    }
);


// ========================================
// Delete conversation
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const conversation =
                await Conversation.findOne({
                    _id: req.params.id,
                    userId: req.userId
                });

            if (!conversation) {

                return res.status(404).json({
                    message: "Conversation not found"
                });

            }

            await Message.deleteMany({
                conversationId: req.params.id
            });

            await Conversation.findByIdAndDelete(
                req.params.id
            );

            res.json({
                message: "Conversation deleted"
            });

        } catch (error) {

            res.status(500).json({
                message: "Failed to delete conversation",
                error: error.message
            });
        }

    }
);


module.exports = router;