import * as React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import TableBody from '@material-ui/core/TableBody';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Link from "@material-ui/core/Link";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { CollectionOf } from "app/interfaces";
import { InvoiceableResourceDisplay, isMemberInvoice, MemberInvoice, RentalInvoice } from "app/entities/invoice";
import { isEmpty } from "lodash-es";
import { buildProfileRouting, displayMemberExpiration } from "ui/member/utils";
import { Routing } from "app/constants";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import { timeToDate } from "ui/utils/timeToDate";
import PaymentMethodComponent from "ui/checkout/PaymentMethod";
import { Action } from "ui/checkout/constants";
import { renderTransactionStatus } from "ui/transactions/utils";
import { Transaction } from "makerspace-ts-api-client";


interface DispatchProps {
  pushLocation: (location: string) => void;
  resetCheckoutState: () => void;
}
interface StateProps {
  transactions: CollectionOf<Transaction>;
  invoices: CollectionOf<MemberInvoice | RentalInvoice>;
  userId: string;
}
interface OwnProps {}
type Props = DispatchProps & StateProps & OwnProps;

class Receipt extends React.Component<Props> {

  public componentDidMount(): void {
    const { transactions, userId } = this.props;
    if (isEmpty(transactions)) {
      const redirectPath = userId ? buildProfileRouting(userId) : Routing.Login;
      this.props.pushLocation(redirectPath);
    }
  }

  public componentWillUnmount() {
    this.props.resetCheckoutState();
  }

  private renderGeneralReceipt = (transaction: Transaction) => {
    const { creditCardDetails, paypalDetails, subscriptionDetails, invoice } = transaction;
    const paymentMethodDetails = creditCardDetails || paypalDetails;
    const invoiceType = invoice && InvoiceableResourceDisplay[invoice.resourceClass];
    const id =`transaction-${transaction.id}`;
    return (
      <Table id={id} key={id}>
        <TableBody>
          {transaction && (
            <>
              <TableRow>
                <TableCell>Transaction Date</TableCell>
                <TableCell>{timeToDate(transaction.createdAt)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>{renderTransactionStatus(transaction)}</TableCell>
              </TableRow>
            </>
          )}
          {invoice && (
            <>
              <TableRow>
                <TableCell>{invoiceType}</TableCell>
                <TableCell>
                  {isMemberInvoice(invoice)
                    ? `${invoice.member.firstname} ${invoice.member.lastname}`
                    : invoice.rental.number}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>{invoiceType} expiration</TableCell>
                <TableCell>
                  {isMemberInvoice(invoice) ? displayMemberExpiration(invoice.member) : invoice.rental.expiration}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>{invoice.name}</TableCell>
              </TableRow>
            </>
          )}
          {subscriptionDetails && (
            <>
              <TableRow>
                <TableCell>Billing Period Start Date</TableCell>
                <TableCell>{timeToDate(subscriptionDetails.billingPeriodStartDate)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Billing Period End Date</TableCell>
                <TableCell>{timeToDate(subscriptionDetails.billingPeriodEndDate)}</TableCell>
              </TableRow>
            </>
          )}
          {paymentMethodDetails && (
            <TableRow>
              <TableCell>Payment Method</TableCell>
              <TableCell>
                <PaymentMethodComponent {...paymentMethodDetails} />
              </TableCell>
            </TableRow>
          )}
          {invoice && (
            <>
              <TableRow>
                <TableCell>{transaction.recurring ? "Recurring payment amount" : "Amount"}</TableCell>
                <TableCell>{numberAsCurrency(invoice.amount)}</TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    );
  }

  private goToProfile = () => {
    this.props.pushLocation(buildProfileRouting(this.props.userId));
  }

  public render(): JSX.Element {
    const { transactions, userId } = this.props;

    return (
      <>
        <Grid container spacing={16}>
          <Grid item sm={6} xs={12}>
            <Typography variant="h4">Thank you for your purchase!</Typography>
            <Typography variant="subheading">Details regarding your purchase can be found below.</Typography>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Button id="return-to-profile" variant="outlined" style={{float: "right"}} color="primary" onClick={this.goToProfile}>Return to profile</Button>
          </Grid>
        </Grid>
        {(Object.values(transactions).map(transaction => (
          <Card style={{ height: "100%" }} key={transaction.id}>
            <CardContent>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  {this.renderGeneralReceipt(transaction)}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )))}
        <Grid container spacing={16}>
          <Grid item xs={12}>
            <Typography variant="subheading">
              <Link href={buildProfileRouting(userId)}>Click here to view more details for your purchase.</Link>
            </Typography>
            <Typography variant="subheading">
              If you have any other questions, please
              <Link href={`mailto:contact@manchestermakerspace.org?subject=Re:%20Transactions%20#%20${Object.keys(transactions).join(", ")}`}> contact us.</Link>
            </Typography>
          </Grid>
        </Grid>
      </>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const { transactions, invoices } = state.checkout;
  const { currentUser: { id: userId } } = state.auth;
  return {
    invoices,
    transactions,
    userId,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    pushLocation: (location) => dispatch(push(location)),
    resetCheckoutState: () => dispatch({ type: Action.ResetStagedInvoices }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Receipt);