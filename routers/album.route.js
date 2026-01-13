import express from "express";
import { verifyCookies } from "../middlewares/verify.cookies.js";
import { createAlbumMiddleware, updateAlbumDescriptionMiddleware, updateTheSharedAlbumMiddleware } from "../middlewares/album.middleware.js";
import { addOrUpdateShareUsersToAlbumController, createAlbumController, deleteAlbumController, getAllAlbumController, getSharedAlbumModelController, updateAlbumDescriptionController } from "../controllers/album.controller.js";
import { getAllImagesByAlbumController } from "../controllers/image.controller.js";


const albumRouter = express.Router();


albumRouter.route("/add").post(verifyCookies, createAlbumMiddleware, createAlbumController);
albumRouter.route("/all").get(verifyCookies, getAllAlbumController);
albumRouter.route("/update-description/:id").put(verifyCookies, updateAlbumDescriptionMiddleware, updateAlbumDescriptionController);
albumRouter.route("/delete-album/:id").delete(verifyCookies, deleteAlbumController);
albumRouter.route("/update-shared-albums/:id").put(verifyCookies, updateTheSharedAlbumMiddleware, addOrUpdateShareUsersToAlbumController);
albumRouter.route("/shared-albums").get(verifyCookies, getSharedAlbumModelController);
// all images inside album access
albumRouter.route("/:id/all-image").get(verifyCookies, getAllImagesByAlbumController);


export default albumRouter;