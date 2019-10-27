import * as React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { listRentals } from "makerspace-ts-api-client";

import { useAuthState } from "../reducer/hooks";
import useReadTransaction from "../hooks/useReadTransaction";
import LoadingOverlay from "../common/LoadingOverlay";
import ErrorMessage from "../common/ErrorMessage";
import SubscriptionDetails from "../subscriptions/SubscriptionDetails";
import { Grid } from "@material-ui/core";

const ManageRentalSubscriptions: React.FC = () => {
  const { currentUser: { id: memberId } } = useAuthState();

  const {
    isRequesting: rentalsLoading,
    data: rentals = [],
    error: rentalsError,
  } = useReadTransaction(listRentals);;

  const subscriptionRentals = rentals.filter(rental => !!rental.subscriptionId);
  const fallbackUI = (rentalsLoading && <LoadingOverlay  id="manage-rental-subscription-loading" contained={true}/>)
                    || (rentalsError && <ErrorMessage error={rentalsError} />);

  if (!rentalsLoading && !rentalsError && !(subscriptionRentals.length && subscriptionRentals.some(r => !!r.subscriptionId))) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        {fallbackUI || (
          <>
            <Typography variant="h4" gutterBottom={true}>Rentals</Typography>
            {subscriptionRentals.map(rental => (
              <Grid style={{ padding: "1em", border: "1px solid black", borderRadius: "3px" }}>
                <SubscriptionDetails memberId={memberId} key={rental.id} rentalSubId={rental.subscriptionId} />
              </Grid>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ManageRentalSubscriptions;
