import { error } from "console";
import { ApiError } from "../../utils/ApiError";

export const existingUserError = () => new
  ApiError(400, "Email already exists");

export const internalServerError = () =>
  new ApiError(500, "Internal Server Error");


export const invaidEmailOrPasswordError = () =>
  new ApiError(401, "Invalid email or password");
