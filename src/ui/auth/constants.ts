import { emailValid } from "app/utils";
import isString from "lodash-es/isString";
import { FormFields } from "ui/common/Form";

export enum Action {
  StartAuthRequest = "AUTH/START_REQUEST",
  AuthUserSuccess = "AUTH/LOGIN_SUCCESS",
  AuthUserFailure = "AUTH/LOGIN_FAILURE",
  LogoutSuccess = "AUTH/LOGOUT",
}

export const EmailExistsError = "Email is already taken";

export const loginPrefix = "login-modal";
export const LoginFields: FormFields = {
  email: {
    label: "Email",
    name: `${loginPrefix}-email`,
    placeholder: "Enter email",
    error: "Invalid email",
    validate: (val: string) => emailValid(val)
  },
  password: {
    label: "Password",
    name: `${loginPrefix}-password`,
    placeholder: "Enter Password",
    error: "Invalid password",
    validate: (val) => !!val
  }
}

export const signUpPrefix = "sign-up-form";
export const SignUpFields: FormFields = {
  firstname: {
    label: "First Name",
    name: `${signUpPrefix}-firstname`,
    placeholder: "Enter first name",
    validate: (val) => !!val,
    error: "Invalid first name",
  },
  lastname: {
    label: "Last Name",
    name: `${signUpPrefix}-lastname`,
    placeholder: "Enter last name",
    validate: (val) => !!val,
    error: "Invalid last name"
  },
  email: {
    label: "Email",
    name: `${signUpPrefix}-email`,
    placeholder: "Enter email",
    validate: (val: string) => val && emailValid(val),
    error: "Invalid email"
  },
  password: {
    label: "Password",
    name: `${signUpPrefix}-password`,
    placeholder: "Enter password",
    validate: (val) => isString(val) && val.length > 7,
    error: "Password must be 8 characters minimum"
  },
  membershipSelectionId: {
    label: "Membership Option",
    name: `${signUpPrefix}-membership-id`,
    placeholder: "Select a Membership Option",
    error: "Please select a membership option",
  },
  discount: {
    label: "Apply 10% Student, Senior and Military discount (ID required at orientation)",
    name: `${signUpPrefix}-discount`,
  },
}