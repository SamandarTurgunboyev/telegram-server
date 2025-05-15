const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt");
const otpModel = require("../models/otp.model");
const BaseError = require("../errors/base.error");

class MailServices {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }
    async sendOtp(to) {
        const existingOtp = await otpModel.findOne({ email: to });

        if (existingOtp) {
            const now = new Date();
            const timeLeft = (existingOtp.expireAt - now) / 1000;  // Sekundda qolgan vaqtni hisoblash

            if (timeLeft > 0) {
                const minutes = Math.floor(timeLeft / 60);  // Daqiqani olish
                const seconds = Math.floor(timeLeft % 60); // Sekundani olish

                // 0 bilan to‘ldirish (masalan: 03:09)
                const formattedMinutes = String(minutes).padStart(2, '0');
                const formattedSeconds = String(seconds).padStart(2, '0');

                const timeString = `${formattedMinutes}:${formattedSeconds}`;
                throw new Error(`Siz OTPni ${timeString} dan keyin qayta so'rashingiz mumkin.`);
            }

            await otpModel.deleteOne({ email: to });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log("Generated OTP:", otp);

        const hashOtp = await bcrypt.hash(otp.toString(), 10);
        await otpModel.create({
            email: to,
            otp: hashOtp,
            expireAt: new Date(Date.now() + 5 * 60 * 1000)
        });

        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: `OTP for verification - ${new Date().toLocaleString()}`,
            html: `<h1>Your OTP is ${otp}</h1><p>It will expire in 5 minutes.</p>`
        });
    }

    async verifyOtp(email, otp) {
        const otpData = await otpModel.find({ email })
        if (!otpData) throw BaseError.BadRequest("Otp not found")
        const currentOtp = otpData[otpData.length - 1]
        if (!currentOtp) throw BaseError.BadRequest("Otp not found")

        if (currentOtp.expireAt < new Date()) {
            throw BaseError.BadRequest("You otp is expired")
        }
        const isValid = await bcrypt.compare(otp.toString(), currentOtp.otp)
        if (!isValid) throw BaseError.BadRequest("Invalid otp entered")

        await otpModel.deleteMany({ email })
        return true
    }
}

module.exports = new MailServices()