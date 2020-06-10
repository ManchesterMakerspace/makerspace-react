import * as moment from "moment";
import { Routing } from "app/constants";
import { getAdminUserLogin } from "../../constants/api_seed_data";
import { basicMembers } from "../../constants/member";
import auth from "../../pageObjects/auth";
import utils from "../../pageObjects/common";
import memberPO from "../../pageObjects/member";
import header from "../../pageObjects/header";
import renewalPO from "../../pageObjects/renewalForm";
import invoicePO from "../../pageObjects/invoice";
import { checkout } from "../../pageObjects/checkout";
import { paymentMethods, creditCard } from "../../pageObjects/paymentMethods";
import { selfRegisterMember } from "../utils/auth";
import { newVisa } from "../../constants/paymentMethod";

const cardIds = ["0001", "0002", "0000"];

describe("Member management", () => {
  describe("Registering", () => {
    beforeEach(() => {
      return browser.get(utils.buildUrl());
    });
    it("Customers can register from home page", async () => {
      const newMember = Object.assign({}, basicMembers.pop());
      await selfRegisterMember(newMember);
      await utils.waitForNotVisible(memberPO.memberDetail.loading);
      await utils.waitForNotVisible(memberPO.memberDetail.notificationModalSubmit);

      const url = await browser.getCurrentUrl();
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: null
      });
      await utils.clickElement(invoicePO.actionButtons.payNow);
      await utils.waitForPageLoad(checkout.checkoutUrl);

      // Add a payment method
      await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
      expect((await paymentMethods.getPaymentMethods()).length).toEqual(0);
      await utils.clickElement(paymentMethods.addPaymentButton);
      await utils.waitForVisible(paymentMethods.paymentMethodFormSelect.creditCard);
      await utils.waitForNotVisible(paymentMethods.paymentMethodFormSelect.loading);
      await utils.clickElement(paymentMethods.paymentMethodFormSelect.creditCard);

      await utils.waitForVisible(creditCard.creditCardForm.submit);
      await utils.waitForNotVisible(creditCard.creditCardForm.loading);
      await creditCard.fillInput("cardNumber", newVisa.number);
      await creditCard.fillInput("csv", newVisa.csv);
      await creditCard.fillInput("expirationDate", newVisa.expiration);
      await creditCard.fillInput("postalCode", newVisa.postalCode);
      await utils.clickElement(creditCard.creditCardForm.submit);
      await utils.waitForNotVisible(creditCard.creditCardForm.loading);
      await utils.waitForNotVisible(creditCard.creditCardForm.submit);

      // Assert the payment method
      await utils.waitForNotVisible(paymentMethods.paymentMethodSelect.loading);
      expect((await paymentMethods.getPaymentMethods()).length).toEqual(1);

      await utils.clickElement(checkout.nextButton);
      // Submit payment
      await utils.clickElement(checkout.submit);

      // Accept recurring payment authorization
      await utils.waitForVisible(checkout.authAgreementCheckbox);
      await utils.clickElement(checkout.authAgreementCheckbox);
      await utils.clickElement(checkout.authAgreementSubmit);
      await utils.waitForNotVisible(checkout.authAgreementSubmit);

      // view receipt & return to profile
      await utils.waitForPageToMatch(Routing.Receipt);
      await utils.waitForNotVisible(checkout.receiptLoading);
      await utils.clickElement(checkout.backToProfileButton);
      await utils.waitForPageToMatch(Routing.Profile);
      await utils.waitForNotVisible(memberPO.memberDetail.loading);
      await utils.waitForNotVisible(memberPO.memberDetail.notificationModalSubmit);

      // Verify no expiration set from user POV
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: undefined
      });

      // TODO: Verify new member, subscription & receipt emails

      // Logout
      await header.navigateTo(header.links.logout);
      await utils.waitForVisible(header.loginLink);

      // Login as Admin
      await auth.goToLogin();
      await auth.signInUser(getAdminUserLogin());
      await utils.waitForPageToMatch(Routing.Profile);

      // View new member's profile
      await browser.get(url);
      await utils.waitForPageToMatch(Routing.Profile);

      // Verify no expiration set from admin POV
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: undefined
      });
      expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).toMatch(/Register Fob/i);
      await utils.clickElement(memberPO.memberDetail.openCardButton);
      await utils.waitForVisible(memberPO.accessCardForm.submit);
      await utils.waitForNotVisible(memberPO.accessCardForm.loading);
      expect(cardIds).toContain(await utils.getElementText(memberPO.accessCardForm.importConfirmation));
      await utils.clickElement(memberPO.accessCardForm.idVerification);
      await utils.clickElement(memberPO.accessCardForm.submit);
      expect(await utils.isElementDisplayed(memberPO.accessCardForm.error)).toBeFalsy();
      await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      await utils.waitForNotVisible(memberPO.memberDetail.loading);

      await memberPO.verifyProfileInfo({ // Verify registering card activates the membership
        ...newMember,
        expirationTime: moment().add(1, 'M').valueOf()
      });
    }, 300000);

    it("Admins can register a customer manually", async () => {
      const newMember = Object.assign({}, basicMembers.pop());

      await auth.goToLogin();
      await auth.signInUser(getAdminUserLogin());
      await header.navigateTo(header.links.members);
      await utils.waitForPageLoad(memberPO.membersListUrl);
      await utils.waitForVisible(memberPO.membersList.createMemberButton);
      await utils.clickElement(memberPO.membersList.createMemberButton);
      await utils.waitForVisible(memberPO.memberForm.submit);
      await utils.clickElement(memberPO.memberForm.contract);
      await utils.fillInput(memberPO.memberForm.firstname, newMember.firstname);
      await utils.fillInput(memberPO.memberForm.lastname, newMember.lastname);
      await utils.fillInput(memberPO.memberForm.street, "12 Main St.");
      await utils.fillInput(memberPO.memberForm.city, "Roswell");
      await utils.fillInput(memberPO.memberForm.zip, "90210");
      await utils.selectDropdownByValue(memberPO.memberForm.state, "GA");
      await utils.fillInput(memberPO.memberForm.email, newMember.email);
      await utils.fillInput(memberPO.memberForm.notes, "Some notes could be put in here");
      await utils.clickElement(memberPO.memberForm.submit);
      await utils.waitForNotVisible(memberPO.memberForm.submit);
      await utils.waitForPageToMatch(Routing.Profile);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: null
      });
       // Renew them for a month
       await utils.clickElement(memberPO.memberDetail.openRenewButton);
       await utils.waitForVisible(renewalPO.renewalForm.submit);
       expect(await utils.getElementText(renewalPO.renewalForm.entity)).toEqual(`${newMember.firstname} ${newMember.lastname}`);
       await utils.selectDropdownByValue(renewalPO.renewalForm.renewalSelect, "1");
       await utils.assertNoInputError(renewalPO.renewalForm.termError, true);
       await utils.clickElement(renewalPO.renewalForm.submit);
       await utils.waitForNotVisible(renewalPO.renewalForm.submit);
      // Get them a fob
      expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).toMatch(/Register Fob/i);
      await utils.clickElement(memberPO.memberDetail.openCardButton);
      await utils.clickElement(memberPO.accessCardForm.idVerification);
      await utils.waitForVisible(memberPO.accessCardForm.submit);
      await utils.clickElement(memberPO.accessCardForm.importButton);
      await utils.waitForNotVisible(memberPO.accessCardForm.loading);
      expect(cardIds).toContain(await utils.getElementText(memberPO.accessCardForm.importConfirmation));
      await utils.clickElement(memberPO.accessCardForm.submit);
      expect(await utils.isElementDisplayed(memberPO.accessCardForm.error)).toBeFalsy();
      await utils.waitForNotVisible(memberPO.accessCardForm.submit);
      await memberPO.verifyProfileInfo({
        ...newMember,
        expirationTime: moment().add(1, 'M').valueOf()
      });
    });
  });
});
