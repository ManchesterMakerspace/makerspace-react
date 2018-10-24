import { Invoice } from "app/entities/invoice";

import { basicUser, adminUser } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import auth from "../pageObjects/auth";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";
import invoicePo from "../pageObjects/invoice";
import { pastDueInvoice, settledInvoice, defaultInvoice } from "../constants/invoice";
import { SortDirection } from "ui/common/table/constants";

const initInvoices = [defaultInvoice, pastDueInvoice, settledInvoice];

describe("Invoicing and Dues", () => {
  xdescribe("Basic User", () => {
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      await mock(mockRequests.invoices.get.ok(invoices));
      if (login) {
        await auth.autoLogin(basicUser);
        expect(await browser.getCurrentUrl()).toEqual(utils.buildUrl(memberPO.getProfilePath(basicUser.id)));
      }
    }

    it("Members can log in and pay outstanding dues", async () => {
      /* 1. Login as basic user
      /* 2. Setup Mocks
          - Load invoices (2 results: 1 upcoming, 1 past due)
          - Pay invoice (for past due result)
          - Load invoices (2 results: 1 upcoming, 1 paid)
        3. Assert table loads correctly
        4. Select past due invoice from table
        5. Click Checkout
        6. Assert directed to checkout form
        TODO
        7. Select payment method & submit
        8. Assert checkout summary page
        9. Submit
        10. Assert checkout complete confirmation page
        11. Click 'Return to Profile'
        12. Assert invoices displayed in table
      */
      await loadInvoices([defaultInvoice, pastDueInvoice, settledInvoice], true);
    });
    it("Members can review their payment history", () => {
      /* 1. Login as basic user
         2. Setup mocks
          - Load invoices (2 results: 1 upcoming, 1 past due)
          - Load invoices (3 results: 1 upcoming, 1 past due, 1 paid)
         3. Assert 2 invoices are displayed correctly in users profile w/ past due first
         4. User clicks checkbox to view paid invoices
         5. Assert 3 invoices are displayed correctly in users profile w/ past due first
      */
    });
  });
  describe("Admin User", () => {
    const targetUrl = memberPO.getProfilePath(basicUser.id);
    const loadInvoices = async (invoices: Invoice[], login?: boolean) => {
      await mock(mockRequests.invoices.get.ok(invoices, { order: SortDirection.Asc, resourceId: basicUser.id }, true));
      if (login) {
        await mock(mockRequests.member.get.ok(basicUser.id, basicUser));
        await auth.autoLogin(adminUser, targetUrl);
        expect(await browser.getCurrentUrl()).toEqual(utils.buildUrl(targetUrl));
      }
    }

    fit("Can create new invoices for members", async () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (0 results)
          - Create invoice
          - Load invoices (1 result)
         3. Click 'Create Invoice' button
         4. Fill out form & submit
         5. Assert new invoice loaded in profile page
      */
      await mock(mockRequests.invoices.post.ok(defaultInvoice));
      await loadInvoices([], true);
      const { submit, description, contact, amount, notes, loading, id: invoiceForm } = invoicePo.invoiceForm;
      expect(await utils.isElementDisplayed(invoicePo.getErrorRowId())).toBeFalsy();
      expect(await utils.isElementDisplayed(invoicePo.getNoDataRowId())).toBeTruthy();
      await utils.clickElement(invoicePo.actionButtons.create);
      await utils.waitForVisisble(submit);
      await utils.fillInput(description, defaultInvoice.description);
      await utils.fillInput(contact, defaultInvoice.contact);
      await utils.fillInput(amount, `${defaultInvoice.amount}`);
      await utils.fillInput(notes, defaultInvoice.notes);

      await mock(mockRequests.invoices.get.ok([defaultInvoice]));
      await utils.clickElement(submit);
      await utils.waitForNotVisible(submit);
      expect((await invoicePo.getAllRows()).length).toEqual(1);
    });
    xit("Can edit invoices for memebrs", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (1 result)
          - Edit invoice
          - Load invoices (1 result)
         3. Click 'Edit Invoice' button
         4. Fill out form & submit
         5. Assert updated invoice loaded in profile page
      */
    });
    xit("Can delete invoices for members", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (1 result)
          - Delete invoice
          - Load invoices (0 result)
         3. Click 'Delete Invoice' button
         4. Confirm modal
         5. Assert invoice not loaded in profile page
      */
    });
    xit("Invoice Form Validation", () => {

    });
    xit("Can see member's payment history", () => {
      /* 1. Login as admin and nav to basic user's profile
         2. Setup mocks
          - Load invoices (3 results: 1 upcoming, 1 past due, 1 paid)
         3. Assert invoices listed correctly in user's profile
      */
    });
  });
});