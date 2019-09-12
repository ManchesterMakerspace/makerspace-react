import * as React from "react";
import { connect } from "react-redux";

import { Subscription } from "makerspace-ts-api-client";
import { CrudOperation } from "app/constants";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import { Action as CheckoutAction } from "ui/checkout/constants";
import { deleteSubscriptionAction, updateSubscriptionAction } from "ui/subscriptions/actions";


export interface UpdateSubscriptionRenderProps extends Props {
  submit: (form: Form) => void;
  setRef: (ref: Form) => void;
}
interface OwnProps {
  subscription: Partial<Subscription>;
  discountId?: string;
  membershipOptionId?: string;
  paymentMethodToken?: string;
  isOpen: boolean;
  operation: CrudOperation.Update;
  closeHandler: () => void;
  render: (renderPayload: UpdateSubscriptionRenderProps) => JSX.Element;
}
interface StateProps {
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  dispatchSubscription: () => void;
}
interface Props extends OwnProps, StateProps, DispatchProps { }

class UpdateSubscription extends React.Component<Props, {}> {
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submit = async (form: Form) => {
    await this.props.dispatchSubscription();
    if (!this.props.error) {
      return true;
    }
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submit,
      setRef: this.setFormRef,
    }
    return (
      render(renderPayload)
    )
  }
}

const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {
  let stateProps: Partial<StateProps> = {};
  const { operation } = ownProps;
  switch (operation) {
    case CrudOperation.Update:
      stateProps = state.subscriptions.update;
      break;
  }

  const { isRequesting, error } = stateProps;
  return {
    error,
    isRequesting
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const { operation, subscription, discountId, membershipOptionId, paymentMethodToken } = ownProps;
  return {
    dispatchSubscription: async () => {
      switch (operation) {
        case CrudOperation.Update:
          if (subscription) {
            await dispatch(updateSubscriptionAction(subscription.id, {
              paymentMethodToken,
            }))
          }
          break;
      }
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateSubscription);
