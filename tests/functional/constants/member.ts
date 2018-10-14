import { MemberRole, MemberStatus } from "app/entities/member";
import { LoginMember } from "../pageObjects/auth";
import * as moment from "moment";

export const basicUser: LoginMember = {
  id: "test_member",
  firstname: "Test",
  lastname: "Member",
  email: "test_member@test.com",
  password: "password",
  role: [MemberRole.Member],
  status: MemberStatus.Active,
  cardId: "test_member_card_1",
  expirationTime: parseInt(moment().add(1, "months").calendar().valueOf()),
};
export const adminUser: LoginMember = {
  id: "admin_member",
  firstname: "Admin",
  lastname: "Member",
  email: "admin_member@test.com",
  password: "password",
  role: [MemberRole.Member, MemberRole.Admin],
  status: MemberStatus.Active,
  cardId: "admin_member_card_1",
  expirationTime: parseInt(moment().add(1, "months").calendar().valueOf()),
};
export const defaultMembers: LoginMember[] = new Array(20).fill(undefined).map((_v, index) => {
  const expirationNum = (Date.now() % 6);
  let expirationTime: number;
  switch (expirationNum) {
    case 0:
      expirationTime = parseInt(moment().subtract(1, "months").calendar().valueOf())
    case (4 || 5):
      expirationTime = parseInt(moment().add(3, "months").calendar().valueOf())
      break;
    case (1 || 2 || 3):
      expirationTime = parseInt(moment().add(1, "months").calendar().valueOf())
      break;
  }
  if (index%5 === 0){
    return {
      ...adminUser,
      id: `admin_member_${index}`,
      firstname: "Member",
      lastname: `Admin ${index}`,
      email: `admin_member_${index}@test.com`,
      cardId: `admin_member_${index}_card 1`,
      expirationTime
    }
  }
  return {
    ...basicUser,
    id: `test_member_${index}`,
    firstname: "Member",
    lastname: `Test ${index}`,
    email: `test_member_${index}@test.com`,
    cardId: `test_member_${index}_card 1`,
    expirationTime
  }
})