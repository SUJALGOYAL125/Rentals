// External Module
const express = require("express");
const authRouter = express.Router();

//Local module
const authController = require("../controllers/authController.js");

authRouter.get("/login", authController.getLogin);
authRouter.post("/login",authController.postLogin);
authRouter.post("/logout",authController.postLogout);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup",authController.postSignup);

module.exports = authRouter;
