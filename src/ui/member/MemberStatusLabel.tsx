import * as React from "react";
import { MemberStatus, Member } from "makerspace-ts-api-client";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";

export const memberStatusLabelMap = {
  [MemberStatus.ActiveMember]: "Active",
  [MemberStatus.Revoked]: "Revoked",
  [MemberStatus.NonMember]: "Non-Member",
  [MemberStatus.Inactive]: "Inactive"
};

type MinProps = Pick<Member, "status" | "expirationTime">;
const MemberStatusLabel: React.FC<{ member: MinProps; id?: string }> = ({ member, id }) => {
  const inActive = ![MemberStatus.ActiveMember, MemberStatus.NonMember].includes(member.status as MemberStatus);
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