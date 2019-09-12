import { combineReducers, Action, AnyAction } from "redux";
import { History } from "history";
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import { connectRouter, RouterState } from 'connected-react-router';

import { AuthState } from "ui/auth/interfaces";
import { authReducer } from "ui/auth/actions";
import { membersReducer } from "ui/members/actions";
import { MembersState } from "ui/members/interfaces";
import { RentalsState } from "ui/rentals/interfaces";
import { rentalsReducer } from "ui/rentals/actions";
import { BillingState } from "ui/billing/interfaces";
import { billingReducer } from "ui/billing/actions";
import { SubscriptionsState } from "ui/subscriptions/interfaces";
import { subscriptionsReducer } from "ui/subscriptions/actions";
import { MemberState } from "ui/member/interfaces";
import { memberReducer } from "ui/member/actions";
import { CheckoutState } from "ui/checkout/interfaces";
import { checkoutReducer } from "ui/checkout/actions";
import { EarnedMembershipsState } from "ui/earnedMemberships/interfaces";
import { earnedMembershipsReducer } from "ui/earnedMemberships/actions";
import { ReportsState } from "ui/reports/interfaces";
import { reportsReducer } from "ui/reports/actions";
import { TransactionsState } from "ui/transactions/interfaces";
import { transactionsReducer } from "ui/transactions/actions";
import { RequestStatus } from "app/interfaces";
import { ApiErrorResponse, ApiDataResponse } from "makerspace-ts-api-client";

export type ScopedThunkDispatch = ThunkDispatch<State, {}, Action>
export type ScopedThunkAction<T> = ThunkAction<T, State, {}, AnyAction>;

export interface State  {
  router: RouterState;
  base: { [key: string]: Transaction<any> }
  auth: AuthState;
  members: MembersState;
  member: MemberState;
  rentals: RentalsState;
  billing: BillingState;
  subscriptions: SubscriptionsState;
  checkout: CheckoutState;
  earnedMemberships: EarnedMembershipsState;
  reports: ReportsState;
  transactions: TransactionsState;
}

export const getRootReducer = (history: History) => combineReducers({
  router: connectRouter(history),
  base: baseReducer,
  auth: authReducer,
  members: membersReducer,
  member: memberReducer,
  rentals: rentalsReducer,
  billing: billingReducer,
  subscriptions: subscriptionsReducer,
  checkout: checkoutReducer,
  earnedMemberships: earnedMembershipsReducer,
  reports: reportsReducer,
  transactions: transactionsReducer,
});

export type Transaction<T> = RequestStatus & {
  data: T;
  response: ApiErrorResponse | ApiDataResponse<T>;
}
export interface ReducerAction<T> {
  type: string;
  key: string;
  data?: T;
  response?: ApiErrorResponse | ApiDataResponse<T>;
  error?: ApiErrorResponse;
}

export enum TransactionAction {
  Start = "start",
  Success = "success",
  Failure = "failure",
}

const baseReducer = <T>(state: { [key: string]: Transaction<T> } = {}, action: AnyAction) => {
  let key;
  switch (action.type) {
    case TransactionAction.Start:
      key = action.key;

      return {
        ...state,
        [key]: {
          ...state[key],
          isRequesting: true,
        }
      };

    case TransactionAction.Success:
      const { data, response } = action;
      key = action.key;
      return {
        ...state,
        [key]: {
          ...state[key],
          data,
          response,
          isRequesting: false,
          error: undefined,
        }
      };

    case TransactionAction.Failure:
      const { error } = action;
      key = action.key;

      return {
        ...state,
        [key]: {
          ...state[key],
          error,
          isRequesting: false,
        }
      };
    default:
      return state;
  }
}