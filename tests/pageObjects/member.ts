import { Routing } from "app/constants";
import utils from "./common";
import { TablePageObject } from "./table";
import { timeToDate } from "ui/utils/timeToDate"
import { LoginMember } from "./auth";
import { Member } from "makerspace-ts-api-client";
import { SortDirection } from "ui/common/table/constants";
import { QueryParams } from "src/app/interfaces";

const membersListTableId = "members-table";
const membersListFields = ["lastname", "expirationTime", "status"];

export const defaultQueryParams = {
  pageNum: ["0"],
  orderBy: [""],
  order: [SortDirection.Asc],
  search: [""],
  currentMembers: ["true"]
} as any as QueryParams;
export class MemberPageObject extends TablePageObject {
  public welcomeModal = {
    id: "#welcome-modal",
  };

  public fieldEvaluator = (member: Partial<Member>) => (fieldContent: { field: string, text: string }) => {
    const { field, text } = fieldContent;
    if (field === "expirationTime") {
      expect(text).toEqual(timeToDate(member.expirationTime));
    } else if (field === "status") {
      expect(
        ["Active", "Expired", "Non-Member", "Revoked", "Inactive"].some((status => new RegExp(status, 'i').test(text)))
      ).toBeTruthy();
    } else {
      expect(text.includes(member[field])).toBeTruthy();
    }
  }

  private memberFormId = "#member-form";
  public memberForm = {
    id: `${this.memberFormId}`,
    firstname: `${this.memberFormId}-firstname`,
    lastname: `${this.memberFormId}-lastname`,
    expiration: `${this.memberFormId}-expirationTime`,
    contract: `${this.memberFormId}-contract`,
    email: `${this.memberFormId}-email`,
    error: `${this.memberFormId}-error`,
    submit: `${this.memberFormId}-submit`,
    cancel: `${this.memberFormId}-cancel`,
    loading: `${this.memberFormId}-loading`,
  }

  private memberDetailId = "#member-detail";
  public memberDetail = {
    title: "#detail-view-title",
    loading: "#member-detail-loading",
    email: `${this.memberDetailId}-email`,
    expiration: `${this.memberDetailId}-expiration`,
    status: `${this.memberDetailId}-status`,
    openRenewButton: "#members-list-renew",
    openEditButton: `${this.memberDetailId}-open-edit-modal`,
    openCardButton: `${this.memberDetailId}-open-card-modal`,
    duesTab: "#dues-tab",
    rentalsTab: "#rentals-tab",
    transactionsTab: "#transactions-tab",
    notificationModal: "#notification-modal",
    notificationModalSubmit: "#notification-modal-submit",
    notificationModalCancel: "#notification-modal-cancel",
  }

  public verifyProfileInfo = async (member: LoginMember) => {
    const { firstname, lastname, email, expirationTime } = member;
    expect(await utils.getElementText(this.memberDetail.title)).toEqual(`${firstname} ${lastname}`);
    expect(await utils.getElementText(this.memberDetail.email)).toEqual(email);
    if ( expirationTime) {
      expect(await utils.getElementText(this.memberDetail.expiration)).toEqual(expirationTime ? timeToDate(expirationTime) : "N/A");
    }
  }

  public goToMemberRentals = () =>
    utils.clickElement(this.memberDetail.rentalsTab);

  public goToMemberDues = () =>
    utils.clickElement(this.memberDetail.duesTab);

  public goToMemberTransactions = () =>
    utils.clickElement(this.memberDetail.transactionsTab);

  private cardFormId = "#card-form";
  public accessCardForm = {
    id: `${this.cardFormId}`,
    error: `${this.cardFormId}-error`,
    deactivateButton: `${this.cardFormId}-deactivate`,
    lostButton: `${this.cardFormId}-lost`,
    stolenButton: `${this.cardFormId}-stolen`,
    importButton: `${this.cardFormId}-import-new-key`,
    importConfirmation: `${this.cardFormId}-key-confirmation`,
    submit: `${this.cardFormId}-submit`,
    cancel: `${this.cardFormId}-cancel`,
    loading: `${this.cardFormId}-loading`,
  }

  public membersListUrl = Routing.Members;
  private membersListTableId = "#members-table";
  public membersList = {
    id: this.membersListTableId,
    createMemberButton: "#members-list-create",
    renewMemberButton: "#members-list-renew",
    searchInput: `${this.membersListTableId}-search-input`,
    selectAllCheckbox: `${this.membersListTableId}-select-all`,
    headers: {
      lastname: `${this.membersListTableId}-lastname-header`,
      expirationTime: `${this.membersListTableId}-expirationTime-header`,
      status: `${this.membersListTableId}-status-header`,
    },
    row: {
      id: `${this.membersListTableId}-{ID}`,
      select: `${this.membersListTableId}-{ID}-select`,
      lastname: `${this.membersListTableId}-{ID}-lastname`,
      expirationTime: `${this.membersListTableId}-{ID}-expirationTime`,
      status: `${this.membersListTableId}-{ID}-status`,
    },
    error: `${this.membersListTableId}-error-row`,
    noData: `${this.membersListTableId}-no-data-row`,
    loading: `${this.membersListTableId}-loading`,
  }

  public getProfilePath = (memberId: string) => Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
}

export default new MemberPageObject(membersListTableId, membersListFields);