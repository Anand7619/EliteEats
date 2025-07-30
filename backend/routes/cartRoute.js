import express from "express";
import { addToCart, removeFromCart, getCart } from "../controllers/cartController.js";
import authMiddleware from "../middleware/auth.js";

const cartRouter = express.Router();

// Log middleware for debugging
cartRouter.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - Headers:`, req.headers);
    next();
});

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.delete("/remove", authMiddleware, removeFromCart);  // Changed to DELETE
cartRouter.get("/get", authMiddleware, getCart);

export default cartRouter;
