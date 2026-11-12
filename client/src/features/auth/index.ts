/**
 * Public API of the `auth` feature.
 *
 * Only what code outside this folder imports. Everything else is internal:
 * use a relative path from inside the feature, and add to this list only
 * when something outside genuinely needs it.
 */
export {
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from "./api/authApi";
export { OAuthButton } from "./components/OAuthButton";
export { PreviewCard } from "./components/PreviewCard";
export { useUnifiedOAuth } from "./hooks/useUnifiedOAuth";
export { AuthBrandPanel } from "./components/AuthBrandPanel";
export { FieldError } from "./components/FieldError";
export { postLoginDestination } from "./utils/postLoginDestination";
export { default as AuthNavbar } from "./components/AuthNavbar";
export { CLEAR, FIELD, MARK, PAD } from "./components/fieldChrome";
export { LoginForm } from "./components/login/LoginForm";
export { RegisterForm } from "./components/register/RegisterForm";
export { ForgotPasswordForm } from "./components/forgot/ForgotPasswordForm";

export {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "./validations/auth.validator";
export type {
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
} from "./validations/auth.validator";
