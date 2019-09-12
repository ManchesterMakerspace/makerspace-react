import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { QueryParams } from "app/interfaces";

import { Action as ReportAction } from "ui/reports/constants";
import { ReportsState } from "ui/reports/interfaces";
import {
  Report,
  NewReport,
  listEarnedMembershipReports,
  adminListEarnedMembershipReports,
  isApiErrorResponse,
  createEarnedMembershipReport
} from "makerspace-ts-api-client";


export const readReportsAction = (
  membershipId: string,
  queryParams: QueryParams,
  isAdmin: boolean,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: ReportAction.StartReadRequest });

  const func = isAdmin ? adminListEarnedMembershipReports : listEarnedMembershipReports;
  const result = await func(membershipId, queryParams);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: ReportAction.GetReportsFailure,
      error: result.error.message
    });
  } else {
    const { data, response } = result;
    const totalItems = response.headers.get("total-items");
    dispatch({
      type: ReportAction.GetReportsSuccess,
      data: {
        reports: data,
        totalItems: Number(totalItems)
      }
    });
  }
};

export const createReportAction = (
  reportDetails: NewReport
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: ReportAction.StartCreateRequest });

  const result = await createEarnedMembershipReport(reportDetails.earnedMembershipId, reportDetails);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: ReportAction.CreateReportFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: ReportAction.CreateReportSuccess,
    });
  }
};

const defaultState: ReportsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  create: {
    isRequesting: false,
    error: ""
  },
}

export const reportsReducer = (state: ReportsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case ReportAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case ReportAction.GetReportsSuccess:
      const {
        data: {
          reports,
          totalItems,
        }
      } = action;

      const newReports = {};
      reports.forEach((report: Report) => {
        newReports[report.id] = report;
      });

      return {
        ...state,
        entities: newReports,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case ReportAction.GetReportsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case ReportAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case ReportAction.CreateReportSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case ReportAction.CreateReportFailure:
      const { error: createError } = action;
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: createError
        }
      }

    default:
      return state;
  }
}