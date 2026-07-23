import { ApiError } from "../../utils/ApiError";

export const existingUserError = () =>
  new ApiError(400, "Email already exists");

export const invaidEmailOrPasswordError = () =>
  new ApiError(401, "Invalid email or password");

export const userNotExistError = () =>
  new ApiError(401, "User no longer exists");

export const somethingWentWrongError = () => 
  new ApiError(401, "something went wrong");
