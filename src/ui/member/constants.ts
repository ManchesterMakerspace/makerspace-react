import { emailValid } from "app/utils";
import { FormFields } from "ui/common/Form";
import { MemberStatus, MemberRole } from "app/entities/member";
import { dateToTime } from "ui/utils/timeToDate";
import { Member } from "makerspace-ts-api-client";

export enum Action {
  StartReadRequest = "MEMBER/START_READ_REQUEST",
  GetMemberSuccess = "MEMBER/GET_MEMBER_SUCCESS",
  GetMemberFailure = "MEMBER/GET_MEMBER_FAILURE",
  StartUpdateRequest = "MEMBER/START_UPDATE_REQUEST",
  UpdateMemberSuccess = "MEMBER/UPDATE_MEMBER_SUCCESS",
  UpdateMemberFailure = "MEMBER/UPDATE_MEMBER_FAILURE",
}

const formPrefix = "member-form";
export const fields = (admin: boolean, member?: Partial<Member>): FormFields => ({
  firstname: {
    label: "First Name",
    name: `${formPrefix}-firstname`,
    placeholder: "Enter first name",
    validate: (val) => !!val,
    error: "Invalid name",
  },
  lastname: {
    label: "Last Name",
    name: `${formPrefix}-lastname`,
    placeholder: "Enter last name",
    validate: (val) => !!val,
    error: "Invalid name"
  },
  email: {
    label: "Email / Username",
    name: `${formPrefix}-email`,
    placeholder: "Enter email",
    validate: (val: string) => val && emailValid(val),
    error: "Invalid email"
  },
  ...admin && {
    status: {
      label: "Status",
      name: `${formPrefix}-status`,
      placeholder: "Select one",
      validate: (val) => !!val,
      error: "Invalid status"
    },
    groupName: {
      label: "Group Name (optional)",
      name: `${formPrefix}-groupName`,
      placeholder: "Select one",
    },
    ...member && member.id && {
      expirationTime: {
        label: "Expiration Date",
        name: `${formPrefix}-expirationTime`,
        placeholder: "Membership Expiration",
        transform: (val) => dateToTime(val),
        error: "Invalid expiration"
      },
    },
    role: {
      label: "Role",
      name: `${formPrefix}-role`,
      placeholder: "Select one",
      validate: (val) => !!val,
      error: "Invalid role"
    },
    memberContractOnFile: {
      label: "Member Contract Signed?",
      name: `${formPrefix}-contract`,
      validate: (val) => member && member.id ? true : val, // Validate contract only on create.
      transform: (val) => !!val,
      error: "Member must sign contract"
    }
  },
})

export const MemberStatusOptions = {
  [MemberStatus.Active]: "Active",
  [MemberStatus.Revoked]: "Revoked",
  [MemberStatus.NonMember]: "Non-Member",
  [MemberStatus.Inactive]: "Inactive",
}

export const MemberRoleOptions = {
  [MemberRole.Member]: "Member",
  [MemberRole.Admin]: "Admin"
}

const membershipDetails = {
  none: {
    description: "No membership on file. Create a membership to add one.",
    type: "No membership found",
    allowMod: true,
  },
  paypal: {
    description: "Membership handled by PayPal. If you wish to change your membership, you must first cancel your PayPal subscription.",
    type: "Managed by PayPal",
    allowMod: false,
  },
  notFound: {
    description: "Membership subscription exists but cannot be found. Contact an administrator for assistance.",
    type: "Unknown",
    allowMod: false,
  },
  noSubscription: {
    description: "No subscription found. Update membership to enable automatic renewals.",
    type: "Month-to-month",
    allowMod: true,
  },
  earnedMembership: {
    description: "Membership sponsored by earned membership program.",
    type: "Earned Membership",
    allowMod: false,
  },
  subscription: {
    description: "Recurring membership subscription by Braintree",
    type: "Subscription",
    allowMod: true,
  }
}

export const getDetailsForMember = (member: Partial<Member>) => {
  let details = membershipDetails.noSubscription;
  if (member.subscription && !member.subscriptionId) {
    details = membershipDetails.paypal;
  } else if (member.subscriptionId) {
    details = membershipDetails.subscription;
  } else if (!member.expirationTime) {
    details = membershipDetails.none;
  } else if (member.earnedMembershipId) {
    details = membershipDetails.earnedMembership;
  }
  return details;
}