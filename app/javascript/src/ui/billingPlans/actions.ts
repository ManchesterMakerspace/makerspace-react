import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import toNumber from "lodash-es/toNumber";

import { getPlans } from "api/billingPlans/transactions";
import { Action as PlansAction } from "ui/billingPlans/constants";
import { PlansState } from "ui/billingPlans/interfaces";
import { BillingPlan } from "app/entities/billingPlan";

export const readPlansAction = (): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch) => {
  dispatch({ type: PlansAction.StartReadRequest });

  try {
    const response = await getPlans();
    const plans = response.data;
    const totalItems = response.headers[("total-items")];
    dispatch({
      type: PlansAction.GetPlansSuccess,
      data: {
        plans,
        totalItems: toNumber(totalItems)
      }
    });
  } catch (e) {
    const { errorMessage } = e;
    dispatch({
      type: PlansAction.GetPlansFailure,
      error: errorMessage
    });
  }
};

const defaultState: PlansState = {
  entities: {},
  read: {
    isRequesting: false,
    error: "",
    totalItems: 0,
  }
}

export const plansReducer = (state: PlansState = defaultState, action: AnyAction) => {
  switch (action.type) {
    case PlansAction.StartReadRequest:
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: true
        }
      };
    case PlansAction.GetPlansSuccess:
      const {
        data: {
          plans,
          totalItems,
        }
      } = action;

      const newPlans = {};
      plans.forEach((plan: BillingPlan) => {
        newPlans[plan.id] = plan;
      });

      return {
        ...state,
        entities: newPlans,
        read: {
          ...state.read,
          totalItems,
          isRequesting: false,
          error: ""
        }
      };
    case PlansAction.GetPlansFailure:
      const { error } = action;
      return {
        ...state,
        read: {
          ...state.read,
          isRequesting: false,
          error
        }
      }
    default:
      return state;
  }
}