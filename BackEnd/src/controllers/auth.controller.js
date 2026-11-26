import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

import { createAccessToken, createRefreshToken } from "../middlewares/auth.middleware.js";

// OBJECT HOLDING THE OPTIONS FOR THE COOKIES
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// REGISTER-CONTROLLER
const registerUser = async (req, res) => {
  try {
    const { user_name, user_email, user_password } = req.body;

    const existingUser = await userModel.findOne({ user_email });

    if (existingUser) {
      return res.status(409).json({
        message: "Existing User",
      });
    }

    const user = await userModel.create({
      user_name,
      user_password,
      user_email,
    });

    if (!user) {
      return res.status(500).json({
        message: "Unable to create the user",
      });
    }

    res.status(201).json({
      message: "User registered",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to register a new user",
    });
  }
};

// LOGIN-CONTROLLER
const loginUser = async (req, res) => {
  try {
    const { user_email, user_password } = req.body;

    const user = await userModel.findOne({ user_email }).select("+user_password");

    if (!user) {
      return res.status(404).json({
        message: "User not registered",
      });
    }

    const validUser = await user.comparePassword(user_password);

    if (!validUser) {
      return res.status(401).json({
        message: "Invalid Email or password",
      });
    }

    // removing the password from the user instance of the DB
    user.user_password = undefined;

    // create the json token for the user here
    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unable to login user",
    });
  }
};

// LOGOUT-CONTROLLER
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Unable to logout user",
    });
  }
};


// TOKENS-ROTATE-CONTROLLER
const rotateTokens = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = await createAccessToken({
      _id: decoded.id,
      role: decoded.role,
    });

    const newRefreshToken = await createRefreshToken({
      _id: decoded.id,
      role: decoded.role,
    });

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Tokens refreshed",
    });
  } catch (error) {
    // this will be hit when the jwt.verify() won't be able to find the valid refreshToken it throws error
    console.log(error);
    res.status(401).json({
      message: "Invalid Refresh-Token",
    });
  }
};

export { registerUser, loginUser, logoutUser, rotateTokens };
