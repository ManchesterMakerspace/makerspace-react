import * as moment from "moment";
import { timeToDate } from "ui/utils/timeToDate";

import { basicUser, adminUser, basicMembers } from "../constants/member";
import { mockRequests, mock } from "../mockserver-client-helpers";
import { CardStatus } from "app/entities/card";
import { Rental } from "app/entities/rental";
import { Invoice } from "app/entities/invoice";
import auth, { LoginMember } from "../pageObjects/auth";
import utils from "../pageObjects/common";
import memberPO from "../pageObjects/member";
import rentalPO from "../pageObjects/rentals";
import invoicePo from "../pageObjects/invoice";
import { defaultRental } from "../constants/rental";
import { defaultInvoice } from "../constants/invoice";

const reviewMemberInfo = async (loggedInUser: LoginMember, viewingMember?: LoginMember, executeLogin: boolean = true) => {
  if (!viewingMember) viewingMember = loggedInUser;

  if (executeLogin) {
    await mock(mockRequests.member.get.ok(viewingMember.id, viewingMember));
    await mock(mockRequests.member.get.ok(viewingMember.id, viewingMember, true));
    await auth.autoLogin(loggedInUser, memberPO.getProfilePath(viewingMember.id));
  }
  const { firstname, lastname, email, expirationTime } = viewingMember;
  expect(await utils.getElementText(memberPO.memberDetail.title)).toEqual(`${firstname} ${lastname}`);
  expect(await utils.getElementText(memberPO.memberDetail.email)).toEqual(email);
  expect(await utils.getElementText(memberPO.memberDetail.expiration)).toEqual(expirationTime ? timeToDate(expirationTime) : "N/A");
}

const reviewSubResource = async (member: LoginMember, rentals: Rental[], invoices: Invoice[], admin: boolean = false) => {
  // Rentals displayed
  await mock(mockRequests.rentals.get.ok(rentals, { memberId: member.id }, admin));
  await memberPO.goToMemberRentals();
  expect(await rentalPO.getColumnText("number", rentals[0].id)).toEqual(rentals[0].number);
  // Go to rentals
  // Invoices displayed
  await mock(mockRequests.invoices.get.ok(invoices, { resourceId: member.id }, admin));
  await memberPO.gotToMemberDues();
  expect(await invoicePo.getColumnText("name", invoices[0].id)).toEqual(invoices[0].name);
}

