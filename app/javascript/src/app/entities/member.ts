export interface MemberDetails {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  expirationTime: number;
  status: MemberStatus;
  cardId: string;
  groupName: string;
  role: MemberRole[];
  subscriptionId: string;
}

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
  Officer = "officer",
  Member = "member"
}