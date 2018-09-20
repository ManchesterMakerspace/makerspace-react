import * as React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";

import { FormControlLabel, TextField, Grid, InputAdornment, Card, CardContent, FormLabel, Select, Checkbox } from "@material-ui/core";
import { RemoveRedEye } from "@material-ui/icons";

import { Routing } from "app/constants";
import { CollectionOf } from "app/interfaces";
import { InvoiceOption } from "app/entities/invoice";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SignUpFields, EmailExistsError } from "ui/auth/constants";
import { SignUpForm } from "ui/auth/interfaces";
import { submitSignUpAction } from "ui/auth/actions";
import { buildProfileRouting } from "ui/auth/utils";
import ErrorMessage from "ui/common/ErrorMessage";
import Form from "ui/common/Form";
import { getMembershipOptionsAction } from "ui/invoices/actions";
import { Action as InvoiceAction } from "ui/invoice/constants";

interface OwnProps {
  goToLogin: () => void;
}
interface DispatchProps {
  submitSignUp: (signUpForm: SignUpForm) => void;
  getMembershipOptions: () => void;
  resetStagedInvoice: () => void;
}
interface StateProps {
  membershipOptions: CollectionOf<InvoiceOption>;
  memberId: string;
  isRequesting: boolean;
  error: string;
}
interface State {
  passwordMask: boolean;
  emailExists: boolean;
  redirect: string;
}

interface Props extends OwnProps, DispatchProps, StateProps { }

class SignUpFormComponent extends React.Component<Props, State> {
  private formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  constructor(props: Props) {
    super(props);
    this.state = {
      passwordMask: true,
      emailExists: false,
      redirect: undefined
    };
  }

  public componentDidMount() {
    this.props.getMembershipOptions();
    this.props.resetStagedInvoice();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isRequesting: wasRequesting } = prevProps;
    const { isRequesting, error, memberId } = this.props;

    if (wasRequesting && !isRequesting) {
      if (error === EmailExistsError) {
        this.setState({ emailExists: true });
      }
      if (!error && memberId) {
        this.redirectFromSignUp();
      }
    }
  }

  private redirectFromSignUp = () => {
    const { memberId } = this.props;
    const formValues = this.formRef.getValues();
    const membershipId = formValues[SignUpFields.membershipId.name];

    if (membershipId) {
      this.setState({ redirect: Routing.Checkout })
    } else {
      this.setState({ redirect: buildProfileRouting(memberId) })
    }
  }

  private togglePasswordMask = () => {
    this.setState((state) => ({ passwordMask: !state.passwordMask }));
  }

  private renderPasswordInput = (): JSX.Element => {
    const { passwordMask } = this.state;

    return (
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label={SignUpFields.password.label}
          name={SignUpFields.password.name}
          placeholder={SignUpFields.password.placeholder}
          type={passwordMask ? 'password' : 'text'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <RemoveRedEye style={{cursor: 'pointer'}} onClick={this.togglePasswordMask} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    )
  }

  private submit = async (form: Form) => {
    const validSignUp: SignUpForm = await form.simpleValidate<SignUpForm>(SignUpFields);
    
    if (!form.isValid()) return;

    this.props.submitSignUp({
      ...validSignUp,
      discount: !!validSignUp.discount 
    });
  }

  private closeNotification = () => {
    this.setState({ emailExists: false });
  }

  private renderEmailNotification = (): JSX.Element => {
    const { goToLogin } = this.props;

    return (
      <Card style={{minWidth: 275}}>
        <CardContent>
          <Form
            id="email-exists"
            title="Email already exists"
            onSubmit={goToLogin}
            submitText="Login"
            onCancel={this.closeNotification}
            cancelText="Cancel"
          >
            An account with this email already exists.  Please login to continue.
          </Form>
        </CardContent>
      </Card>
    )
  }

  private renderMembershipSelect = (): JSX.Element => {
    const { membershipOptions } = this.props;
    const options = Object.values(membershipOptions).slice();
    options.push({
      id: null,
      description: "Do later",
      amount: 0
    });
    const selectOptions = options.map((option) => (
      <option key={option.id} value={option.id}>
        {option.description}{!!option.amount && ` ($${option.amount})`}
      </option>
    ));
    return (
      <>
        <Grid item xs={12}>
          <FormLabel>{SignUpFields.membershipId.label}</FormLabel>
          <Select
            fullWidth
            id="renewal-term"
            native
            required
            placeholder={SignUpFields.membershipId.placeholder}
            name={SignUpFields.membershipId.name}
          >
            {selectOptions}
          </Select>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            name={SignUpFields.discount.name}
            label={SignUpFields.discount.label}
            control={
              <Checkbox color="primary" value={SignUpFields.discount.name}/>
            }
          />
        </Grid>
      </>
    );
  }

  public render(): JSX.Element {
    const { isRequesting, error } = this.props;
    const { emailExists, redirect } = this.state;

    if (!error && redirect) {
      return <Redirect to={redirect}/>
    }

    return (
      <Form
        ref={this.setFormRef}
        id="sign-up"
        loading={isRequesting}
        title="Become a Member"
        onSubmit={this.submit}
        submitText="Sign Up"
      >
        <Grid container spacing={16}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.firstname.label}
              name={SignUpFields.firstname.name}
              placeholder={SignUpFields.firstname.placeholder}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              label={SignUpFields.lastname.label}
              name={SignUpFields.lastname.name}
              placeholder={SignUpFields.lastname.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label={SignUpFields.email.label}
              name={SignUpFields.email.name}
              placeholder={SignUpFields.email.placeholder}
              type="email"
            />
          </Grid>
          {this.renderPasswordInput()}
          {this.renderMembershipSelect()}
        </Grid>

        {!isRequesting && error && <ErrorMessage error={error} />}
        {emailExists && this.renderEmailNotification()}
      </Form>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    currentUser: {
      id: memberId,
    },
    isRequesting,
    error
  } = state.auth;

  const { invoiceOptions: {
    membership: membershipOptions
  } } = state.invoices;

  return {
    membershipOptions,
    memberId,
    isRequesting,
    error
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    submitSignUp: (signUpForm) => dispatch(submitSignUpAction(signUpForm)),
    getMembershipOptions: () => dispatch(getMembershipOptionsAction()),
    resetStagedInvoice: () => dispatch({ type: InvoiceAction.ResetStagedInvoice })
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SignUpFormComponent);