describe("Member Profiles", () => {
  describe("Basic User", () => {
    describe("Own Profile", () => {
      it("Displays your membership information", async () => {
        /* 1. Login as basic user
           2. Assert information block contains logged in member's info
        */
        await reviewMemberInfo(basicUser);
      });
      it("Displays sub-resources pertaining to you", async () => {
        /* 1. Login as basic user
           2. Assert profile shows tables for: Dues, Rentals,
        */
        const rental = {
          ...defaultRental,
          memberId: basicUser.id,
          memberName: `${basicUser.firstname} ${basicUser.lastname}`,
        };
        const invoice = {
          ...defaultInvoice,
          memberId: basicUser.id,
          memberName: `${basicUser.firstname} ${basicUser.lastname}`,
        }
        return auth.autoLogin(basicUser).then(() => {
          return reviewSubResource(basicUser, [rental], [invoice]);
        });
      });
    });
    describe("Other's Profile", () => {
      it("Displays their membership information", async () => {
        /* 1. Login as basic user
           2. Navigate to another user's profile
           2. Assert information block contains other member's info
        */
        const loggedInUser = basicMembers[0];
        const viewingMember = basicMembers[1];
        await reviewMemberInfo(loggedInUser, viewingMember);
        expect(await utils.isElementDisplayed(memberPO.memberDetail.duesTab)).toBeFalsy();
        expect(await utils.isElementDisplayed(memberPO.memberDetail.rentalsTab)).toBeFalsy();
      });
    });
  });
  describe("Admin User", () => {
    describe("Own Profile", () => {
      it("Displays your membership information", async () => {
        /* 1. Login as admin
           2. Assert information block contains logged in member's info
        */
        await reviewMemberInfo(adminUser);
      });
      it("Displays sub-resources pertaining to you", async () => {
        /* 1. Login as admin
           2. Assert profile shows tables for: Dues, Rentals,
        */
        const rental = {
          ...defaultRental,
          memberId: adminUser.id,
          memberName: `${adminUser.firstname} ${adminUser.lastname}`,
        };
        const invoice = {
          ...defaultInvoice,
          memberId: adminUser.id,
          memberName: `${adminUser.firstname} ${adminUser.lastname}`,
        }
        return auth.autoLogin(adminUser).then(() => {
          return reviewSubResource(adminUser, [rental], [invoice], true);
        })
      });
    });
    describe("Other's Profile", () => {
      const viewingMember = basicMembers[1];
      const updatedMember = {
        ...viewingMember,
        firstname: "Updated",
        lastname: "Member",
        email: "updated_member@test.com",
      }

      it("Displays their membership information and sub-resources", async () => {
        /* 1. Login as admin user
           2. Navigate to another user's profile
           2. Assert information block contains other member's info
        */
        const rental = {
          ...defaultRental,
          memberId: viewingMember.id,
          memberName: `${viewingMember.firstname} ${viewingMember.lastname}`,
        };
        const invoice = {
          ...defaultInvoice,
          memberId: viewingMember.id,
          memberName: `${viewingMember.firstname} ${viewingMember.lastname}`,
        }
        await reviewMemberInfo(adminUser, viewingMember);
        await reviewSubResource(viewingMember, [rental], [invoice], true);
      });
      it("Can edit member's information", async () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Setup mocks
            - Edit member
            - Load updated member's profile
          3. Click 'Edit Member' button
          4. Change something in form & submit
          5. Assert updated information is dislayed
        */
        await mock(mockRequests.member.get.ok(viewingMember.id, viewingMember));
        await auth.autoLogin(adminUser, memberPO.getProfilePath(viewingMember.id));
        await utils.clickElement(memberPO.memberDetail.openEditButton);
        await mock(mockRequests.member.put.ok(updatedMember.id, updatedMember));
        await mock(mockRequests.member.get.ok(updatedMember.id, updatedMember));
        await utils.fillInput(memberPO.memberForm.email, "");
        await utils.fillInput(memberPO.memberForm.email, updatedMember.email);
        await utils.fillInput(memberPO.memberForm.firstname, updatedMember.firstname);
        await utils.fillInput(memberPO.memberForm.lastname, updatedMember.lastname);
        await utils.fillInput(memberPO.memberForm.expiration, new Date(updatedMember.expirationTime).toDateString());
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.waitForNotVisible(memberPO.memberForm.submit);
        await reviewMemberInfo(adminUser, updatedMember, false);
      });
      it("Edit Form Validation", async () => {
        /* 1. Login as admin and nav to basic user's profile
           2. Click 'Edit Member' button
           3. Remove first name, last name, and email and submit
           4. Assert errors
           5. Fill back in values but email w/ invalid email
           6. Submit & assert invalid email error
           7. Enter valid email & submit (no mock so api request fails)
           8. Assert form error is displayed
           9. Setup mock and submit
           10. Assert modal closes
        */
        await mock(mockRequests.member.get.ok(viewingMember.id, viewingMember));
        await auth.autoLogin(adminUser, memberPO.getProfilePath(viewingMember.id));
        await utils.clickElement(memberPO.memberDetail.openEditButton);
        await utils.fillInput(memberPO.memberForm.email, "");
        await utils.fillInput(memberPO.memberForm.firstname, "");
        await utils.fillInput(memberPO.memberForm.lastname, "");
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.assertInputError(memberPO.memberForm.firstname);
        await utils.assertInputError(memberPO.memberForm.lastname);
        await utils.assertInputError(memberPO.memberForm.email);
        await utils.fillInput(memberPO.memberForm.email, "foo");
        await utils.fillInput(memberPO.memberForm.firstname, updatedMember.firstname);
        await utils.fillInput(memberPO.memberForm.lastname, updatedMember.lastname);
        await utils.fillInput(memberPO.memberForm.expiration, new Date(updatedMember.expirationTime).toDateString());
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.assertInputError(memberPO.memberForm.email)
        await utils.assertNoInputError(memberPO.memberForm.firstname)
        await utils.assertNoInputError(memberPO.memberForm.lastname)
        await utils.fillInput(memberPO.memberForm.email, updatedMember.email);
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.assertNoInputError(memberPO.memberForm.email)
        expect(await utils.getElementText(memberPO.memberForm.error)).toBeTruthy();
        await mock(mockRequests.member.put.ok(updatedMember.id, updatedMember));
        await mock(mockRequests.member.get.ok(updatedMember.id, updatedMember));
        await utils.clickElement(memberPO.memberForm.submit);
        await utils.waitForNotVisible(memberPO.memberForm.submit);
      });
      it("Can register a keyfob for a member", async () => {
        /* 1. Login as admin and nav to basic user's profile that doesnt have a fob
           2. Setup mocks
            - GET rejection card
            - Update Member (created cardID)
            - Load updated member's profile
           3. Click 'Register Fob' button
           4. Assert modal opens
           5. Click 'Import New Key' button
           6. Assert rejection card ID displayed
           7. Submit
           8. Assert updated member's info
        */
       const cardId = "12345-card";
       const foblessMember: LoginMember = {
         ...viewingMember,
         cardId: null
       };
       const updatedMember: LoginMember = {
         ...foblessMember,
         cardId: cardId
       }
        const rejectionCard = {
          uid: cardId,
          timeOf: moment().subtract(1, "minute").calendar()
        };
        await mock(mockRequests.member.get.ok(foblessMember.id, foblessMember));
        await auth.autoLogin(adminUser, memberPO.getProfilePath(foblessMember.id));
        await mock(mockRequests.rejectionCard.get.ok(rejectionCard));

        expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).toMatch(/Register Fob/i);
        await utils.clickElement(memberPO.memberDetail.openCardButton);
        await utils.waitForVisisble(memberPO.accessCardForm.submit);
        await utils.clickElement(memberPO.accessCardForm.importButton);
        expect(await utils.getElementText(memberPO.accessCardForm.importConfirmation)).toEqual(cardId);
        await mock(mockRequests.member.put.ok(updatedMember.id, updatedMember));
        await mock(mockRequests.member.get.ok(updatedMember.id, updatedMember));
        await utils.clickElement(memberPO.accessCardForm.submit);
        await utils.waitForNotVisible(memberPO.accessCardForm.submit);
        await utils.clickElement(memberPO.memberDetail.openCardButton);
        await utils.waitForVisisble(memberPO.accessCardForm.deactivateButton);
      });
      it("Can replace a keyfob for a member", async () => {
        /* 1. Login as admin and nav to basic user's profile that has a fob
           2. Setup mocks
            - mark card as lost
            - GET rejection card
            - Update Member (changed cardID)
            - Load updated member's profile
           3. Click 'Replace Fob' button
           4. Assert modal opens
           5. Click 'Report Lost' button
           6. Click 'Impoort new Key' button
           6. Assert rejection card ID displayed
           7. Submit
           8. Assert updated member's info
        */
        const cardId = "12345-card";
        const currentCard = {
          id: "abc",
          uid: "1234",
          validity: CardStatus.Inactive
        }
        const fobbedMember: LoginMember = {
          ...viewingMember,
          cardId: currentCard.id
        };
        const updatedMember: LoginMember = {
          ...fobbedMember,
          cardId: cardId
        };
        const rejectionCard = {
          uid: cardId,
          timeOf: moment().subtract(1, "minute").calendar()
        };
        await mock(mockRequests.member.get.ok(fobbedMember.id, fobbedMember));
        await auth.autoLogin(adminUser, memberPO.getProfilePath(fobbedMember.id));
        await mock(mockRequests.rejectionCard.get.ok(rejectionCard));
        await mock(mockRequests.accessCard.put.ok(currentCard.id, currentCard));

        expect(await utils.getElementText(memberPO.memberDetail.openCardButton)).toMatch(/Replace Fob/i);
        await utils.clickElement(memberPO.memberDetail.openCardButton);
        await utils.waitForVisisble(memberPO.accessCardForm.submit);
        await utils.clickElement(memberPO.accessCardForm.deactivateButton);
        await utils.waitForNotVisible(memberPO.accessCardForm.loading);
        await utils.clickElement(memberPO.accessCardForm.importButton);
        expect(await utils.getElementText(memberPO.accessCardForm.importConfirmation)).toEqual(cardId);
        await mock(mockRequests.member.put.ok(updatedMember.id, updatedMember));
        await mock(mockRequests.member.get.ok(updatedMember.id, updatedMember));
        await utils.clickElement(memberPO.accessCardForm.submit);
        await utils.waitForNotVisible(memberPO.accessCardForm.submit);
        await utils.clickElement(memberPO.memberDetail.openCardButton);
        await utils.waitForVisisble(memberPO.accessCardForm.deactivateButton);
      });
    });
  });
});