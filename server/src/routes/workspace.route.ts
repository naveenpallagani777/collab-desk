import { Router } from "express";
import workSpaceController from "../controllers/workspace.controller";
import authMiddleware from "../middleware/auth.middleware";
const router = Router();

router.use(authMiddleware({ requireWorkspace: false }));
router.post("/", workSpaceController.create);
router.get("/", workSpaceController.getAll);
router.get("/:id", workSpaceController.getById);
router.get("/:id/members", workSpaceController.members);
router.put("/:id", workSpaceController.update);
router.delete("/:id", workSpaceController.delete);
router.post("/:id/select", workSpaceController.select);

export default router;
