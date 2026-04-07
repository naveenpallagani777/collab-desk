const mongoose = require('mongoose');

const workspaceMemberSchema = new mongoose.Schema({
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'workspace',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    standardRole: {
        type: String,
        enum: ['OWNER', 'ADMIN', 'MEMBER'],
        default: 'MEMBER',
    },
    displayName: {
        type: String,
        default: ''
    },
    workspaceEmail: {
        type: String,
        default: ''
    },
    profilePictureUrl: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const WorkspaceMemberModel = mongoose.model('workspace-member', workspaceMemberSchema);
export default WorkspaceMemberModel;