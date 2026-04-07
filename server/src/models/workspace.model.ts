import { is } from "zod/v4/locales";

const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    logoUrl: {
        type: String,
        default: ''
    },
    bannerUrl: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    location: {
        addressLine1: {
            type: String,
            default: ""
        },
        addressLine2: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: ""
        },
        postalCode: {
            type: String,
            default: ""
        },
        coordinates: {
            lat: Number,
            lng: Number
        },
        timezone: {
            type: String,
            default: ""
        }
    }
}, { timestamps: true });

const WorkSpaceModel = mongoose.model('workspace', workspaceSchema);
export default WorkSpaceModel;