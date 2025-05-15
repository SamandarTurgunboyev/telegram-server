const BaseError = require("../errors/base.error")
const CONST = require("../lib/constants")
const messageModel = require("../models/message.model")
const userModel = require("../models/user.model")
const mailService = require("../services/mail.service")

class UserController {
    // [Get]
    async getContacts(req, res, next) {
        try {
            const userId = req.user._id
            const contacts = await userModel.findById(userId).populate("contacts")
            const allContacts = contacts.contacts.map(contact => contact.toObject())

            for (const contact of allContacts) {
                const lastMessage = await messageModel
                    .findOne({
                        $or: [
                            { sender: userId, receiver: contact._id },
                            { sender: contact._id, receiver: userId }
                        ]
                    }).populate({ path: "sender" }).populate("receiver").sort({ createdAt: -1 })

                contact.lastMessage = lastMessage
            }

            return res.status(200).json({ contacts: allContacts })

        } catch (error) {
            next(error)
        }
    }

    async getMessage(req, res, next) {
        try {
            const user = req.user._id
            const { contactId } = req.params

            const message = await messageModel.find({
                $or: [
                    { sender: user, receiver: contactId },
                    { sender: contactId, receiver: user }
                ]
            }).populate({ path: "sender", select: "email" }).populate({ path: "receiver", select: "email" })

            await messageModel.updateMany({ sender: contactId, receiver: user, satus: CONST.SENT }, { satus: CONST.READ })

            res.status(200).json({ message })
        } catch (error) {
            next(error)
        }
    }
    // [POST]
    async createMessage(req, res, next) {
        try {
            const userId = req.user._id
            const createdMessage = await messageModel.create({ ...req.body, sender: userId })
            const newMessage = await messageModel
                .findOne(createdMessage._id)
                .populate({ path: "sender" })
                .populate({ path: "receiver" })

            const receiver = await userModel.findById(createdMessage.receiver)
            const sender = await userModel.findById(createdMessage.sender)

            res.status(201).json({ newMessage, receiver, sender })
        } catch (error) {
            next(error)
        }
    }

    async readMessage(req, res, next) {
        try {
            const { messages } = req.body
            const allMessages = []
            for (const message of messages) {
                const updateMessage = await messageModel.findByIdAndUpdate(message._id, { satus: CONST.READ }, { new: true })
                allMessages.push(updateMessage)
            }

            res.status(200).json({ messages: allMessages })
        } catch (error) {
            next(error)
        }
    }

    async createContact(req, res, next) {
        try {
            const userId = req.user._id
            const { email } = req.body

            const user = await userModel.findById(userId)
            const contact = await userModel.findOne({ email })
            if (!contact) throw BaseError.BadRequest("User with this email does not exist")
            if (user.email === contact.email) throw BaseError.BadRequest("You cannot add yourself as a contact")

            const existingcontact = await userModel.findOne({ _id: userId, contacts: contact._id })
            if (existingcontact) throw BaseError.BadRequest("Contact already exists")

            await userModel.findByIdAndUpdate(userId, { $push: { contacts: contact._id } }, { new: true })
            const newContact = await userModel.findByIdAndUpdate(contact._id, { $push: { contacts: userId } })
            console.log(newContact);
            return res.status(201).json({ contacts: newContact })
        } catch (error) {
            next(error)
        }
    }

    async createReaction(req, res, next) {
        try {
            const { messageId, reaction } = req.body
            const updateMessage = await messageModel.findByIdAndUpdate(messageId, { reaction }, { new: true })
            res.status(200).json({ updateMessage })
        } catch (error) {
            next(error)
        }
    }

    async sendOtp(req, res, next) {
        try {
            const { email } = req.body
            const existingUser = await userModel.findOne({ email })
            if (existingUser) throw BaseError.BadRequest("bunday user bor")
            await mailService.sendOtp(email)
            res.status(200).json({ email })
        } catch (error) {
            next(error)
        }
    }
    // [PUT]
    async updateProfile(req, res, next) {
        try {
            const user = req.user
            console.log(user);
            // const { userId, ...payload } = req.body
            await userModel.findByIdAndUpdate(user._id, req.body)
            res.status(201).json({ message: "Profile update successfuly" })
        } catch (error) {
            next(error)
        }
    }

    async updateMessage(req, res, next) {
        try {
            const { messageId } = req.params
            const { text } = req.body
            const updateMessage = await messageModel.findByIdAndUpdate(messageId, { text }, { new: true })
            res.status(200).json({ updateMessage })
        } catch (error) {
            next(error)
        }
    }

    async updateEmail(req, res, next) {
        try {
            const { email, otp } = req.body
            const result = await mailService.verifyOtp(email, otp)
            if (result) {
                const userId = req.user._id
                const user = await userModel.findByIdAndUpdate(userId, { email }, { new: true })
                return res.status(200).json({ user })
            }
        } catch (error) {
            next(error)
        }
    }
    //[Delete]

    async delteMessage(req, res, next) {
        try {
            const { messageId } = req.params
            const deleteMessage = await messageModel.findByIdAndDelete(messageId)
            res.status(200).json({ deleteMessage })
        } catch (error) {

        }
    }

    async delteUser(req, res, next) {
        try {
            const userId = req.user._id
            await userModel.findByIdAndDelete(userId)
            res.status(201).json({ message: "User deleted successfuly" })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController()