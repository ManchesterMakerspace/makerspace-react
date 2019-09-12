import * as React from "react";
import { connect } from "react-redux";
import useReactRouter from "use-react-router";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";

import { createInvoice } from "makerspace-ts-api-client";
import { Routing } from "app/constants";

import { ScopedThunkDispatch } from "ui/reducer";
import SignUpFormComponent from "ui/auth/SignUpForm";
import { SignUpForm } from "ui/auth/interfaces";
import { submitSignUpAction } from "ui/auth/actions";
import { billingEnabled } from "app/constants";
import { push } from "connected-react-router";
import { useBillingState, useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";


interface Props {
  submitSignUp: (signUpForm: SignUpForm) => void;
  goToLogin: () => void;
}

const SignUpWrapper: React.FC<Props> = ({ goToLogin, submitSignUp }) => {
  const [{ selectedOption }] = useBillingState();
  const { isRequesting, error } = useAuthState();
  const { location } = useReactRouter();

  const { call } = useWriteTransaction(createInvoice);

  const onSubmit = React.useCallback(async (validSignUp: SignUpForm) => {
    await submitSignUp(validSignUp);
    if (selectedOption) {
      await call(selectedOption);
    }
  }, [call, submitSignUp, selectedOption]);

  return (
    <Grid container justify="center" spacing={16}>
      <Grid item md={10} xs={12}>
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Card style={{ minWidth: 275 }}>
              <CardContent>
                <SignUpFormComponent
                  goToLogin={goToLogin}
                  onSubmit={onSubmit}
                  isRequesting={isRequesting}
                  error={error}
                  renderMembershipOptions={billingEnabled}
                  selectedOption={selectedOption}
                  location={location}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={goToLogin}>
              Already a Member? Login
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}


class SignUpContainer extends React.Component<Props>{
  public render(): JSX.Element {

    return <SignUpWrapper {...this.props} />
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): Props => {
  return {
    submitSignUp: (signUpForm) => dispatch(submitSignUpAction(signUpForm)),
    goToLogin: () => dispatch(push(Routing.Login)),
  };
}

export default connect(null, mapDispatchToProps)(SignUpContainer);