import * as React from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";

import { MemberInvoice, RentalInvoice } from "app/entities/invoice";
import { CollectionOf } from "app/interfaces";
import { Invoice } from "makerspace-ts-api-client";
import { Routing } from "app/constants";

import { Action as CheckoutAction } from "ui/checkout/constants";
import { ScopedThunkDispatch } from "ui/reducer";
import InvoicesTable from "./InvoicesTable";

interface DispatchProps {
  resetStagedInvoices: () => void;
  stageInvoices: (invoices: CollectionOf<MemberInvoice | RentalInvoice>) => void;
  goToCheckout: () => void;
}
interface Props extends DispatchProps { }


class InvoicesListComponent extends React.Component<Props> {

  private goToCheckout = (selectedInvoices: Invoice[]) =>  {
    const { resetStagedInvoices, stageInvoices, goToCheckout } = this.props;
    const mappedInvoices = selectedInvoices.reduce((mapped, invoice) => {
      mapped[invoice.id] = invoice;
      return mapped;
    }, {});
    resetStagedInvoices();
    stageInvoices(mappedInvoices);
    goToCheckout();  
  }

  public render(): JSX.Element {
    return (
      <InvoicesTable 
        stageInvoices={this.goToCheckout}
      />
    );
  }
}


const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    resetStagedInvoices: () => dispatch({
      type: CheckoutAction.ResetStagedInvoices
    }),
    stageInvoices: (invoices) => dispatch({
      type: CheckoutAction.StageInvoicesForPayment,
      data: invoices
    }),
    goToCheckout: () => dispatch(push(Routing.Checkout)),
  }
}


export default connect(null, mapDispatchToProps)(InvoicesListComponent);
