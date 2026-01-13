import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const imageSchema = new mongoose.Schema({
    imageId: {
        type: String,
        default: uuidv4,
        unique: true
    },
    albumId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    images: [
        {
            name: { type: String, required: true },
            url: { type: String, required: true },
            cloudinaryId: { type: String, required: true },
            tags: [String],
            people: [String],
            size: Number,
            isFavorite: { type: Boolean, default: false },
            uploadedAt: { type: Date, default: Date.now }
        }
    ],
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            text: { type: String, required: true }
        }
    ]
}, { timestamps: true });

export default mongoose.model("Image", imageSchema);
