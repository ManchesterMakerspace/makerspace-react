import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import CartList from "./CartList";

const CheckoutPage: React.FC = () => {
  const [paymentMethodId, setPaymentMethodId] = React.useState<string>();
  return (
    <Grid container spacing={16}>
      <Grid item sm={5} xs={12}>
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <PaymentMethodsContainer
                  onPaymentMethodChange={setPaymentMethodId}
                />
                <p>*The payment method used when creating a subscription will be the default payment method used for subscription payments unless changed through Settings.</p>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item sm={7} xs={12}>
        <CartList paymentMethodId={paymentMethodId} />
      </Grid>
    </Grid>
  );
};

export default CheckoutPage;