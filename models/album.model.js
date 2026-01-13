import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const albumSchema = new mongoose.Schema({
    albumId: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sharedUsers: [
        {
            type: String,
        }
    ]
}, { timestamps: true });

export default mongoose.model("Album", albumSchema);