import albumModel from "../models/album.model.js";
import userModel from "../models/user.model.js";
import imageModel from "../models/image.model.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config.js";

// POST - create album
export const createAlbumController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const { name, description, sharedUsers } = req.body;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not LoggedIn" });
        };

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid LoggedIn User Id" });
        };

        const userExist = await userModel.findById(loggedInUser);

        if (!userExist) {
            return res.status(400).json({ success: false, message: "User not Exist" });
        };

        const newAlbum = new albumModel({
            name,
            description,
            ownerId: loggedInUser,
            sharedUsers
        });

        const savedAlbum = await newAlbum.save();

        return res.status(201).json({ success: true, message: "Album Created Successfully", data: savedAlbum });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

// GET - get all album
export const getAllAlbumController = async (req, res) => {
    try {

        const loggedInUser = req.user._id;

        const { name } = req.query;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not LoggedIn" });
        };

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid LoggedIn User Id" });
        };

        const userExist = await userModel.findById(loggedInUser);

        if (!userExist) {
            return res.status(400).json({ success: false, message: "User not Exist" });
        };

        const filter = { ownerId: loggedInUser };

        if (name) {
            filter.name = { $regex: name, $options: "i" };
        };

        const allAlbum = await albumModel.find(filter);

        if (!allAlbum || allAlbum.length === 0) {
            return res.status(400).json({ success: false, message: "No Album Available" });
        };

        return res.status(200).json({ success: true, message: "Album find Successfully", data: allAlbum });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

// PUT - update the album description
export const updateAlbumDescriptionController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const { id } = req.params;

        const { description } = req.body;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not LoggedIn" });
        };

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid LoggedIn User Id" });
        };

        if (!id) {
            return res.status(400).json({ success: false, message: "Album Id is missing" });
        };;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Album Id" });
        };

        const userExist = await userModel.findById(loggedInUser);

        if (!userExist) {
            return res.status(400).json({ success: false, message: "User not Exist" });
        };

        const albumExist = await albumModel.findById(id);

        if (!albumExist) {
            return res.status(400).json({ success: false, message: "Album not Exist" });
        };

        if (loggedInUser.toString() !== albumExist.ownerId.toString()) {
            return res.status(400).json({ success: false, message: "User can't delete Other User Album" });
        };

        const updateAlbumDes = await albumModel.findByIdAndUpdate(id, { description }, { new: true });

        if (!updateAlbumDes) {
            return res.status(400).json({ success: false, message: "Error Occured While Updating the Album Description" });
        };

        return res.status(200).json({ success: true, message: "Album Description Updated Successfully", data: updateAlbumDes });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

// DELETE - delete the album and also delete the images from cloudinary and database
export const deleteAlbumController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const { id } = req.params;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not LoggedIn" });
        };

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid LoggedIn User Id" });
        };

        if (!id) {
            return res.status(400).json({ success: false, message: "Album Id is missing" });
        };;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Album Id" });
        };

        const userExist = await userModel.findById(loggedInUser);

        if (!userExist) {
            return res.status(400).json({ success: false, message: "User not Exist" });
        };

        const albumExist = await albumModel.findById(id);

        if (!albumExist) {
            return res.status(400).json({ success: false, message: "Album not Exist" });
        };

        if (loggedInUser.toString() !== albumExist.ownerId.toString()) {
            return res.status(400).json({ success: false, message: "User can't delete Other User Album" });
        };

        const imagesExist = await imageModel.find({ albumId: albumExist._id });

        for (let imageDoc of imagesExist) {
            for (let img of imageDoc.images) {
                if (img.image_id) {
                    try {
                        await cloudinary.uploader.destroy(img.image_id);
                    } catch (error) {
                        return res.status(400).json({ success: false, message: "Error Occured While deleting the images" });
                    };
                };
            };
        };

        const deleteAlbumImages = await imageModel.deleteMany({ albumId: albumExist._id });

        if (!deleteAlbumImages) {
            return res.status(400).json({ success: false, message: "Error Occured While Deleting the Images from Album" });
        };

        const deleteAlbum = await albumModel.findByIdAndDelete(id);

        if (!deleteAlbum) {
            return res.status(400).json({ success: false, message: "Error Occured While deleting the Album" });
        };

        return res.status(200).json({ success: true, message: "Album Delete Successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

// in this user can add person never remove this person
// PUT - update the shared album
export const addOrUpdateShareUsersToAlbumController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        const { id } = req.params;

        const { sharedUsers } = req.body;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not LoggedIn" });
        };

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid LoggedIn User Id" });
        };

        if (!id) {
            return res.status(400).json({ success: false, message: "Album Id is missing" });
        };;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Album Id" });
        };

        const userExist = await userModel.findById(loggedInUser);

        if (!userExist) {
            return res.status(400).json({ success: false, message: "User not Exist" });
        };

        const albumExist = await albumModel.findById(id);

        if (!albumExist) {
            return res.status(400).json({ success: false, message: "Album not Exist" });
        };

        if (loggedInUser.toString() !== albumExist.ownerId.toString()) {
            return res.status(400).json({ success: false, message: "User can't delete Other User Album" });
        };

        const updatedAlbumShare = await albumModel.findByIdAndUpdate(
            id,
            {
                $addToSet: {
                    sharedUsers: { $each: sharedUsers }
                }
            },
            { new: true }
        );;

        if (!updatedAlbumShare) {
            return res.status(400).json({ success: false, message: "Error Occured While Adding the Shared Users" });
        };

        return res.status(200).json({ success: true, message: "Shared Users Added Successfully", data: updatedAlbumShare });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

// GET - get all the shared album
export const getSharedAlbumModelController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not LoggedIn" });
        };

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid LoggedIn User Id" });
        };

        const userExist = await userModel.findById(loggedInUser);

        if (!userExist) {
            return res.status(400).json({ success: false, message: "User not Exist" });
        };

        const allShareAlbums = await albumModel.find({ sharedUsers: userExist.email });

        if (!allShareAlbums || allShareAlbums.length === 0) {
            return res.status(400).json({ success: false, message: "No Shared Albums Exist" });
        };

        return res.status(200).json({ success: true, message: "Shared Albums find Successfully", data: allShareAlbums });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};

// delete - the user from shared albums


// GET - all shared albums image