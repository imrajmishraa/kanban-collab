import { ApiError } from "../../utils/ApiError";

export const internalServerError = () =>
  new ApiError(500, "Internal Server Error");

