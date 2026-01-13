import express from "express";
import { verifyCookies } from "../middlewares/verify.cookies.js";
import { getAllDashboardController } from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.route("/all").get(verifyCookies, getAllDashboardController);

export default dashboardRouter;