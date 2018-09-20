import * as React from 'react';
import { Switch, Route, Redirect } from "react-router";

import { Routing } from "app/constants";
import LandingPage from 'ui/auth/LandingPage';
import CheckoutContainer from 'ui/checkout/CheckoutContainer';
import { AuthDisplayOption } from 'ui/auth/constants';

const PublicRouting: React.SFC<{}> = () => {
  // Redirect to root if not authed and somewhere else
  return (
    <Switch >
      <Route exact path={Routing.Checkout} component={CheckoutContainer} />
      <Route exact path={Routing.Login} 
        render={(props) => <LandingPage {...props} defaultView={AuthDisplayOption.Login} />} />
      <Route exact path={Routing.SignUp} 
        render={(props) => <LandingPage {...props} defaultView={AuthDisplayOption.SignUp} />} />
      <Route exact path={Routing.Root} component={LandingPage} />
      <Redirect to="/"/>
    </Switch>
  );
};

export default PublicRouting;