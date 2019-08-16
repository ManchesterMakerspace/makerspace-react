import { PaymentMethodType } from "app/entities/paymentMethod";
import { CreditCard } from "makerspace-ts-api-client";

export const creditCard: CreditCard = {
  id: "foo",
  customerId: "foobar",
  paymentType: PaymentMethodType.CreditCard,
  last4: 1111,
  expirationMonth: 2,
  expirationYear: 2022,
  expirationDate: "02/2022",
  cardType: "Visa",
  imageUrl: "",
  default: false,
  debit: false,
  subscriptions: []
}

export const creditCardForm = {
  cardNumber: "4111 1111 1111 1111",
  expiration: "02/2022",
  postalCode: "90210",
  csv: "123",
}