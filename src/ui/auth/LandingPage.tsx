import * as React from 'react';
import useReactRouter from "use-react-router";

import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';

import Logo from "-!react-svg-loader!assets/FilledLaserableLogo.svg";

import { Routing } from "app/constants";
import MembershipSelectForm, { invoiceOptionParam, discountParam } from 'ui/membership/MembershipSelectForm';
import { InvoiceOption } from 'makerspace-ts-api-client';
import InvoicingGate from '../membership/InvoicingGate';


const LandingPage: React.FC = () => {
  const { history, location: { search } } = useReactRouter();
  const goToSignup = React.useCallback<(option?: InvoiceOption, discountId?: string) => void>((option, discountId) => {
    const searchParams = new URLSearchParams(search);
    const optionId = option && option.id;
    optionId ? searchParams.set(invoiceOptionParam, optionId) : searchParams.delete(invoiceOptionParam);
    discountId ? searchParams.set(discountParam, discountId) : searchParams.delete(discountParam);
    if (option) {
      history.push({
        search: searchParams.toString(),
        pathname: Routing.SignUp
      });
    }
  }, [history, search]);

  return (
    <Grid container spacing={24} justify="center">
      <Grid item xs={10}>
        <Card style={{ minWidth: 275 }}>
          <CardContent>
            <Grid container spacing={24}>
              <Grid item md={6} sm={12} id="landing-page-graphic">
                <Logo style={{ width: "100%", height: "200px" }} alt="Manchester Makerspace" viewBox="0 0 960 580" />
              </Grid>

              <Grid item md={6} sm={12}>
                <Typography variant="subtitle1">
                  Manchester Makerspace is a non-profit collaborative organization of members who maintain a shared
                  workspace, tooling, and skills in the Manchester, NH community. We will provide access to shared
                  resources, training, and mentorship for the benefit of Manchester’s local entrepreneurs, makers, and
                  artists of all ages.
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={24} justify="center">
              <InvoicingGate>
                { (open) => open ? (
                  <Grid item xs={12}>
                    <Typography variant="h5">To get started, first select a membership option.</Typography>
                    <MembershipSelectForm onSelect={goToSignup} allowNone={true} />
                  </Grid>
                ) : (
                  <Grid item md={6} xs={12}>
                    <Typography variant="subtitle1" align="center">
                      Please take a moment to register with our online portal.
                    </Typography>
                    <Button id="register" variant="outlined" color="secondary" fullWidth onClick={() => goToSignup()}>
                      Register
                    </Button>
                  </Grid>
                )}
              </InvoicingGate>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LandingPage;
