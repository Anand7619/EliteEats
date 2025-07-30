import express from "express"
import cors from "cors"
import path from "path";
import { connectDB } from "./config/db.js";
// import foodModel from "./models/foodModel.js";
import { fileURLToPath } from 'url';
import 'dotenv/config'
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

// app config
const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve images from 'uploads' folder
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// middleware to parse the data from request frontend to backend
app.use(express.json())
app.use(cors()) // to access backend from any frontend

//db connection
connectDB();

//api endpoints
app.use("/api/food",foodRouter)
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)



app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});