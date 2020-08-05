import * as React from "react";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { listRentals, Rental } from "makerspace-ts-api-client";

import LoadingOverlay from "../common/LoadingOverlay";
import useReadTransaction from "../hooks/useReadTransaction";
import { useAuthState } from "../reducer/hooks";

import SubscriptionDetails from "../subscriptions/SubscriptionDetails";

interface Props {
  
}

const SubscriptionSettings: React.FC<Props> = () => {
  const { currentUser } = useAuthState();
  const { subscriptionId } = currentUser;

  const [subscriptionsLoading, setSubscriptionsLoading] = React.useState({ ...subscriptionId && { [subscriptionId]: true } });
  const [subRentals, setSubRentals] = React.useState<Rental[]>([]);

  const {
    isRequesting: rentalsLoading,
    data: rentals = [],
  } = useReadTransaction(listRentals, {});

  React.useEffect(() => {
    const subs = rentals.filter(rental => !!rental.subscriptionId);
    setSubscriptionsLoading(curr => ({
      ...curr,
      ...subs.reduce((states, sub) => ({ ...states, [sub.id]: true }), {})
    }))
    setSubRentals(subs);
  }, [rentals]);

  const reportLoad = React.useCallback((subId: string) => (loadState?: boolean) => {
    setSubscriptionsLoading(curr => ({ ...curr, [subId]: !!loadState }));
  }, [setSubscriptionsLoading]);

  const isLoading = Object.values(subscriptionsLoading).some(l => l) || rentalsLoading;

  return (
    <>
      {isLoading && <LoadingOverlay id="subscription-settings" contained={true}/>}
      <Grid container style={{ ...isLoading && { display: "none" } }}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom={true}>Membership</Typography>
            <SubscriptionDetails onLoad={reportLoad(subscriptionId)} subscriptionId={subscriptionId} /> 
        </Grid>
        

        {!!subRentals.length && <Grid item xs={12}>
          <Typography variant="h4" gutterBottom={true}>Membership</Typography>
        </Grid>}
        {subRentals.map(({ subscriptionId: rentalSubId }) => (
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom={true}>Membership</Typography>
            <SubscriptionDetails onLoad={reportLoad(rentalSubId)} subscriptionId={rentalSubId} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default SubscriptionSettings