import * as React from 'react';
import { Switch, Route, Redirect } from "react-router-dom";

import { Routing } from "app/constants";
import LandingPage from 'ui/auth/LandingPage';
import PasswordReset from 'ui/auth/PasswordReset';
import SignUpForm from 'ui/auth/SignUpForm';
import LoginPage from 'ui/auth/LoginPage';
import UnsubscribeEmails from "ui/member/UnsubscribeEmails";


const PublicRouting: React.SFC<{ }> = () => {
  // Redirect to root if not authed and somewhere else
  return (
    <Switch >
      <Route exact path={`${Routing.PasswordReset}/:token`} component={PasswordReset} />
      <Route exact path={Routing.Login} component={LoginPage}/>
      <Route exact path={Routing.SignUp} component={SignUpForm}/>
      <Route exact path={Routing.Root} component={LandingPage} />
      <Route exact path={Routing.Unsubscribe} component={UnsubscribeEmails} />
      <Redirect to="/"/>
    </Switch>
  );
};

export default PublicRouting;