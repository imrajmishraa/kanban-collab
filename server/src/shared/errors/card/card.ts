import { ApiError } from "../../utils/ApiError";

export const cardNotFoundError = () => new ApiError(404, "Card not found");