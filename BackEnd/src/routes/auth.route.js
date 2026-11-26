import express from "express";
import { body } from "express-validator";

import { loginUser, logoutUser, registerUser, rotateTokens } from "../controllers/auth.controller.js";
import { validateInput, verifyLoginUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

// REGISTER
router.post(
  "/register",
  [
    body("user_name").notEmpty().withMessage("User name is required"),
    body("user_email")
      .notEmpty()
      .withMessage("User name is required")
      .isEmail()
      .withMessage("Please enter a valid Email-Id"),
    body("user_password").notEmpty().withMessage("User Password is required"),
  ],
  validateInput,
  registerUser,
);

// LOGIN
router.post(
  "/login",
  [
    body("user_email")
      .notEmpty()
      .withMessage("User e-mail is required")
      .isEmail()
      .withMessage("Enter a valid e-mail ID"),
    body("user_password").notEmpty().withMessage("User password is required"),
  ],
  validateInput,
  loginUser,
);

// LOGOUT
router.post("/logout", logoutUser);

router.post("/rotateToken", verifyLoginUser, rotateTokens);

export default router;
