import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";
import imageModel from "../models/image.model.js";
import albumModel from "../models/album.model.js";
import userModel from "../models/user.model.js";

// 1️⃣ Add Images
export const addImagesController = async (req, res) => {
    try {
        const { name, tags, people } = req.body;
        const { id: albumId } = req.params;
        const loggedInUser = req.user._id;
        const files = req.files;

        if (!files || !files.length) {
            return res.status(400).json({ success: false, message: "No images uploaded" });
        }

        const albumExist = await albumModel.findById(albumId);
        if (!albumExist)
            return res.status(404).json({ success: false, message: "Album not found" });

        if (albumExist.ownerId.toString() !== loggedInUser.toString()) {
            return res.status(403).json({ success: false, message: "Not allowed to upload images in this album" });
        }

        const imagesArray = files.map(file => ({
            name: name || file.originalname,
            url: file.path,
            cloudinaryId: file.filename,
            tags: tags || [],
            people: people || [],
            size: file.size
        }));

        // Check if Image document already exists for this album
        let imageDoc = await imageModel.findOne({ albumId, uploadedBy: loggedInUser });

        if (imageDoc) {
            // Append new images to existing document
            imageDoc.images.push(...imagesArray);
        } else {
            // Create new document if not exists
            imageDoc = new imageModel({
                albumId,
                uploadedBy: loggedInUser,
                images: imagesArray
            });
        }

        const savedImages = await imageDoc.save();
        res.status(201).json({ success: true, message: "Images uploaded successfully", data: savedImages });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


// 2️⃣ Fetch all images for a user
export const getAllImagesController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const allImages = await imageModel.find({ uploadedBy: loggedInUser }).populate("albumId");
        res.status(200).json({ success: true, message: "Images fetched successfully", data: allImages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// 3️⃣ Fetch all images inside an album
export const getAllImagesByAlbumController = async (req, res) => {
    try {
        const { id: albumId } = req.params;
        const loggedInUser = req.user._id;

        const albumExist = await albumModel.findById(albumId);
        if (!albumExist) return res.status(404).json({ success: false, message: "Album not found" });
        if (albumExist.ownerId.toString() !== loggedInUser.toString()) {
            return res.status(403).json({ success: false, message: "Cannot access this album" });
        }

        const images = await imageModel.find({ albumId, uploadedBy: loggedInUser }).populate("albumId");

        if (!images || images.length === 0) {
            return res.status(400).json({ success: false, message: "Images not fount" });
        };

        res.status(200).json({ success: true, message: "Images fetched successfully", data: images });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// 4️⃣ Fetch a single image
export const getASingleImageController = async (req, res) => {
    try {
        const { albumId, imageId } = req.params;
        const loggedInUser = req.user._id;

        const album = await imageModel.findOne({ albumId, uploadedBy: loggedInUser });
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        const image = album.images.find(img => img._id.toString() === imageId);
        if (!image) return res.status(404).json({ success: false, message: "Image not found" });

        res.status(200).json({ success: true, message: "Image fetched successfully", data: image });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// 5️⃣ Delete an image
export const deleteImageController = async (req, res) => {
    try {
        const { albumId, imageId } = req.params;
        const loggedInUser = req.user._id;

        const album = await imageModel.findOne({ albumId, uploadedBy: loggedInUser });
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        const imageIndex = album.images.findIndex(img => img._id.toString() === imageId);
        if (imageIndex === -1) return res.status(404).json({ success: false, message: "Image not found" });

        const [imageToDelete] = album.images.splice(imageIndex, 1);
        await cloudinary.uploader.destroy(imageToDelete.cloudinaryId);

        await album.save();
        res.status(200).json({ success: true, message: "Image deleted successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

// 6️⃣ Toggle favorite
export const toggleFavoriteController = async (req, res) => {
    try {
        const { albumId, imageId } = req.params;
        const loggedInUser = req.user._id;

        const album = await imageModel.findOne({ albumId, uploadedBy: loggedInUser });
        if (!album) return res.status(404).json({ success: false, message: "Album not found" });

        const image = album.images.find(img => img._id.toString() === imageId);
        if (!image) return res.status(404).json({ success: false, message: "Image not found" });

        image.isFavorite = !image.isFavorite;
        await album.save();

        res.status(200).json({ success: true, message: `Image ${image.isFavorite ? "added to" : "removed from"} favorites`, data: image });

    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
