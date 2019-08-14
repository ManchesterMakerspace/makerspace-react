import * as React from "react";
import isString from "lodash-es/isString";

import Grid from "@material-ui/core/Grid";

//@ts-ignore
import * as Braintree from "braintree-web";

import Form from "ui/common/Form";
import { CreditCardFields } from "ui/checkout/constants";
import ErrorMessage from "ui/common/ErrorMessage";
import HostedInput from "ui/checkout/HostedInput";
import { createPaymentMethod, isApiErrorResponse } from "makerspace-ts-api-client";

interface OwnProps {
  braintreeInstance: any;
  clientToken: string;
  toggleLoading: (on: boolean) => void;
  closeHandler: () => void;
  onSuccess?: (paymentMethodNonce: string) => void;
}

interface Props extends OwnProps {}

interface State {
  hostedFieldsInstance: any;
  braintreeError: Braintree.BraintreeError | string;
}

class CreditCardForm extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      hostedFieldsInstance: undefined,
      braintreeError: undefined,
    }
  }

  public componentDidMount() {
    this.props.braintreeInstance && this.initHostedFields();
  }

  public componentDidUpdate(prevProps: Props) {
    const { braintreeInstance } = this.props;
    const { braintreeInstance: prevBraintreeInstance } = prevProps;
    if (!prevBraintreeInstance && braintreeInstance) {
      this.initHostedFields();
    }
  }

  private initHostedFields = async () => {
    const { braintreeInstance, toggleLoading } = this.props;
    toggleLoading(true);
    try {
      await Braintree.hostedFields.create({
        client: braintreeInstance,
        styles: {},
        fields: {
          number: {
            selector: `#${CreditCardFields.cardNumber.name}`,
            placeholder: CreditCardFields.cardNumber.placeholder
          },
          cvv: {
            selector: `#${CreditCardFields.csv.name}`,
            placeholder: CreditCardFields.csv.placeholder
          },
          expirationDate: {
            selector: `#${CreditCardFields.expirationDate.name}`,
            placeholder: CreditCardFields.expirationDate.placeholder,
          },
          postalCode: {
            selector: `#${CreditCardFields.postalCode.name}`,
            placeholder: CreditCardFields.postalCode.placeholder,
          },
        }
      }, (err, hostedFieldsInstance) => {
        if (err) throw err;
        this.setState({ hostedFieldsInstance: hostedFieldsInstance });
      });
    } catch (err) {
      this.setState({ braintreeError: err });
    } finally {
      toggleLoading(false);
    }
  }

  public requestPaymentMethod = () => {
    const { hostedFieldsInstance } = this.state;
    const { toggleLoading } = this.props;

    if (hostedFieldsInstance) {
      toggleLoading(true);
      hostedFieldsInstance.tokenize(async (err: Braintree.BraintreeError, payload:{ [key: string]: string }) => {
        if (err) {
          this.setState({ braintreeError: err });
          toggleLoading(false);
        } else {
          const result = await createPaymentMethod({ payment_method_nonce: payload.nonce, make_default: true });

          if (isApiErrorResponse(result)) {
            this.setState({ braintreeError: result.error.message });
          } else {
            this.props.onSuccess && this.props.onSuccess(result.data.id);
            this.setState({ braintreeError: undefined });
          }
          toggleLoading(false);
        }
      });
    }
  }

  public render(): JSX.Element {
    const { braintreeError } = this.state;
    const error = braintreeError && (isString(braintreeError) ? braintreeError : braintreeError.message);

    return (
      <>
        <Form
          onSubmit={this.requestPaymentMethod}
          onCancel={this.props.closeHandler}
          id="credit-card-form"
          title="Enter your credit or debit card information"
        >
          <HostedInput
            label={CreditCardFields.cardNumber.label}
            id={CreditCardFields.cardNumber.name}
          />
          <Grid container spacing={24}>
            <Grid item xs={6}>
              <HostedInput
                label={CreditCardFields.expirationDate.label}
                id={CreditCardFields.expirationDate.name}
              />
            </Grid>
            <Grid item xs={6}>
              <HostedInput
                label={CreditCardFields.csv.label}
                id={CreditCardFields.csv.name}
              />
            </Grid>
          </Grid>
          <HostedInput
            label={CreditCardFields.postalCode.label}
            id={CreditCardFields.postalCode.name}
          />
          {error && <ErrorMessage error={error} id="credit-card-error"/>}
        </Form>
      </>
    )
  }
}

export default CreditCardForm;