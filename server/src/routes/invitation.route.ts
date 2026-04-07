import { Router } from "express";
import invitationController from "../controllers/invitation.controller";
import authMiddleware from "../middleware/auth.middleware";

const route = Router();

route.post("/accept", authMiddleware({ requireWorkspace: false }), invitationController.accept);

route.use(authMiddleware({ requireWorkspace: true }));

route.post("/", invitationController.create);
route.get("/", invitationController.getAll);
route.get("/:id", invitationController.getById);
route.patch("/:id", invitationController.update);
route.delete("/:id", invitationController.delete);

export default route;