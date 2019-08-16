import { Member } from "makerspace-ts-api-client";

export enum Properties {
  Id = "id",
  Firstname = "firstname",
  Lastname = "lastname",
  Email = "email",
  Expiration = "expirationTime",
  Status = "status",
  Role = "role",
}

export enum MemberStatus {
  Active = "activeMember",
  Revoked = "revoked",
  NonMember = "nonMember",
  Inactive = "inactive"
}

export enum MemberRole {
  Admin = "admin",
  // Officer = "officer",
  Member = "member"
}

export const isMember = (entity: any): entity is Member => entity.hasOwnProperty(Properties.Expiration) && entity.hasOwnProperty(Properties.Firstname);
