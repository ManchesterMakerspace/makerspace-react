import * as React from 'react';
import { Redirect } from 'react-router';

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';

import { Routing, Whitelists } from "app/constants";
import MembershipSelectForm from 'ui/membership/MembershipSelectForm';
const { billingEnabled } = Whitelists;

interface State {
  redirect: string;
  membershipOptionId: string;
  discountId: string;
}
interface OwnProps  {}
interface StateProps {}
interface DispatchProps {}
interface Props extends OwnProps, StateProps, DispatchProps {}

class LandingPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      redirect: undefined,
      membershipOptionId: undefined,
      discountId: undefined,
    }
  }

  private selectMembershipOption = (membershipOptionId: string) => {
    this.setState({ membershipOptionId });
    this.goToSignup();
  }

  private goToSignup = () =>{
    this.setState({ redirect: Routing.SignUp });
  }

  private selectMembershipDiscount = (discountId: string) => {
    this.setState({ discountId });
  }

  public render(): JSX.Element {
    const { membershipOptionId, redirect, discountId } = this.state;
    if (redirect) {
      return <Redirect to={{
        pathname: redirect,
        ...membershipOptionId && {
          state: { membershipOptionId, discountId }
        }
      }}/>;
    }
    return (
      <Grid container spacing={24} justify="center">
        <Grid item xs={10}>
          <Card style={{ minWidth: 275 }}>
            <CardContent>
              <Grid container spacing={24}>

                <Grid item md={6} sm={12} style={{ width: '100%', height: '200px' }}>
                  <Grid id="landing-page-graphic"></Grid>
                </Grid>

                <Grid item md={6} sm={12}>
                    <Typography variant="subheading">
                      Manchester Makerspace is a non-profit collaborative organization of members who maintain a shared workspace, tooling, and skills in the Manchester, NH community. We will provide access to shared resources, training, and mentorship for the benefit of Manchester’s local entrepreneurs, makers, and artists of all ages.
                  </Typography>
                </Grid>

              </Grid>
              <Grid container spacing={24} justify="center">
                {billingEnabled && <Grid item xs={12}>
                  <Typography variant="headline">
                    To get started, first select a membership option.
                  </Typography>
                  <MembershipSelectForm title="" membershipOptionId={membershipOptionId} discountId={discountId} onSelect={this.selectMembershipOption} onDiscount={this.selectMembershipDiscount} />
                </Grid>}
                {!billingEnabled && <Grid item md={6} xs={12}>
                  <Typography variant="subheading" align="center">
                    Please take a moment to register with our online portal.
                  </Typography>
                  <Button id="register" variant="outlined" color="secondary" fullWidth onClick={this.goToSignup}>
                    Register
                  </Button>
                </Grid>}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default LandingPage;