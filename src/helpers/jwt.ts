import jwt from "jsonwebtoken";

export interface SerializedUser {
  userId: string;
  userEmail: string;
  isAdmin:boolean;
}

type UserDocument = any;

export const serializeUser = (user: UserDocument): SerializedUser => {
  return { userId: user._id, userEmail: user.email , isAdmin: user.isAdmin};
};

export const genAccessToken = (user: UserDocument | SerializedUser) => {
  const userToken = !user.hasOwnProperty("userId")
    ? serializeUser(user as UserDocument)
    : {
        userId: (user as SerializedUser).userId,
        userEmail: (user as SerializedUser).userEmail,
        isAdmin: (user as SerializedUser).isAdmin,

      };
  if (!process.env.JWT_ACCESS_SECRET) {
    console.log("JWT_ACCESS_SECRET not found");
    throw new Error("JWT_ACCESS_SECRET not found");
  }
  return jwt.sign(userToken, process.env.JWT_ACCESS_SECRET, {
    // expiresIn: "15m", 
  });
};

export const genRefreshToken = (user: UserDocument | SerializedUser) => {
  const userToken = !user.hasOwnProperty("userId")
    ? serializeUser(user as UserDocument)
    : {
        userId: (user as SerializedUser).userId,
        userEmail: (user as SerializedUser).userEmail,
        isAdmin: (user as SerializedUser).isAdmin,
      };
  if (!process.env.JWT_REFRESH_SECRET) {
    console.log("JWT_REFRESH_SECRET not found");
    throw new Error("JWT_REFRESH_SECRET not found");
  }
  return jwt.sign(userToken, process.env.JWT_REFRESH_SECRET, {
    // expiresIn: "7d", 
  });
};

export const verifyAccessToken = (token: string): SerializedUser => {
  if (!process.env.JWT_ACCESS_SECRET) {
    console.log("JWT_ACCESS_SECRET not found");
    throw new Error("JWT_ACCESS_SECRET not found");
  }
  try {
    const deserializedUser = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET
    ) as SerializedUser;
    return deserializedUser;
  } catch (error) {
    throw new Error("Invalid access token");
  }
};


export default {
  serializeUser,
  genAccessToken,
  genRefreshToken,
  verifyAccessToken
};
