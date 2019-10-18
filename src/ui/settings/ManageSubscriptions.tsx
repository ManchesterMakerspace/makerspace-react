import * as React from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import ManageRentalSubscriptions from "./ManageRentalSubscriptions";
import SubscriptionDetails from "../subscriptions/SubscriptionDetails";
import { useAuthState } from "../reducer/hooks";

const ManageSubscriptions: React.FC = () => {
  const { currentUser: { id: currentUserId } } = useAuthState();

  return (
    <Grid container spacing={24}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom={true}>Membership</Typography>
              <SubscriptionDetails memberId={currentUserId}/>
          </CardContent>
        </Card>
        <ManageRentalSubscriptions/>
      </Grid>
    </Grid>
  )
}

export default ManageSubscriptions;
