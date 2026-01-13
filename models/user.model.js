import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";


const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    picture: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);