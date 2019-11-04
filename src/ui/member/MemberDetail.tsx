import * as React from "react";
import useReactRouter from "use-react-router";
import { Member, getMember, listRentals } from "makerspace-ts-api-client";

import { displayMemberExpiration, buildProfileRouting } from "ui/member/utils";
import LoadingOverlay from "ui/common/LoadingOverlay";
import KeyValueItem from "ui/common/KeyValueItem";
import DetailView from "ui/common/DetailView";
import MemberStatusLabel from "ui/member/MemberStatusLabel";
import InvoicesList from "ui/invoice/InvoicesList";
import RentalsList from "ui/rentals/RentalsList";
import { ActionButton } from "ui/common/ButtonRow";
import { Whitelists, Routing } from "app/constants";
import { getDetailsForMember } from "./constants";
import AccessCardForm from "ui/accessCards/AccessCardForm";
import ReportList from "ui/reports/ReportList";
import TransactionsList from "ui/transactions/TransactionsList";
import useReadTransaction from "../hooks/useReadTransaction";
import { useAuthState } from "../reducer/hooks";
import EditMember from "./EditMember";
import RenewMember from "./RenewMember";
import NotificationModal, { Notification } from "./NotificationModal";

const MemberProfile: React.FC = () => {
  const { match: { params: { memberId, resource } }, history } = useReactRouter();
  const { currentUser: { id: currentUserId, isAdmin }, permissions } = useAuthState();

  // State for tracking initial render to address bug displaying notifications
  const [initRender, setInitRender] = React.useState(true);
  React.useEffect(() => setInitRender(false), []);

  const isOwnProfile = currentUserId === memberId;
  const billingEnabled = !!permissions[Whitelists.billing];

  const goToSettings = React.useCallback(() => {
    history.push(Routing.Settings.replace(Routing.PathPlaceholder.MemberId, currentUserId));
  }, [currentUserId]);

  const {
    isRequesting: memberLoading,
    refresh: refreshMember,
    error: memberError,
    data: member = {} as Member
  } = useReadTransaction(getMember, { id: memberId });

  const [notification, setNotification] = React.useState<Notification>();
  React.useEffect(() => {
    if (!initRender && isOwnProfile && !memberLoading && (member.id && !member.memberContractOnFile)) {
      setNotification(Notification.Welcome);
    }
  }, [initRender, isOwnProfile, memberLoading, member.memberContractOnFile]);

  const { data: rentals = [] } = useReadTransaction(listRentals, {});

  React.useEffect(() => {
    const missingAgreement = rentals.find(rental => !rental.contractOnFile);
    if (!initRender && isOwnProfile && missingAgreement && !notification) {
      setNotification(Notification.SignRental)
    }
  }, [initRender, isOwnProfile, rentals]);

  // Don't render the notification box on the first paint
  // Helps prevent flickering issue
  const [renderNotification, setRenderNotification] = React.useState(false);
  React.useEffect(() => setRenderNotification(true), []);

  const { customerId, earnedMembershipId } = member;
  const isEarnedMember = !!earnedMembershipId && (isOwnProfile || isAdmin);

  const closeNotification = React.useCallback(() => {
    refreshMember();
    setNotification(undefined);
  }, [refreshMember, setNotification]);

  const goToAgreements = React.useCallback(() => {
    switch (notification) {
      case Notification.SignRental:
        const missingAgreement = rentals.find(rental => !rental.contractOnFile);
        history.push(
          Routing.Documents
            .replace(Routing.PathPlaceholder.Resource, "rental")
            .replace(Routing.PathPlaceholder.ResourceId, missingAgreement.id)
        );
        break;
      case Notification.Welcome:
        history.push(
          Routing.Documents
            .replace(Routing.PathPlaceholder.Resource, "membership")
            .replace(Routing.PathPlaceholder.ResourceId, "")
        );
        break;
    }
  }, [history, rentals, notification]);

  React.useEffect(() => {
    if (memberError && !member.id) {
      history.push(Routing.Members);
    }
  }, [memberError, member.id, history]);

  if (!member.id) {
    return <LoadingOverlay />;
  }

  return (
    <>
      <DetailView
        title={`${member.firstname} ${member.lastname}`}
        basePath={`/members/${memberId}`}
        actionButtons={[
          ...isOwnProfile ? [
            <ActionButton
              key="open-settings"
              id="member-detail-open-settings"
              color="primary"
              variant="outlined"
              disabled={memberLoading}
              label="Account Settings"
              onClick={goToSettings}
            />] : [],
          ...isAdmin ? [
            <EditMember memberId={memberId} key="edit-member"/>,
            <RenewMember memberId={memberId} key="renew-member"/>,
            <AccessCardForm memberId={memberId} key="card-form"/>
          ] : []
        ]}
        information={(
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
              <span id="member-detail-type">{getDetailsForMember(member).type}</span>
            </KeyValueItem>}
          </>
        )}
        activeResourceName={resource}
        resources={(isOwnProfile || isAdmin) && [
          ...isEarnedMember ?
          [{
            name: "membership",
            content: (
              <ReportList earnedMembershipId={earnedMembershipId}/>
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
      {renderNotification && <NotificationModal
        notification={notification}
        onSubmit={goToAgreements}
        onClose={closeNotification}
      />}
    </>
  )
};

export default MemberProfile;
