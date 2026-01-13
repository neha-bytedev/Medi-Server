import mongoose from "mongoose";
import userModel from "../models/user.model.js";
import albumModel from "../models/album.model.js";
import imageModel from "../models/image.model.js";

export const getAllDashboardController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not Logged In" });
        }

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid Logged In User Id" });
        }

        const userExist = await userModel.findById(loggedInUser);
        if (!userExist) {
            return res.status(400).json({ success: false, message: "User does not exist" });
        }

        // Total albums
        const albumsCount = await albumModel.countDocuments({ ownerId: loggedInUser });

        // Total images (inside images array)
        const imagesCountAgg = await imageModel.aggregate([
            { $match: { uploadedBy: new mongoose.Types.ObjectId(loggedInUser) } },
            { $unwind: "$images" },
            { $count: "totalImages" }
        ]);

        const imagesCount = imagesCountAgg[0]?.totalImages || 0;

        // Total favorite images
        const allFavImagesCountAgg = await imageModel.aggregate([
            { $match: { uploadedBy: new mongoose.Types.ObjectId(loggedInUser) } },
            { $unwind: "$images" },
            { $match: { "images.isFavorite": true } },
            { $count: "favCount" }
        ]);
        const allFavImagesCount = allFavImagesCountAgg[0]?.favCount || 0;

        // Total size in MB
        const totalSizeAgg = await imageModel.aggregate([
            { $match: { uploadedBy: new mongoose.Types.ObjectId(loggedInUser) } },
            { $unwind: "$images" },
            { $group: { _id: null, totalSize: { $sum: "$images.size" } } }
        ]);
        const totalSizeOfImage = (((totalSizeAgg[0]?.totalSize) || 0) / 1024 / 1024).toFixed(2);

        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            albumsCount,
            imagesCount,
            allFavImagesCount,
            totalSizeOfImage
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
