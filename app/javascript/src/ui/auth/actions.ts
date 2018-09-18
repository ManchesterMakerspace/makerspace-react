import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";

import isUndefined from "lodash-es/isUndefined";

import { AuthState, AuthForm, SignUpForm } from "ui/auth/interfaces";
import { postLogin, deleteLogin, postSignUp } from "api/auth/transactions";
import { Action as AuthAction } from "ui/auth/constants";
import { InvoiceableResource } from "app/entities/invoice";
import { Action as InvoiceAction } from "ui/invoice/constants";

export const loginUserAction = (
  loginForm?: AuthForm
): ThunkAction<Promise<void>, {}, {}, AnyAction>  => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  let member;
  try {
    const response = await postLogin(loginForm);
    member = response.data.member;
    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: member
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: AuthAction.AuthUserFailure,
      error: errorMessage
    });
  }
}

// Only used when initializing app
// Used to attempt login from session cookies
export const activeSessionLogin = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });

  try {
    const response = await postLogin();
    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: response.data.member
    });
  } catch {
    dispatch({ type: AuthAction.AuthUserFailure })
  }
}

export const logoutUserAction = (
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: AuthAction.StartAuthRequest });
  try {
    await deleteLogin();
  } catch {}
  dispatch({ type: AuthAction.LogoutSuccess });
}

export const submitSignUpAction = (
  signUpForm: SignUpForm
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  const { membershipId, discount, ...rest } = signUpForm;

  dispatch({ type: AuthAction.StartAuthRequest });
  try {
    const response = await postSignUp(rest);
    dispatch({
      type: AuthAction.AuthUserSuccess,
      data: response.data
    });
    if (!isUndefined(membershipId)) {
      dispatch({ type: InvoiceAction.ResetStagedInvoice });
      dispatch({
        type: InvoiceAction.StageInvoice,
        data: {
          invoiceId: membershipId,
          type: InvoiceableResource.Membership,
          discount
        }
      });
    }
  } catch(e) {
    const { errorMessage } = e;
    dispatch({
      type: AuthAction.AuthUserFailure,
      error: errorMessage
    })
  }
}

const defaultState: AuthState = {
  currentUser: {
    id: undefined,
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    expirationTime: undefined,
    role: undefined,
  },
  isRequesting: false,
  error: ""
}

export const authReducer = (state: AuthState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case AuthAction.StartAuthRequest:
      return {
        ...state,
        isRequesting: true
      };
    case AuthAction.AuthUserSuccess:
      const { data: newUser } = action;
      return {
        ...state,
        currentUser: newUser,
        isRequesting: false,
        error: ""
      };
    case AuthAction.AuthUserFailure:
      const { error } = action;
      return {
        ...state,
        isRequesting: false,
        error
      }
    case AuthAction.LogoutSuccess:
      return {
        ...defaultState
      }
    default:
      return state;
  }
}