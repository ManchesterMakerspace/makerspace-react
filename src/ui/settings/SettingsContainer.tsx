import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import { Whitelists } from "app/constants";
import { useAuthState } from "../reducer/hooks";
import SubscriptionDetails from "../subscriptions/SubscriptionDetails";
import ManageRentalSubscriptions from "../subscriptions/ManageRentalSubscriptions";
import EditMember from "ui/member/EditMember";
import { getMember, Member } from "makerspace-ts-api-client";
import useReadTransaction from "ui/hooks/useReadTransaction";
import LoadingOverlay from "ui/common/LoadingOverlay";


const SettingsContainer: React.FC = () => {
  const { currentUser: { id: currentUserId }, permissions } = useAuthState();
  const billingEnabled = !!permissions[Whitelists.billing];
  const [selectedIndex, setIndex] = React.useState(0);
  const {
    isRequesting: loadingMember,
    data: member = { id: currentUserId } as Member,
  } = useReadTransaction(getMember, { id: currentUserId });

  return (
    <Grid container spacing={16}>
      <Grid item md={4} sm={5} xs={12}>
        <List component="nav">
          <ListItem button selected={selectedIndex === 0} onClick={() => setIndex(0)}>
            <ListItemText id="settings-profile" primary="Personal Information" />
          </ListItem>
          {billingEnabled && (
            <>
              <ListItem button selected={selectedIndex === 1} onClick={() => setIndex(1)}>
                <ListItemText id="settings-membership" primary="Subscriptions" />
              </ListItem>
              <ListItem button selected={selectedIndex === 2} onClick={() => setIndex(2)}>
                <ListItemText id="settings-payment-methods" primary="Payment Methods" />
              </ListItem>
            </>
          )}
        </List>
      </Grid>
      <Grid item md={8} sm={7} xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={16}>
              <Grid item xs={12}>
                {selectedIndex === 0 && (
                  <>
                    {loadingMember && <LoadingOverlay id="settings-loading" />}
                    <EditMember formOnly={true} member={member} />
                  </>
                )}
                {selectedIndex === 1 && (
                  <Grid container spacing={16}>
                    <Grid item xs={12}>
                      <SubscriptionDetails memberId={currentUserId} />
                    </Grid>
                    <Grid item xs={12}>
                      <ManageRentalSubscriptions />
                    </Grid>
                  </Grid>
                )}
                {selectedIndex === 2 && (
                  <PaymentMethodsContainer title="Manage Payment Methods" managingMethods={true} />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SettingsContainer;
