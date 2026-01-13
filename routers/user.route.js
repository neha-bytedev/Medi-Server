import express from "express";
import { googleAuth, logoutController } from "../controllers/user.controller.js";
import { verifyCookies } from "../middlewares/verify.cookies.js";

const userRouter = express.Router();

userRouter.route("/").get(googleAuth);
userRouter.route("/logout").post(verifyCookies, logoutController);

export default userRouter;