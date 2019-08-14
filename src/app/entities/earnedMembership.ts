import { ReportRequirement, NewReportRequirement } from "makerspace-ts-api-client";

export const isReportRequirement = (item: any): item is ReportRequirement =>
  item !== undefined && item.requirementId !== undefined;

export interface NewReport {
  earnedMembershipId: string;
  reportRequirements: NewReportRequirement[];
}
export interface Report extends NewReport {
  id: string;
  date: Date;
  reportRequirements: ReportRequirement[];
}