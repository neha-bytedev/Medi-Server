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

// Initialize DB connection
connectDb();

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors({
    origin: "https://medilink-theta-two.vercel.app",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Default root route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Medi-Link API Server',
        version: '1.0.0',
        status: 'Running'
    });
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API endpoints
app.use("/api/v1/google", userRouter);
app.use("/api/v1/album", albumRouter);
app.use("/api/v1/image", imageRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless
export default app;