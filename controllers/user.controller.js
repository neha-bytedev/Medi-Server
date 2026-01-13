import axios from "axios";
import { sendCookies } from "../middlewares/send.cookies.js";
import userModel from "../models/user.model.js";
import { oAuth2Client } from "../config/googleOAuth.config.js";
import mongoose from "mongoose";



export const googleAuth = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ success: false, message: "Authorization code missing" });
        }

        // 1. Get token from Google
        const googleRes = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(googleRes.tokens);

        // 2. Get Google user info
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );

        const { email, name, picture } = userRes.data;

        // 3. Check if user exists
        const existingUser = await userModel.findOne({ email });
        let newUser = null;

        // 4. If user doesn't exist, create new
        if (!existingUser) {
            newUser = await userModel.create({ email, name, picture });
        };

        // 5. Choose which user to send
        const userToSend = existingUser || newUser;

        // 6. Send cookie with user._id
        await sendCookies(userToSend._id, res);


        return res.status(existingUser ? 200 : 201)
            .json({
                success: true,
                message: existingUser ? "User logged in" : "User created",
                data: userToSend,
                name: name,
                email: email,
                picture: picture
            });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const logoutController = async (req, res) => {
    try {
        const loggedInUser = req.user._id;

        if (!loggedInUser) {
            return res.status(400).json({ success: false, message: "User not LoggedIn" });
        };

        if (!mongoose.Types.ObjectId.isValid(loggedInUser)) {
            return res.status(400).json({ success: false, message: "Invalid LoggedIn User Id" });
        };

        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({
            success: true,
            message: "Logout successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};


