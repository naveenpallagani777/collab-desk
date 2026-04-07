import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sessionId: {
        type: String,
        required: true
    },

    ipAddress: {
        type: String,
    },

    userAgent: {
        type: String,
    },

    device: {
        type: String,
    },

    location: {
        country: {
            type: String,
        },
        region: {
            type: String,
        },
        city: {
            type: String,
        }
    },

    loginStatus: {
        type: String,
        enum: ["SUCCESS", "FAILED"],
        default: "SUCCESS"
    },

    loginTime: {
        type: Date,
        default: Date.now
    },

    logoutTime: {
        type: Date
    }

}, { timestamps: true });

export default mongoose.model("login-history", loginHistorySchema);