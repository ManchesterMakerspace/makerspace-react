import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";

import { Action as MemberAction } from "ui/member/constants";
import { MemberState } from "ui/member/interfaces";
import { getMember, isApiErrorResponse, adminUpdateMember, updateMember, Member } from "makerspace-ts-api-client";

export const readMemberAction = (
  memberId: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: MemberAction.StartReadRequest });

  const result = await getMember({ id: memberId });

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MemberAction.GetMemberFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: MemberAction.GetMemberSuccess,
      data: result.data
    });
  }
};

type SelfUpdate = {
  firstname: string;
  lastname: string;
  email: string;
  signature: string;
}
export const updateMemberAction = (
  memberId: string,
  updateDetails: Member | SelfUpdate,
  isAdmin: boolean = false
): ThunkAction<Promise<Member>, {}, {}, AnyAction > => async (dispatch) => {
  dispatch({ type: MemberAction.StartUpdateRequest });

  let updatedMember: Member;
  let result;
  if (isAdmin) {
    result = await adminUpdateMember({ id: memberId, updateMemberDetails: updateDetails });
  } else {
    result = await updateMember({ id: memberId, updateMemberDetails: updateDetails });
  }

  if (isApiErrorResponse(result)) {
    dispatch({
      type: MemberAction.UpdateMemberFailure,
      error: result.error.message
    });
  } else {
    updatedMember = result.data;
    dispatch({
      type: MemberAction.UpdateMemberSuccess,
      data: updatedMember
    });
  }
  return updatedMember;
}

const defaultState: MemberState = {
  entity: undefined,
  read: {
    isRequesting: false,
    error: "",
  },
  update: {
    isRequesting: false,
    error: "",
  }
}

export const memberReducer = (state: MemberState = defaultState, action: AnyAction) => {
  let error;

  switch (action.type) {
    case MemberAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case MemberAction.GetMemberSuccess:
      const { data: member } = action;

      return {
        ...state,
        entity: member,
        read: {
          ...state.read,
          isRequesting: false,
          error: ""
        }
      };
    case MemberAction.GetMemberFailure:
      error = action.error;

      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case MemberAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      };
    case MemberAction.UpdateMemberSuccess:
      const { data: updatedMemebr } = action;

      return {
        ...state,
        entity: updatedMemebr,
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      };
    case MemberAction.UpdateMemberFailure:
      error = action.error;

      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error
        }
      }
    default:
      return state;
  }
}