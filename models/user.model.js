const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    isVerifed: { type: Boolean, default: false },
    firstName: { type: String, },
    lastName: { type: String, },
    bio: { type: String },
    avatar: { type: String },
    muted: { type: Boolean, default: false },
    notificationSound: { type: String, default: 'notification.mp3' },
    sendingSound: { type: String, default: "sending.mp3" },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)