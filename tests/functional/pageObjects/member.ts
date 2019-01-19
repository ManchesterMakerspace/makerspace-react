import { Routing } from "app/constants";
import utils from "./common";

export class MemberPageObject {
  public welcomeModal = {
    id: "#welcome-modal",
  };

  private memberFormId = "#member-form";
  public memberForm = {
    id: `${this.memberFormId}`,
    firstname: `${this.memberFormId}-firstname`,
    lastname: `${this.memberFormId}-lastname`,
    expiration: `${this.memberFormId}-expirationTime`,
    email: `${this.memberFormId}-email`,
    error: `${this.memberFormId}-error`,
    submit: `${this.memberFormId}-submit`,
    cancel: `${this.memberFormId}-cancel`,
    loading: `${this.memberFormId}-loading`,
  }

  private memberDetailId = "#member-detail";
  public memberDetail = {
    title: "#detail-view-title",
    email: `${this.memberDetailId}-email`,
    expiration: `${this.memberDetailId}-expiration`,
    status: `${this.memberDetailId}-status`,
    openRenewButton: `${this.memberDetailId}-open-renew-modal`,
    openEditButton: `${this.memberDetailId}-open-edit-modal`,
    openCardButton: `${this.memberDetailId}-open-card-modal`,
    duesTab: "#dues-tab",
    rentalsTab: "#rentals-tab",
  }

  public goToMemberRentals = () =>
    utils.clickElement(this.memberDetail.rentalsTab);

  public gotToMemberDues = () =>
    utils.clickElement(this.memberDetail.duesTab);

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

export default new MemberPageObject();