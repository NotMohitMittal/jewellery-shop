import jwt from "jsonwebtoken";

import { validationResult } from "express-validator";

const validateInput = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

const verifyLoginUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        message: "AccessToken not found",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.log(decoded);
    res.status(401).json({
      message: "Invalid access token",
    });
  }
};

const createAccessToken = async (user) => {
  try {
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    return accessToken;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Unable to create the accessToken",
    });
  }
};

const createRefreshToken = async (user) => {
  try {
    const refreshToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return refreshToken;
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Unable to create the refreshToken",
    });
  }
};

export { createAccessToken, createRefreshToken, validateInput, verifyLoginUser };
