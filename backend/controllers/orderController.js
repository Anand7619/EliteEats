import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const placeOrder = async (req, res) => {
    const frontendUrl = "http://localhost:5173"; // Replace with your frontend URL

    try {
        // ✅ Check if userId is provided
        if (!req.body.userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // ✅ Ensure `amount` is provided
        if (!req.body.amount) {
            return res.status(400).json({ success: false, message: "Amount is required" });
        }

        // ✅ Create new order with userId
        const newOrder = new orderModel({
            userId: req.body.userId,  // ✅ Fix: Include userId
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100 * 80
            },
            quantity: item.quantity
        }));

        // ✅ Add shipping fee only if amount > 0
        if (req.body.amount > 0) {
            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Shipping"
                    },
                    unit_amount: 2 * 100 * 80
                },
                quantity: 1
            });
        }

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${frontendUrl}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontendUrl}/verify?success=false&orderId=${newOrder._id}`,
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.log("Error placing order:", error);
        res.status(500).json({ success: false, message: "Error placing order", error });
    }
};

export { placeOrder };
