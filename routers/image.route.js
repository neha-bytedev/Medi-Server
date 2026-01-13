import express from "express";
import { verifyCookies } from "../middlewares/verify.cookies.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createImageMiddleware } from "../middlewares/image.middleware.js";
import {
    addImagesController,
    getAllImagesController,
    getAllImagesByAlbumController,
    getASingleImageController,
    deleteImageController,
    toggleFavoriteController
} from "../controllers/image.controller.js";

const imageRouter = express.Router();

// Add Images
imageRouter.post("/add/:id", verifyCookies, upload.array("images", 20), createImageMiddleware, addImagesController);

// Fetch all images
imageRouter.get("/all", verifyCookies, getAllImagesController);

// Fetch images inside an album
imageRouter.get("/album/:id", verifyCookies, getAllImagesByAlbumController);

// Fetch single image
imageRouter.get("/single/:albumId/:imageId", verifyCookies, getASingleImageController);

// Delete image
imageRouter.delete("/delete/:albumId/:imageId", verifyCookies, deleteImageController);

// Toggle favorite
imageRouter.put("/favorite/:albumId/:imageId", verifyCookies, toggleFavoriteController);

export default imageRouter;
