const authController = require("../controllers/auth.controller")
const userController = require("../controllers/user.controller")
const authMiddlewares = require("../middlewares/auth.middlewares")

const router = require("express").Router()

//auth router group start

router.post("/auth/login/", authController.login)
router.post("/auth/verify/", authController.verify)

//auth router group end 

//user router groud start

//get
router.get("/user/contacts/", authMiddlewares, userController.getContacts)
router.get("/user/message/:contactId/", authMiddlewares, userController.getMessage)
//post  
router.post("/user/create-message/", authMiddlewares, userController.createMessage)
router.post("/user/read-message/", authMiddlewares, userController.readMessage)
router.post("/user/create-contact/", authMiddlewares, userController.createContact)
router.post("/user/reaction/", authMiddlewares, userController.createReaction)
router.post("/user/send-otp/", authMiddlewares, userController.sendOtp)
//put
router.put("/user/message/:messageId", authMiddlewares, userController.updateMessage)
router.put("/user/profile/", authMiddlewares, userController.updateProfile)
router.put("/user/email/", authMiddlewares, userController.updateEmail)
//detele
router.delete("/user/message/:messageId", authMiddlewares, userController.delteMessage)
router.delete("/user/", authMiddlewares, userController.delteUser)

//user router groud end

module.exports = router