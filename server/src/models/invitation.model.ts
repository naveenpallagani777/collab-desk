import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "workspace",
        required: true,
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING",
    },
    role: {
        type: String,
        enum: ["ADMIN", "MEMBER"],
        default: "MEMBER",
    },
    inviteUrl: {
        type: String,
        default: "",
    },
}, { timestamps: true });

export default mongoose.model("Invitation", invitationSchema);