export namespace Url {
  export enum PathPlaceholder {
    MemberId = "{memberId}",
    RentalId = "{rentalId}",
    Email = "{email}",
    CardId = "{cardId}",
    InvoiceId = "{invoiceId}",
    SubscriptionId = "{subscriptionId}",
    TransactionId = "{transactionId}",
    PaymentMethodId = "{paymentMethodId}",
    MembershipId = "{membershipId}",
  }

  const baseApiPath = "api";
  const baseAdminPath = `${baseApiPath}/admin`;
  const baseBillingPath = `${baseApiPath}/billing`;

  export const Members = `${baseApiPath}/members`;
  export const Member = `${Members}/${PathPlaceholder.MemberId}`

  export const Rentals = `${baseApiPath}/rentals`;

  export const Groups = `${baseApiPath}/groups`;

  export const Invoices = `${baseApiPath}/invoices`;
  export const InvoiceOptions = `${baseApiPath}/invoice_options`;

  export const Permissions = `${Member}/permissions`;

  export const Auth = {
    SignIn: `${Members}/sign_in`,
    SignOut: `${Members}/sign_out`,
    Password: `${Members}/password`,
    SignUp: `${Members}`,
    SendRegistration: `${baseApiPath}/send_registration`
  }

  export const Admin = {
    Members: `${baseAdminPath}/members`,
    Member: `${baseAdminPath}/members/${PathPlaceholder.MemberId}`,
    AccessCards: `${baseAdminPath}/cards`,
    AccessCard: `${baseAdminPath}/cards/${PathPlaceholder.CardId}`,
    Invoices: `${baseAdminPath}/invoices`,
    Invoice: `${baseAdminPath}/invoices/${PathPlaceholder.InvoiceId}`,
    InvoiceOptions: `${baseAdminPath}/invoice_options`,
    InvoiceOption: `${baseAdminPath}/invoice_options/${PathPlaceholder.InvoiceId}`,
    Rentals: `${baseAdminPath}/rentals`,
    Rental: `${baseAdminPath}/rentals/${PathPlaceholder.RentalId}`,
    Billing: {
      Subscriptions: `${baseAdminPath}/billing/subscriptions`,
      Subscription: `${baseAdminPath}/billing/subscriptions/${PathPlaceholder.SubscriptionId}`,
      Transactions: `${baseAdminPath}/billing/transactions`,
      Transaction: `${baseAdminPath}/billing/transactions/${PathPlaceholder.TransactionId}`,
    },
    Permissions: `${baseAdminPath}/permissions`,

    EarnedMemberships: `${baseAdminPath}/earned_memberships`,
    EarnedMembership: `${baseAdminPath}/earned_memberships/${PathPlaceholder.MembershipId}`,
    EarnedMembershipNamespace: {
      Reports: `${baseAdminPath}/earned_memberships/${PathPlaceholder.MembershipId}/reports`
    }
  }

  export const Billing = {
    PaymentMethods: `${baseBillingPath}/payment_methods`,
    PaymentMethod: `${baseBillingPath}/payment_methods/${PathPlaceholder.PaymentMethodId}`,
    Plans: `${baseAdminPath}/billing/plans`,
    Discounts: `${baseAdminPath}/billing/plans/discounts`,
    Subscriptions: `${baseBillingPath}/subscriptions`,
    Subscription: `${baseBillingPath}/subscriptions/${PathPlaceholder.SubscriptionId}`,
    Transactions: `${baseBillingPath}/transactions`,
    Transaction: `${baseBillingPath}/transactions/${PathPlaceholder.TransactionId}`,
  }

  export const EarnedMemberships = `${baseApiPath}/earned_memberships`
  export const EarnedMembership = `${EarnedMemberships}/${PathPlaceholder.MembershipId}`
  export const EarnedMembershipNamespace ={
    Reports: `${EarnedMembership}/reports`
  }
}