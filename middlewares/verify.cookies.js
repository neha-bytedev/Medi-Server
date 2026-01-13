import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyCookies = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(403).json({ success: false, message: "Unauthorized User" })
        };

        const decode = jwt.verify(token, process.env.JWT_TOKEN);

        if (!decode) {
            return res.status(403).json({ success: false, message: "JWT Verification Failed" });
        };

        const user = await userModel.findById(decode.userId);

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found, wrong token" });
        };

        req.user = user;

        next();

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    };
};