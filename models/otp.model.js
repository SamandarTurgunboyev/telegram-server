const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, require: true },
    expireAt: { type: Date }
})

module.exports = mongoose.model("Otp", otpSchema)