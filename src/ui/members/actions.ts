import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { QueryParams } from "app/interfaces";

import { Action as MembersAction } from "ui/members/constants";
import { MembersState } from "ui/members/interfaces";
import { listMembers, isApiErrorResponse, adminCreateMember, Member } from "makerspace-ts-api-client";


export const readMembersAction = (
  queryParams?: QueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembersAction.StartReadRequest });

  const result = await listMembers(queryParams);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MembersAction.GetMembersFailure,
      error: result.error.message
    });
  } else {
    const { data, response } = result;
    const totalItems = response.headers.get("total-items");
    dispatch({
      type: MembersAction.GetMembersSuccess,
      data: {
        members: data,
        totalItems: Number(totalItems)
      }
    });
  }
};


export const createMembersAction = (
  memberForm: Member
): ThunkAction<Promise<Member>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MembersAction.StartCreateRequest });

  let newMember: Member;
  const result = await adminCreateMember(memberForm);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MembersAction.CreateMembersFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: MembersAction.CreateMembersSuccess,
    });
    newMember = result.data;
  }

  return newMember;
};

const defaultState: MembersState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  create: {
    isRequesting: false,
    error: ""
  }
}

export const membersReducer = (state: MembersState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case MembersAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case MembersAction.GetMembersSuccess:
      const {
        data: {
          members,
          totalItems,
        }
      } = action;

      const newMembers = {};
      members.forEach((member: Member) => {
        newMembers[member.id] = member;
      });

      return {
        ...state,
        entities: newMembers,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case MembersAction.GetMembersFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case MembersAction.StartCreateRequest:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: true
        }
      };
    case MembersAction.CreateMembersSuccess:
      return {
        ...state,
        create: {
          ...state.create,
          isRequesting: false,
          error: ""
        }
      };
    case MembersAction.CreateMembersFailure:
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