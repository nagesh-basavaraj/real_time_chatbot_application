import { useState } from "react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {

    const [isRegister, setIsRegister] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {

            const endpoint = isRegister
                ? `${API_URL}/api/auth/register`
                : `${API_URL}/api/auth/login`;

            const body = isRegister
                ? {
                    name,
                    email,
                    password
                }
                : {
                    email,
                    password
                };

            console.log("API URL:", API_URL);
            console.log("Endpoint:", endpoint);

            const response = await fetch(endpoint, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)
            });

            // Read response as text first
            const responseText = await response.text();

            console.log("Response status:", response.status);
            console.log("Response body:", responseText);

            // Safely convert response to JSON
            let data = {};

            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                } catch (jsonError) {

                    console.error(
                        "Invalid JSON response:",
                        jsonError
                    );

                    throw new Error(
                        "Server returned an invalid response."
                    );
                }
            }

            // Handle backend errors
            if (!response.ok) {

                throw new Error(
                    data.message ||
                    (
                        isRegister
                            ? "Registration failed"
                            : "Invalid email or password"
                    )
                );
            }

            // REGISTER
            if (isRegister) {

                setSuccess(
                    "Account created successfully! You can now login."
                );

                setIsRegister(false);

                setName("");
                setPassword("");

            }

            // LOGIN
            else {

                if (!data.token) {

                    throw new Error(
                        "Login successful, but no authentication token was returned."
                    );
                }

                localStorage.setItem(
                    "token",
                    data.token
                );

                onLogin(data.user);
            }

        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );

            setError(
                error.message ||
                "Something went wrong. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="auth-page">

            <div className="auth-background-shape shape-one"></div>
            <div className="auth-background-shape shape-two"></div>

            <div className="auth-card">

                {/* LEFT SIDE */}

                <div className="auth-brand">

                    <div className="brand-icon">
                        🤖
                    </div>

                    <h1>
                        AI Chat
                    </h1>

                    <p>
                        Your intelligent real-time
                        AI assistant
                    </p>

                    <div className="feature-list">

                        <div>
                            <span>⚡</span>
                            Real-time conversations
                        </div>

                        <div>
                            <span>🔐</span>
                            Secure authentication
                        </div>

                        <div>
                            <span>💬</span>
                            Save your conversations
                        </div>

                    </div>

                </div>


                {/* RIGHT SIDE */}

                <div className="auth-form-section">

                    <div className="auth-header">

                        <h2>
                            {isRegister
                                ? "Create your account"
                                : "Welcome back"}
                        </h2>

                        <p>
                            {isRegister
                                ? "Join AI Chat and start your conversation."
                                : "Sign in to continue to your AI assistant."}
                        </p>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="auth-form"
                    >

                        {/* NAME */}

                        {isRegister && (

                            <div className="form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                            </div>

                        )}


                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                required
                                minLength="6"
                            />

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="auth-message error">
                                ⚠️ {error}
                            </div>

                        )}


                        {/* SUCCESS */}

                        {success && (

                            <div className="auth-message success">
                                ✓ {success}
                            </div>

                        )}


                        {/* SUBMIT BUTTON */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Please wait..."
                                : isRegister
                                    ? "Create Account"
                                    : "Sign In"}

                        </button>

                    </form>


                    {/* SWITCH LOGIN / REGISTER */}

                    <div className="auth-divider">

                        <span>
                            {isRegister
                                ? "Already have an account?"
                                : "Don't have an account?"}
                        </span>

                    </div>


                    <button
                        className="switch-auth"
                        onClick={() => {

                            setIsRegister(
                                !isRegister
                            );

                            setError("");
                            setSuccess("");

                        }}
                    >

                        {isRegister
                            ? "Sign in instead"
                            : "Create a new account"}

                    </button>


                    <p className="security-note">

                        🔒 Your account information is securely
                        protected.

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;