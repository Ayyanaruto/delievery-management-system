import { CallbackError, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

import { IUser } from "./auth.types";
import { ROLE, VALIDATION_ERROR_MESSAGE } from "@/constants/constant";
import { validateEmail } from "@/lib/validateEmail";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, VALIDATION_ERROR_MESSAGE.REQUIRED_NAME],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, VALIDATION_ERROR_MESSAGE.REQUIRED_EMAIL],
      validate: [validateEmail, VALIDATION_ERROR_MESSAGE.INVALID_EMAIL],
      index: true,
    },
    password: {
      type: String,
      required: [true, VALIDATION_ERROR_MESSAGE.REQUIRED_PASSWORD],
      minlength: [6, VALIDATION_ERROR_MESSAGE.INVALID_PASSWORD],
    },
    role: {
      type: String,
      enum: [ROLE.ADMIN, ROLE.PARTNER],
      required: true,
      default: ROLE.PARTNER,
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: "Partner",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(String(this.password), saltRounds);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>("User", userSchema);
