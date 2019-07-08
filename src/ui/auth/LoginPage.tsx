import * as React from 'react';
import { push } from "connected-react-router";

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';

import LoginForm from "ui/auth/LoginForm";
import { Routing } from 'app/constants';
import { connect } from 'react-redux';
import { ScopedThunkDispatch } from 'ui/reducer';
import Logo from "-!react-svg-loader!assets/FilledLaserableLogo.svg";

interface DispatchProps {
  goToRegister: () => void;
}
class LoginPage extends React.Component<DispatchProps> {
  public render() {

    return (
      <Grid container spacing={24}>
        <Hidden smDown>
          <Grid item md={6} sm={12} id="landing-page-graphic">
            <Logo style={{ width: '100%', height: '200px' }} alt="Manchester Makerspace" viewBox="0 0 960 580"/>
          </Grid>
        </Hidden>

        <Grid item md={6} sm={12}>
          <Grid container justify="center" spacing={24}>
            <Grid item xs={12}>
              <Card style={{ minWidth: 275 }}>
                <CardContent>
                  <LoginForm/>
                </CardContent>
              </Card>
            </Grid>
            <Grid item container xs={12} justify="center" alignItems="center">
              <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={this.props.goToRegister}>
                Register
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    goToRegister: () => dispatch(push(Routing.Root))
  }
}
export default connect(null, mapDispatchToProps)(LoginPage);