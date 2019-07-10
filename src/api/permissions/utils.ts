import { buildJsonUrl } from "app/utils";
import { Url } from "app/constants";

const buildPermissionPath = (memberId: string, admin: boolean): string => {
  const path = admin ? Url.Admin.Permission : Url.Permissions
  return path.replace(Url.PathPlaceholder.MemberId, memberId);
}

export const buildPermissionUrl = (memberId: string, admin: boolean = false): string => {
  return buildJsonUrl(buildPermissionPath(memberId, admin));
}