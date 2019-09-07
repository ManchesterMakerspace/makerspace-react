import * as React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { Member } from "makerspace-ts-api-client";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { displayMemberExpiration } from "ui/member/utils";
import LoadingOverlay from "ui/common/LoadingOverlay";
import KeyValueItem from "ui/common/KeyValueItem";
import DetailView from "ui/common/DetailView";
import { readMemberAction } from "ui/member/actions";
import RenewalForm from "ui/common/RenewalForm";
import MemberForm from "ui/member/MemberForm";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import UpdateMemberContainer, { UpdateMemberRenderProps } from "ui/member/UpdateMemberContainer";
import { memberToRenewal } from "ui/member/utils";
import { membershipRenewalOptions } from "ui/members/constants";
import InvoicesList from "ui/invoice/InvoicesList";
import RentalsList from "ui/rentals/RentalsList";
import { Routing, CrudOperation } from "app/constants";
import { ActionButtonProps } from "ui/common/ButtonRow";
import NotificationModal, { Notification } from "ui/member/NotificationModal";
import { Whitelists } from "app/constants";
import SignDocuments from "ui/auth/SignDocuments";
import { getDetailsForMember } from "ui/membership/constants";
import AccessCardForm from "ui/accessCards/AccessCardForm";
import ReportList from "ui/reports/ReportList";
import { readMembershipAction } from "ui/earnedMemberships/actions";
import TransactionsList from "ui/transactions/TransactionsList";

interface DispatchProps {
  getMember: () => Promise<void>;
  goToSettings: () => void;
  getEarnedMembership: (membershipId: string, isAdmin: boolean) => void;
}
interface StateProps {
  admin: boolean;
  requestingError: string;
  isRequestingMember: boolean;
  isUpdatingMember: boolean;
  updateMemberError: string;
  member: Member,
  currentUserId: string;
  subscriptionId: string;
  billingEnabled: boolean;
}
interface OwnProps extends RouteComponentProps<any> {
}
interface Props extends OwnProps, Pick<DispatchProps, "getMember" | "goToSettings">, StateProps {
  getEarnedMembership: (membershipId: string) => void;
}

interface State {
  isEditOpen: boolean;
  isRenewOpen: boolean;
  isCardOpen: boolean;
  displayDocuments: boolean;
  displayNotification: Notification;
}
const defaultState: State = {
  isEditOpen: false,
  isRenewOpen: false,
  isCardOpen: false,
  displayDocuments: false,
  displayNotification: undefined,
}

const allowedResources = new Set(["dues", "rentals"]);

class MemberDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...defaultState,
    };
  }

  public componentDidMount() {
    const { member, currentUserId, getMember } = this.props;
    const ownProfile = member && currentUserId === member.id;

    getMember();
    this.setState(state => ({
      ...state,
      displayNotification: ownProfile && !member.memberContractOnFile ? Notification.Welcome : undefined,
    }));
  }

  public componentDidUpdate(prevProps: Props) {
    const oldMemberId = prevProps.match.params.memberId;
    const { isRequestingMember: wasRequesting, isUpdatingMember: wasUpdating } = prevProps;
    const { currentUserId, admin, isRequestingMember, match, getMember, member, history, match: { params: { resource } } } = this.props;
    const { memberId } = match.params;
    if (oldMemberId !== memberId && !isRequestingMember) {
      getMember();
    }
    const ownProfile = member && currentUserId === memberId;
    if (wasRequesting && !isRequestingMember) {
      if (member) {
        if (resource) {
          !allowedResources.has(resource) && history.push(Routing.Profile.replace(Routing.PathPlaceholder.MemberId, currentUserId))
        }
        this.setState(state => ({
          ...state,
          displayNotification: ownProfile && !member.memberContractOnFile ? Notification.Welcome : undefined,
        }));
        if (member.earnedMembershipId && (ownProfile || admin)) {
          this.props.getEarnedMembership(member.earnedMembershipId);
        }
      } else {
        history.push(Routing.Members);
      }
    }

    if (
      (wasUpdating && !this.props.isUpdatingMember && !this.props.updateMemberError) ){
      getMember();
    }
  }

  private openRenewModal = () => this.setState({ isRenewOpen: true });
  private closeRenewModal = () => this.setState({ isRenewOpen: false });
  private openEditModal = () => this.setState({ isEditOpen: true });
  private closeEditModal = () => this.setState({ isEditOpen: false });
  private openCardModal = () => this.setState({ isCardOpen: true });
  private closeCardModal = () => {
    this.props.getMember();
    this.setState({ isCardOpen: false });
  };

  private renderMemberInfo = (): JSX.Element => {
    const { member, billingEnabled } = this.props;

    const details = getDetailsForMember(member);

    return (
      <>
        <KeyValueItem label="Email">
          {member.email ? <a id="member-detail-email" href={`mailto:${member.email}`}>{member.email}</a> : "N/A"}
        </KeyValueItem>
        <KeyValueItem  label="Membership Expiration">
          <span id="member-detail-expiration">{displayMemberExpiration(member)}</span>
        </KeyValueItem>
        <KeyValueItem label="Membership Status">
          <MemberStatusLabel id="member-detail-status" member={member} />
        </KeyValueItem>
        {billingEnabled && <KeyValueItem label="Membership Type">
          <span id="member-detail-type">{details.type}</span>
        </KeyValueItem>}
      </>
    )
  }

  private allowViewProfile = () => {
    const { currentUserId } = this.props;
    return this.props.match.params.memberId === currentUserId;
  }

  private renderMemberDetails = (): JSX.Element => {
    const { member, isUpdatingMember, isRequestingMember, match, admin, goToSettings, billingEnabled, currentUserId } = this.props;
    const { memberId, resource } = match.params;
    const loading = isUpdatingMember || isRequestingMember;
    const { customerId, earnedMembershipId } = member;
    const isEarnedMember = !!earnedMembershipId && (currentUserId === member.id || admin);

    return (
      <>
        <DetailView
          title={`${member.firstname} ${member.lastname}`}
          basePath={`/members/${memberId}`}
          actionButtons={[
            ...!!this.allowViewProfile() ? [{
              id: "member-detail-open-settings",
              color: "primary",
              variant: "outlined",
              disabled: loading,
              label: "Account Settings",
              onClick: goToSettings
            } as ActionButtonProps] : [],
            ...admin ? [{
              id: "member-detail-open-edit-modal",
              color: "primary",
              variant: "outlined",
              disabled: loading,
              label: "Edit",
              onClick: this.openEditModal
            },{
              id: "member-detail-open-renew-modal",
              color: "primary",
              variant: "contained",
              disabled: loading,
              label: "Renew",
              onClick: this.openRenewModal
            },
              {
                id: "member-detail-open-card-modal",
                color: "primary",
                variant: member && member.cardId ? "outlined" : "contained",
                disabled: loading,
                label: member && member.cardId ? "Replace Fob" : "Register Fob",
                onClick: this.openCardModal
              }] as ActionButtonProps[]: []
          ]}
          information={this.renderMemberInfo()}
          activeResourceName={resource}
          resources={(this.allowViewProfile() || admin) && [
            ...isEarnedMember ?
            [{
              name: "membership",
              content: (
                <ReportList member={member}/>
              )
            }] : [],
            ...billingEnabled ?
            [{
              name: "dues",
              content: <InvoicesList />
            }] : [],
            {
              name: "rentals",
              content: (
                <RentalsList
                  member={member}
                />
              )
            },
            ...billingEnabled && !!customerId ? [{
              name: "transactions",
              displayName: "Payment History",
              content: (
                <TransactionsList
                  member={member}
                />
              )
            }] : []
          ]}
        />
        {this.renderMemberForms()}
        {this.renderNotifications()}
      </>
    )
  }

  private goToAgreements = () => {
    this.setState({ displayDocuments: true });
  }
  private closeAgreements = () => {
    this.setState({ displayDocuments: false });
    this.closeNotifications();
  }
  private closeNotifications = () => this.setState({ displayNotification: undefined });
  private renderNotifications = () => {
    const { displayNotification } = this.state;

    return (
      <NotificationModal
        notification={displayNotification}
        onSubmit={this.goToAgreements}
        onClose={this.closeNotifications}
      />
    );
  }

  private renderMemberForms = () => {
    const { member, admin } = this.props;
    const { isEditOpen, isRenewOpen, isCardOpen } = this.state;

    const editForm = (renderProps:UpdateMemberRenderProps) => (
      <MemberForm
        ref={renderProps.setRef}
        member={renderProps.member}
        isAdmin={admin}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    )
    const renewForm = (renderProps:UpdateMemberRenderProps) => (
      <RenewalForm
        ref={renderProps.setRef}
        renewalOptions={membershipRenewalOptions}
        title="Renew Membership"
        entity={memberToRenewal(renderProps.member)}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        />
    )

    return (admin &&
      <>
        <UpdateMemberContainer
          operation={CrudOperation.Update}
          isOpen={isRenewOpen}
          member={member}
          closeHandler={this.closeRenewModal}
          render={renewForm}
        />
        <UpdateMemberContainer
          operation={CrudOperation.Update}
          isOpen={isEditOpen}
          member={member}
          closeHandler={this.closeEditModal}
          render={editForm}
        />
        {isCardOpen && <AccessCardForm
          member={member}
          onClose={this.closeCardModal}
        />}
      </>
    )
  }

  public render(): JSX.Element {
    const { member, isRequestingMember, match } = this.props;
    const { displayDocuments } = this.state;
    return (
      <>
        {isRequestingMember && <LoadingOverlay id="member-detail"/>}
        {member && (
          displayDocuments ?
          <SignDocuments onSubmit={this.closeAgreements}/>
          : this.renderMemberDetails()
      )}
      </>
    )
  }
}

const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {
  const { isRequesting, error: requestingError } = state.member.read;
  const { isRequesting: isUpdating, error: updateError } = state.member.update
  const { entity: member } = state.member;
  const { permissions, currentUser: { isAdmin: admin, id: currentUserId, subscriptionId } } = state.auth;

  return {
    admin,
    member,
    requestingError,
    currentUserId,
    isRequestingMember: isRequesting,
    isUpdatingMember: isUpdating,
    updateMemberError: updateError,
    subscriptionId,
    billingEnabled: !!permissions[Whitelists.billing] || false,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const memberId = ownProps.match.params.memberId;
  return {
    getMember: () => dispatch(readMemberAction(memberId)),
    goToSettings: () => dispatch(push(Routing.Settings)),
    getEarnedMembership: (membershipId, isAdmin) => dispatch(readMembershipAction(membershipId, isAdmin)),
  }
}

const mergeProps = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
): Props => {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    getEarnedMembership: (membershipId) => dispatchProps.getEarnedMembership(membershipId, stateProps.admin),
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps)(MemberDetail));
