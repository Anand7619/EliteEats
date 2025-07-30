import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";

dotenv.config();

const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in .env file!");
        return null;
    }
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Generated Token:", token); // Debugging line
    return token;
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Login attempt for:", email);
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        if (!token) {
            return res.json({ success: false, message: "Token generation failed" });
        }

        console.log("User logged in successfully, Token sent to frontend");
        res.json({ success: true, token });
    } catch (error) {
        console.error("Login error:", error);
        res.json({ success: false, message: "Error" });
    }
};

// Register user
const regUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        console.log("Registration attempt for:", email);
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        const user = await newUser.save();
        const token = createToken(user._id);
        if (!token) {
            return res.json({ success: false, message: "Token generation failed" });
        }

        console.log("User registered successfully, Token sent to frontend");
        res.json({ success: true, token });
    } catch (error) {
        console.error("Registration error:", error);
        res.json({ success: false, message: "Error" });
    }
};

export { loginUser, regUser };
