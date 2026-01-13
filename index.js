import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db.config.js";
import userRouter from "./routers/user.route.js";
import albumRouter from "./routers/album.route.js";
import imageRouter from "./routers/image.route.js";
import dashboardRouter from "./routers/dashboard.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 9500;

connectDb();

app.use(cookieParser());

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// api end points
app.use("/api/v1/google", userRouter);
app.use("/api/v1/album", albumRouter);
app.use("/api/v1/image", imageRouter);
app.use("/api/v1/dashboard", dashboardRouter);


// server started 
app.listen(PORT, () => {
    console.log(`server started on http://localhost:${PORT}`);
});