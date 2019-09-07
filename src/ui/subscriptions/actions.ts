import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import omit from "lodash-es/omit";

import { SubscriptionQueryParams } from "app/entities/subscription";
import { Action as SubscriptionsAction } from "ui/subscriptions/constants";
import { SubscriptionsState } from "ui/subscriptions/interfaces";
import { SubscriptionUpdate } from "app/entities/subscription";
import {
  Subscription,
  adminListSubscriptions,
  isApiErrorResponse,
  adminCancelSubscription,
  getSubscription,
  cancelSubscription,
  updateSubscription
} from "makerspace-ts-api-client";

export const readSubscriptionsAction = (
  queryParams?: SubscriptionQueryParams
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartReadRequest });

  const result = await adminListSubscriptions();

  if (isApiErrorResponse(result)) {
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsFailure,
      error: result.error.message
    });
  } else {
    const { data, response } = result;
    const totalItems = response.headers.get("total-items");
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsSuccess,
      data: {
        subscriptions: data,
        totalItems: Number(totalItems)
      }
    });
  }
};

export const readSubscriptionAction = (
  id: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartReadRequest });

  const result = await getSubscription(id);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: SubscriptionsAction.GetSubscriptionsSuccess,
      data: {
        subscriptions: [result.data],
      }
    });
  }
};

export const deleteSubscriptionAction = (
  subscriptionId: string,
  admin: boolean = false,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartDeleteRequest });

  const func = admin ? adminCancelSubscription : cancelSubscription;
  const result = await func(subscriptionId);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: SubscriptionsAction.DeleteFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: SubscriptionsAction.DeleteSuccess,
      data: subscriptionId
    });
  }
}

export const updateSubscriptionAction = (
  subscriptionId: string,
  subscriptionUpdate: SubscriptionUpdate,
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: SubscriptionsAction.StartUpdateRequest });

  const result = await updateSubscription(subscriptionId, subscriptionUpdate);

  if (isApiErrorResponse(result)) {
    dispatch({
      type: SubscriptionsAction.UpdateFailure,
      error: result.error.message
    });
  } else {
    dispatch({
      type: SubscriptionsAction.UpdateSuccess,
      data: subscriptionId
    });
  }
};

const defaultState: SubscriptionsState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  },
  delete: {
    isRequesting: false,
    error: ""
  },
  update: {
    isRequesting: false,
    error: ""
  }
}

export const subscriptionsReducer = (state: SubscriptionsState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case SubscriptionsAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case SubscriptionsAction.GetSubscriptionsSuccess:
      const {
        data: {
          subscriptions,
          totalItems,
        }
      } = action;

      const newSubs = {};
      subscriptions.forEach((sub: Subscription) => {
        newSubs[sub.id] = sub;
      });

      return {
        ...state,
        entities: newSubs,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case SubscriptionsAction.GetSubscriptionsFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    case SubscriptionsAction.StartDeleteRequest:
      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: true
        }
      };
    case SubscriptionsAction.DeleteSuccess:
      return {
        ...state,
        entities: omit(state.entities, [action.data]),
        delete: {
          ...state.delete,
          isRequesting: false,
          error: ""
        }
      };
    case SubscriptionsAction.DeleteFailure:
      const deleteError = action.error;

      return {
        ...state,
        delete: {
          ...state.delete,
          isRequesting: false,
          error: deleteError,
        }
      }
    case SubscriptionsAction.StartUpdateRequest:
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: true
        }
      }
    case SubscriptionsAction.UpdateSuccess:
      const updatedSub = action.data;

      return {
        ...state,
        entities: {
          ...state.entities,
          [updatedSub.id]: updatedSub
        },
        update: {
          ...state.update,
          isRequesting: false,
          error: ""
        }
      }
    case SubscriptionsAction.UpdateFailure:
      const updateError = action.error;
      return {
        ...state,
        update: {
          ...state.update,
          isRequesting: false,
          error: updateError
        }
      }
    default:
      return state;
  }
}