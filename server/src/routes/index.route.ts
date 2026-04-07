import { Router } from "express";
import auth from "./auth.route";
import invitation from "./invitation.route";
import workspace from "./workspace.route";

const router = Router();

router.use("/auth", auth);
router.use("/invitation", invitation);
router.use("/workspace", workspace);

export default router;