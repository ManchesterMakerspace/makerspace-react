import * as React from "react";
import useReactRouter from "use-react-router";
import Grid from "@material-ui/core/Grid";

import { listInvoices, Invoice } from "makerspace-ts-api-client";

import useReadTransaction from "../hooks/useReadTransaction";
import { isInvoicePayable } from "../invoice/utils";
import FormModal from "../common/FormModal";
import { buildProfileRouting } from "../member/utils";
import { useAuthState } from "../reducer/hooks";
import { useUUID } from "../hooks/useUUID";

const DuplicateInvoiceModal: React.FC<{ type: string }> = ({ type }) => {
  const uuid = useUUID();
  const { data: invoices = [] } = useReadTransaction(listInvoices, {}, undefined, uuid);
  const { currentUser: { id: currentUserId } } = useAuthState();
  const [outstandingInvoice, setOutstandingInvoice] = React.useState<Invoice>();

  const { history } = useReactRouter();
  const goToProfile = React.useCallback(() => history.push(buildProfileRouting(currentUserId)), [history, currentUserId]);
  React.useEffect(() => {
    const outstandingInvoiceOfType = invoices.find(invoice => isInvoicePayable(invoice) && invoice.resourceClass === type);
    setOutstandingInvoice(outstandingInvoiceOfType);
  }, [invoices, setOutstandingInvoice, type]);

  if (!outstandingInvoice) { return null; }
  return (
    <FormModal
      id="outstanding-invoice"
      onSubmit={goToProfile}
      closeHandler={() => setOutstandingInvoice(undefined)}
      cancelText="Ignore"
      submitText="View Dues"
      title="Existing Dues Found"
      isOpen={true}
    >
      <Grid container spacing={16}>
        <Grid item xs={12}>
          { "We found existing outstanding dues matching your selection category. \
          This may cause issues trying to purchase additional items of this type. \
          Would you like to view your outstanding dues?" }
        </Grid>
        <Grid item xs={12}>
          If you're having trouble with your dues, please don't hesitate to <a href="mailto:contact@manchestermakerspace.org">contact us</a>.
        </Grid>
      </Grid>

    </FormModal>
  )
};

export default DuplicateInvoiceModal;
