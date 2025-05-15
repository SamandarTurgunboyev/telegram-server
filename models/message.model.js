const mongoose = require("mongoose")
const CONST = require("../lib/constants")

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    image: { type: String },
    satus: { type: String, enum: [CONST.SENT, CONST.DELIVERED, CONST.READ], default: CONST.SENT },
    reaction: { type: String }
}, { timestamps: true })

module.exports = mongoose.model("Message", messageSchema)