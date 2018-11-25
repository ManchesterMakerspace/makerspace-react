import { combineReducers, Action } from "redux";
import { ThunkDispatch } from "redux-thunk";

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
import { CardState } from "ui/accessCards/interfaces";
import { cardReducer } from "ui/accessCards/actions";
import { InvoiceState } from "ui/invoice/interfaces";
import { invoiceReducer } from "ui/invoice/actions";
import { InvoicesState } from "ui/invoices/interfaces";
import { invoicesReducer } from "ui/invoices/actions";

export type ScopedThunkDispatch = ThunkDispatch<State, {}, Action>

export interface State {
  auth: AuthState;
  members: MembersState;
  member: MemberState;
  rentals: RentalsState;
  billing: BillingState;
  subscriptions: SubscriptionsState;
  checkout: CheckoutState;
  card: CardState;
  invoice: InvoiceState;
  invoices: InvoicesState;
}

export const rootReducer = combineReducers({
  auth: authReducer,
  members: membersReducer,
  member: memberReducer,
  rentals: rentalsReducer,
  billing: billingReducer,
  subscriptions: subscriptionsReducer,
  checkout: checkoutReducer,
  card: cardReducer,
  invoice: invoiceReducer,
  invoices: invoicesReducer,
});
