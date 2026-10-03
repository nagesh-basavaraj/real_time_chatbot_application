


import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import Login from "./Login";
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(API_URL);

function App() {

    // ==============================
    // Authentication
    // ==============================

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);


    // ==============================
    // Login
    // ==============================

    const handleLogin = (loggedInUser) => {

        localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);
    };


    // ==============================
    // Logout
    // ==============================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setMessages([]);
        setConversations([]);
        setConversationId(null);
    };


    // ==============================
    // Socket.IO
    // ==============================

    useEffect(() => {

        socket.on("connect", () => {
            console.log(
                "Connected:",
                socket.id
            );
        });


        socket.on("receiveMessage", (data) => {

            setMessages((previousMessages) => [
                ...previousMessages,
                data
            ]);

        });


        socket.on(
            "conversationUpdated",
            (data) => {

                setConversations(
                    (previousConversations) =>
                        previousConversations.map(
                            (conversation) =>
                                conversation._id ===
                                data.conversationId
                                    ? {
                                        ...conversation,
                                        title:
                                            data.title
                                    }
                                    : conversation
                        )
                );

            }
        );


        return () => {

            socket.off("connect");
            socket.off("receiveMessage");
            socket.off("conversationUpdated");

        };

    }, []);


    // ==============================
    // Load conversations
    // ==============================

    useEffect(() => {

        if (!user) {
            return;
        }


        const loadConversations = async () => {

            try {

                const token =
                    localStorage.getItem("token");


                const response = await fetch(
                    `${API_URL}/api/conversations`,
                
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                if (response.status === 401) {

                    handleLogout();
                    return;

                }


                const data =
                    await response.json();


                setConversations(data);


            } catch (error) {

                console.error(
                    "Failed to load conversations:",
                    error
                );

            }

        };


        loadConversations();

    }, [user]);


    // ==============================
    // Load selected conversation
    // ==============================

    const loadConversation = async (id) => {

        try {

            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/api/conversations/${id}/messages`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (response.status === 401) {

                handleLogout();
                return;

            }


            const data =
                await response.json();


            console.log(
                "Conversation messages:",
                data
            );


            setConversationId(id);
            setMessages(data);


        } catch (error) {

            console.error(
                "Failed to load conversation:",
                error
            );

        }

    };


    // ==============================
    // Create new conversation
    // ==============================

    const createConversation = async () => {

        try {

            const token =
                localStorage.getItem("token");


            const response = await fetch(
                `${API_URL}/api/conversations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            if (response.status === 401) {

                handleLogout();
                return;

            }


            const data =
                await response.json();


            setConversationId(data._id);

            setMessages([]);


            // Add new conversation
            // to sidebar

            setConversations(
                (previous) => [
                    data,
                    ...previous
                ]
            );


        } catch (error) {

            console.error(
                "Conversation creation failed:",
                error
            );

        }

    };


    // ==============================
    // Send message
    // ==============================

    const sendMessage = () => {

        if (message.trim() === "") {
            return;
        }


        if (!conversationId) {

            alert(
                "Please create a new chat first."
            );

            return;

        }


        const currentMessage =
            message;


        // Display user's message

        setMessages(
            (previousMessages) => [
                ...previousMessages,

                {
                    sender: "user",
                    message: currentMessage
                }
            ]
        );


        // Send through Socket.IO

        socket.emit("sendMessage", {

            conversationId:
                conversationId,

            message:
                currentMessage

        });


        // Update sidebar title

        setConversations(
            (previousConversations) =>
                previousConversations.map(
                    (conversation) =>
                        conversation._id ===
                            conversationId &&
                        conversation.title ===
                            "New Chat"
                            ? {
                                ...conversation,

                                title:
                                    currentMessage.length >
                                    30
                                        ? currentMessage.substring(
                                            0,
                                            30
                                        ) + "..."
                                        : currentMessage
                            }
                            : conversation
                )
        );


        setMessage("");

    };


    // ==============================
    // Enter key
    // ==============================

    const handleKeyDown = (event) => {

        if (event.key === "Enter") {
            sendMessage();
        }

    };


    // ==============================
    // If not logged in
    // ==============================

    if (!user) {

        return (
            <Login
                onLogin={handleLogin}
            />
        );

    }


    // ==============================
    // Chat UI
    // ==============================

    return (

        <div className="app">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-header">

                    <div className="logo">

                        <span>🤖</span>

                        <h2>AI Chat</h2>

                    </div>

                </div>


                <button
                    className="new-chat-btn"
                    onClick={createConversation}
                >

                    <span>＋</span>

                    New Chat

                </button>


                <div className="history-title">

                    Recent Chats

                </div>


                <div className="conversation-list">

                    {conversations.map(
                        (conversation) => (

                            <div
                                className={`conversation-item ${
                                    conversationId ===
                                    conversation._id
                                        ? "active-conversation"
                                        : ""
                                }`}
                                key={
                                    conversation._id
                                }
                                onClick={() =>
                                    loadConversation(
                                        conversation._id
                                    )
                                }
                            >

                                <span className="chat-icon">
                                    💬
                                </span>

                                <span>
                                    {
                                        conversation.title
                                    }
                                </span>

                            </div>

                        )
                    )}

                </div>


                <div className="sidebar-footer">

                    <div className="status-dot"></div>

                    <span>
                        AI Assistant Online
                    </span>

                </div>


                {/* LOGOUT */}

                <button
                    onClick={handleLogout}
                    style={{
                        margin: "15px",
                        padding: "10px",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>

            </aside>


            {/* MAIN CHAT */}

            <main className="chat-container">

                {/* HEADER */}

                <header className="chat-header">

                    <div>

                        <h1>
                            AI Assistant
                        </h1>

                        <p>
                            Your intelligent
                            real-time chatbot
                        </p>

                    </div>


                    <div className="online-status">

                        <span></span>

                        Online

                    </div>

                </header>


                {/* CHAT BODY */}

                <section className="chat-body">

                    {!conversationId &&
                    messages.length === 0 ? (

                        <div className="welcome">

                            <div className="welcome-icon">
                                🤖
                            </div>

                            <h2>
                                Welcome to AI Chat
                            </h2>

                            <p>
                                Start a new
                                conversation and
                                chat with your AI
                                assistant.
                            </p>

                            <button
                                className="welcome-btn"
                                onClick={
                                    createConversation
                                }
                            >
                                Start New Chat
                            </button>

                        </div>

                    ) : (

                        <div className="messages">

                            {messages.map(
                                (msg, index) => (

                                    <div
                                        key={index}
                                        className={`message-row ${
                                            msg.sender ===
                                            "user"
                                                ? "user-row"
                                                : "bot-row"
                                        }`}
                                    >

                                        <div
                                            className={`avatar ${
                                                msg.sender ===
                                                "user"
                                                    ? "user-avatar"
                                                    : "bot-avatar"
                                            }`}
                                        >

                                            {msg.sender ===
                                            "user"
                                                ? "You"
                                                : "AI"}

                                        </div>


                                        <div
                                            className={`message-bubble ${
                                                msg.sender ===
                                                "user"
                                                    ? "user-message"
                                                    : "bot-message"
                                            }`}
                                        >

                                            {
                                                msg.message
                                            }

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* INPUT */}

                <div className="input-area">

                    <div className="input-wrapper">

                        <input
                            type="text"
                            placeholder="Message AI Assistant..."
                            value={message}
                            onChange={(event) =>
                                setMessage(
                                    event.target.value
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                        />


                        <button
                            className="send-btn"
                            onClick={sendMessage}
                        >
                            ➤
                        </button>

                    </div>


                    <p className="input-info">

                        Press Enter to send
                        your message

                    </p>

                </div>

            </main>

        </div>
    );
}

export default App;