import { TablePageObject } from "./table";
import { Routing } from "app/constants";
import { Member, Subscription } from "makerspace-ts-api-client";
import { timeToDate } from "ui/utils/timeToDate";

const tableId = "subscriptions-table";
const fields = ["nextBilling", "resourceClass", "memberName", "amount", "status"];

class SubscriptionsPageObject extends TablePageObject {
  public listUrl = Routing.Billing

  public fieldEvaluator = (member?: Partial<Member>) => (subscription: Partial<Subscription>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "nextBilling") {
      expect(text).toEqual(timeToDate(subscription.nextBillingDate));
    } else if (field === "status") {
      expect(
        ["Active", "Expired"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else if (field === "memberName") {
      if (member) {
        expect(text).toEqual(`${member.firstname} ${member.lastname}`);
      } else {
        expect(text).toBeTruthy();
      }
    } else {
      expect(text.includes(subscription[field])).toBeTruthy();
    }
  }

  public actionButtons = {
    delete: "#subscription-option-cancel",
  }

  private cancelSubscriptionModalId = "#cancel-subscription";
  public cancelSubscriptionModal = {
    id: `${this.cancelSubscriptionModalId}-confirm`,
    status: `#subscription-status`,
    type: "#subscription-type",
    nextPayment: `#subscription-next-payment`,
    submit: `${this.cancelSubscriptionModalId}-submit`,
    cancel: `${this.cancelSubscriptionModalId}-cancel`,
    error: `${this.cancelSubscriptionModalId}-error`,
    loading: `${this.cancelSubscriptionModalId}-loading`,
  }

  public filters = {
    hidecanceled: "#hide-canceled",
  }
}

export default new SubscriptionsPageObject(tableId, fields);