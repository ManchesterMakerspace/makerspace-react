import * as React from "react";
import useReactRouter from "use-react-router";

import { getReceipt, isApiErrorResponse } from "makerspace-ts-api-client";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";

import { buildProfileRouting } from "ui/member/utils";
import { useAuthState } from "../reducer/hooks";
import { ActionButton } from "../common/ButtonRow";
import LoadingOverlay from "../common/LoadingOverlay";
import ErrorMessage from "../common/ErrorMessage";

const buildReceiptUrl = (id: string) => `${process.env.BASE_URL || ""}/api/billing/receipts/${id}`;
const receiptContainerId = "receipt-container";

const Receipt: React.FC = () => {
  const { currentUser: { id: userId } } = useAuthState();
  const { history, match: { params: { invoiceId } } } = useReactRouter();
  const goToProfile = React.useCallback(() => history.push(buildProfileRouting(userId)), [history, userId]);
  const printReceipt = React.useCallback(() => {
    window.frames[receiptContainerId].focus();
    window.frames[receiptContainerId].print();
  }, [window.frames]);
  const [loading, setLoading] = React.useState(true);

  return (
    <>
      <Grid container spacing={16}>
        <Grid item sm={6} xs={12}>
          <Typography variant="h4">Thank you for your purchase!</Typography>
          <Typography variant="subheading">Details regarding your purchase can be found below.</Typography>
        </Grid>
        <Grid item sm={6} xs={12}>
          <ActionButton 
            id="return-to-profile" 
            variant="outlined" 
            style={{float: "right"}} 
            color="primary" 
            label="Return to profile"
            onClick={goToProfile}
          />
          <ActionButton
            label="Print Receipt"
            style={{float: "right"}} 
            color="primary"
            variant="contained"
            onClick={printReceipt}
          />
        </Grid>
      </Grid>
      <Card style={{ height: "75vh" }}>
        <CardContent style={{ height: "100%" }}>
          <Grid container spacing={16} style={{ height: "100%" }}>
            <Grid item xs={12} style={{ height: "100%" }}>
              {loading && <LoadingOverlay id="receipt-loading" />}
              <iframe 
                id={receiptContainerId} 
                name={receiptContainerId}
                src={buildReceiptUrl(invoiceId)} 
                style={{ height: "100%", width: "100%" }}
                onLoad={() => setLoading(false)}
                frameBorder={0}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  )
}

export default Receipt;