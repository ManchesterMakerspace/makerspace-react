import { basicUser, adminUser } from "../../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";

import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import header from "../../pageObjects/header";
import utils from "../../pageObjects/common";
import settingsPO from "../../pageObjects/settings";
import billingPO from "../../pageObjects/billing";
import signup from "../../pageObjects/signup";
import { checkout as checkoutPo } from "../../pageObjects/checkout";
import subscriptionsPO from "../../pageObjects/subscriptions";
import { defaultBillingOptions as invoiceOptions, membershipOptionQueryParams } from "../../constants/invoice";
import { defaultSubscription, defaultSubscriptions } from "../../constants/subscription";
import { creditCard as defaultCreditCard } from "../../constants/paymentMethod";
import { autoLogin } from "../autoLogin";
import { defaultTransactions } from "../../constants/transaction";
import { defaultInvoice } from "../../constants/invoice";
import { Routing } from "app/constants";
import { MemberInvoice } from "app/entities/invoice";
import { paymentMethods } from "../../pageObjects/paymentMethods";
import memberPO from "../../pageObjects/member";
import { LoginMember } from "../../pageObjects/auth";
import { timeToDate } from "ui/utils/timeToDate";

describe("Paid Subscriptions", () => {
  describe("Admin subscription", () => {
    beforeEach(async () => {
      return autoLogin(adminUser, undefined, { billing: true }).then(async () => {
        await mock(mockRequests.subscriptions.get.ok(defaultSubscriptions, { hideCanceled: true }, true));
        await header.navigateTo(header.links.billing);
        await utils.waitForPageLoad(billingPO.url);
        await billingPO.goToSubscriptions();
        // Wait for table load
        expect(await utils.isElementDisplayed(subscriptionsPO.getErrorRowId())).toBeFalsy();
        expect(await utils.isElementDisplayed(subscriptionsPO.getNoDataRowId())).toBeFalsy();
        expect(await utils.isElementDisplayed(subscriptionsPO.getLoadingId())).toBeFalsy();
        expect(await utils.isElementDisplayed(subscriptionsPO.getTitleId())).toBeTruthy();
      });
    });
    it("Loads a list of subscriptions", async () => {
      await subscriptionsPO.verifyListView(defaultSubscriptions, subscriptionsPO.fieldEvaluator());
    });
    it("Can cancel a subscriptoin", async () => {
      await subscriptionsPO.selectRow(defaultSubscriptions[0].id);
      await utils.clickElement(subscriptionsPO.actionButtons.delete);
      await utils.waitForVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.status)).toEqual(defaultSubscriptions[0].status);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.nextPayment)).toEqual(timeToDate(defaultSubscriptions[0].nextBillingDate));
      await mock(mockRequests.subscription.delete.ok(defaultSubscriptions[0].id, true));
      await mock(mockRequests.subscriptions.get.ok([], { hideCanceled: true} , true));
      await utils.clickElement(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForNotVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForVisible(subscriptionsPO.getNoDataRowId());
    });
  });

  describe("Own subscription", () => {
    const initSubscription = {
      ...defaultSubscription,
      memberId: basicUser.id,
      memberName: `${basicUser.firstname} ${basicUser.lastname}`,
    };

    const newCard = {
      ...defaultCreditCard,
      nonce: "foobar"
    }
      const membershipId = "foo";
      const membershipOption = {
        ...invoiceOptions.find((io) => io.id === membershipId),
        amount: initSubscription.amount,
      }

    it("Displays information about current subscriptions and membership", async () => {
      await autoLogin(basicUser, undefined, { billing: true });
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settingsPO.pageUrl);

      await mock(mockRequests.invoices.get.ok([]));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));

      await settingsPO.goToMembershipSettings();

      // Non subscription details displayed
      await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).toBeTruthy();

      await mock(mockRequests.invoices.post.ok({
        ...membershipOption,
        member: basicUser,
      } as Partial<MemberInvoice>, false)); // initial invoice creation
      await mock(mockRequests.invoiceOptions.get.ok([membershipOption], membershipOptionQueryParams), 0);
      await mock(mockRequests.paymentMethods.get.ok([newCard]));
      await utils.clickElement(settingsPO.nonSubscriptionDetails.createSubscription);
      await utils.waitForNotVisible(signup.membershipSelectForm.loading);
      await signup.selectMembershipOption(membershipId);
      await utils.clickElement(signup.membershipSelectForm.submit);
      await utils.waitForPageLoad(checkoutPo.checkoutUrl);

      // Submit payment
      const defaultTransaction = { ...defaultTransactions[0], invoice: defaultInvoice };
      await mock(mockRequests.transactions.post.ok(defaultTransaction));
      await mock(mockRequests.member.get.ok(basicUser.id, {
        ...basicUser,
        subscriptionId: initSubscription.id,
      } as LoginMember));
      await utils.clickElement(paymentMethods.getPaymentMethodSelectId(newCard.id));
      const total = numberAsCurrency(initSubscription.amount);

      expect(await utils.getElementText(checkoutPo.total)).toEqual(`Total ${total}`);
      await utils.clickElement(checkoutPo.submit);
      await utils.assertNoInputError(checkoutPo.checkoutError, true);
      // Wait for receipt
      await utils.waitForPageToMatch(Routing.Receipt)
      // Verify transactions are displayed
      expect(await utils.isElementDisplayed(checkoutPo.receiptContainer)).toBeTruthy();
      // Return to profile
      await utils.clickElement(checkoutPo.backToProfileButton);
      // Wait for profile redirect
      await utils.waitForPageLoad(memberPO.getProfilePath(basicUser.id));

      const subscriptionInvoice = {
        defaultInvoice,
        subscriptionId: initSubscription.id,
      };

      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settingsPO.pageUrl);

      await mock(mockRequests.subscription.get.ok(initSubscription))
      await mock(mockRequests.invoices.get.ok([subscriptionInvoice]));
      await mock(mockRequests.member.get.ok(basicUser.id, {
        ...basicUser,
        subscriptionId: initSubscription.id,
      } as LoginMember));
      await settingsPO.goToMembershipSettings();

      // Subscription details displayed
      await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).toBeFalsy();
      expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).toBeTruthy();
    });

    it("Can cancel their subscriptions", async () => {
      await autoLogin({
        ...basicUser,
        subscriptionId: initSubscription.id,
      } as LoginMember, undefined, { billing: true });

      const subscriptionInvoice = {
        ...defaultInvoice,
        subscriptionId: initSubscription.id,
      };

      await header.navigateTo(header.links.settings);
      await utils.waitForPageToMatch(settingsPO.pageUrl);

      // Mock for subscription details
      await mock(mockRequests.subscription.get.ok(initSubscription))
      await mock(mockRequests.invoices.get.ok([subscriptionInvoice]));
      await mock(mockRequests.member.get.ok(basicUser.id, {
        ...basicUser,
        subscriptionId: initSubscription.id,
      } as LoginMember));
      await settingsPO.goToMembershipSettings();

      // Subscription details displayed
      await utils.waitForNotVisible(settingsPO.subscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).toBeTruthy();

      await utils.clickElement(settingsPO.subscriptionDetails.cancelSubscription);
      await utils.waitForVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      expect(await utils.getElementText(subscriptionsPO.cancelSubscriptionModal.status)).toEqual(defaultSubscriptions[0].status);

      await mock(mockRequests.subscription.delete.ok(initSubscription.id));
      await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
      await mock(mockRequests.invoices.get.ok([]));

      await utils.clickElement(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForNotVisible(subscriptionsPO.cancelSubscriptionModal.submit);
      await utils.waitForNotVisible(settingsPO.nonSubscriptionDetails.loading);
      expect(await utils.isElementDisplayed(settingsPO.nonSubscriptionDetails.status)).toBeTruthy();
      expect(await utils.isElementDisplayed(settingsPO.subscriptionDetails.status)).toBeFalsy();

    });
  })
});
