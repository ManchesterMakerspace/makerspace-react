import { PaymentMethodType } from "app/entities/paymentMethod";
import { CreditCard } from "makerspace-ts-api-client";

const expiry = new Date();
expiry.setFullYear(expiry.getFullYear() + 3);

export const creditCard: CreditCard = {
  id: "foo",
  customerId: "foobar",
  paymentType: PaymentMethodType.CreditCard,
  last4: 1111,
  expirationMonth: expiry.getMonth(),
  expirationYear: expiry.getFullYear(),
  expirationDate: `${expiry.getMonth()}/${expiry.getFullYear()}`,
  cardType: "Visa",
  imageUrl: "",
  default: false,
  debit: false,
  subscriptions: []
}

export const creditCardForm = {
  cardNumber: "4111 1111 1111 1111",
  expirationDate: `${expiry.getMonth()}/${expiry.getFullYear()}`,
  postalCode: "90210",
  csv: "123",
}