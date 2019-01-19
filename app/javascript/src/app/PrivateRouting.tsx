import * as React from 'react';
import { Switch, Route, Redirect } from "react-router";

import { Routing } from "app/constants";
import NotFound from "ui/common/NotFound";
import MembersList from "ui/members/MembersList";
import RentalsList from 'ui/rentals/RentalsList';
import SubscriptionsList from 'ui/subscriptions/SubscriptionsList';
import MemberDetail from 'ui/member/MemberDetail';
import CheckoutContainer from 'ui/checkout/CheckoutContainer';
import BillingContainer from 'ui/billing/BillingContainer';
import SettingsContainer from 'ui/member/Settings';


const PrivateRouting: React.SFC<{ auth: string }> = (props) => (
  <Switch>
    <Route exact path={Routing.Members} component={MembersList} />
    <Route exact path={`${Routing.Profile}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={MemberDetail} />
    <Route exact path={`${Routing.Billing}/${Routing.PathPlaceholder.Resource}${Routing.PathPlaceholder.Optional}`} component={BillingContainer} />
    <Route exact path={Routing.Subscriptions} component={SubscriptionsList} />
    <Route exact path={Routing.Settings} component={SettingsContainer} />
    <Route exact path={Routing.Rentals} component={RentalsList} />
    <Route exact path={Routing.Checkout} component={CheckoutContainer} />
    <Redirect to={`${Routing.Members}/${props.auth}`}/>
    <Route component={NotFound} />
  </Switch>
);

export default PrivateRouting;