import * as React from "react";
import { MemberStatus } from "app/entities/member";
import { Member } from "makerspace-ts-api-client";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";

export const memberStatusLabelMap = {
  [MemberStatus.Active]: "Active",
  [MemberStatus.Revoked]: "Revoked",
  [MemberStatus.NonMember]: "Non-Member",
  [MemberStatus.Inactive]: "Inactive"
};

const MemberStatusLabel: React.FC<{ member: Partial<Member>; id?: string }> = ({ member, id }) => {
  const inActive = ![MemberStatus.Active, MemberStatus.NonMember].includes(member.status as MemberStatus);
  const current = member.expirationTime > Date.now();

  let statusColor;
  if (!member.expirationTime) {
    statusColor = Status.Info;
  } else {
    statusColor = current && !inActive ? Status.Success : Status.Danger;
  }

  let label;
  if (inActive) {
    label = memberStatusLabelMap[member.status];
  } else {
    if (!member.expirationTime) {
      label = "N/A";
    } else {
      label = current ? "Active" : "Expired";
    }
  }

  return <StatusLabel id={id} label={label} color={statusColor} />;
};

export default MemberStatusLabel;