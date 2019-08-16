import { RenewalEntity } from "ui/common/RenewalForm";
import { Properties, MemberRole } from "app/entities/member";
import { timeToDate } from "ui/utils/timeToDate";
import { Routing } from "app/constants";
import { isObject } from "util";
import { Member } from "makerspace-ts-api-client";

export const memberToRenewal = (member: Partial<Member>): RenewalEntity => {
  return {
    id: member[Properties.Id],
    name: `${member[Properties.Firstname]} ${member[Properties.Lastname]}`,
    expiration: member[Properties.Expiration],
  }
}

export const memberIsAdmin = (member: Partial<Member>): boolean => {
  return member && member.role &&  member.role.includes(MemberRole.Admin);
}

export const displayMemberExpiration = (member: Partial<Member> | number) => {
  const expirationTime = isObject(member) ? (member as Member).expirationTime : member as number;
  return expirationTime ? timeToDate(expirationTime) : "N/A";
}

export const buildProfileRouting = (memberId: string) => {
  return Routing.Profile.replace(Routing.PathPlaceholder.MemberId, memberId);
};
