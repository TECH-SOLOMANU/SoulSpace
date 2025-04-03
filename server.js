require("dotenv").config({ path: "api.env" }); // Load environment variables

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// ✅ Load Firebase Web API Key from .env
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const PORT = process.env.PORT || 5000;

if (!FIREBASE_API_KEY) {
    console.error("❌ Firebase API Key is missing! Check your api.env file.");
    process.exit(1); // Stop the server if API key is missing
}

// ✅ Test if ENV Variables are Loaded
console.log("✅ Firebase API Key Loaded:", FIREBASE_API_KEY ? "YES" : "NO");

// ✅ User Signup
app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    try {
        const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
        const response = await axios.post(firebaseUrl, {
            email,
            password,
            returnSecureToken: true,
        });

        res.status(201).json({
            message: "User created successfully",
            token: response.data.idToken,
        });
    } catch (error) {
        console.error("Signup Error:", error.response?.data || error.message);
        res.status(400).json({
            error: error.response?.data?.error?.message || "Signup failed",
        });
    }
});

// ✅ User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const firebaseUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
        const response = await axios.post(firebaseUrl, {
            email,
            password,
            returnSecureToken: true,
        });

        res.status(200).json({
            message: "Login successful",
            token: response.data.idToken,
        });
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        res.status(401).json({
            error: error.response?.data?.error?.message || "Invalid email or password",
        });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
