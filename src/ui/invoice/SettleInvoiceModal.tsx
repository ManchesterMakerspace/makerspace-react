import * as React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import { adminUpdateInvoice } from "makerspace-ts-api-client";
import { MemberInvoice, RentalInvoice, InvoiceableResourceDisplay } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import { timeToDate } from "ui/utils/timeToDate";
import useModal from "../hooks/useModal";
import useWriteTransaction from "../hooks/useWriteTransaction";
import { isInvoiceSettled } from "../invoice/utils";

interface Props {
  invoice: MemberInvoice | RentalInvoice;
  onSuccess?: () => void;
}

const SettleInvoiceModal: React.FC<Props> = ({ invoice, onSuccess }) => {
  const { isOpen, openModal, closeModal } = useModal();

  const { call, isRequesting, error, response, reset } = useWriteTransaction(adminUpdateInvoice);
  const onSubmit = React.useCallback(() => {
    call(invoice.id, { ...invoice, settled: true });
  }, [invoice, call]);

  React.useEffect(() => {
    if (isOpen && response && !isRequesting && !error) {
      closeModal();
      onSuccess();
      reset();
    }
  }, [isRequesting, error, response, isOpen, closeModal, onSuccess]);

  return (
    <>
      {isInvoiceSettled(invoice) ? "Settled" : (
        <Button
          variant="outlined"
          color="primary"
          disabled={isRequesting}
          onClick={openModal}
        >
          Mark as Paid
        </Button>
      )
      }
      {isOpen && (
        <FormModal
          id="settle-invoice"
          loading={isRequesting}
          isOpen={true}
          closeHandler={closeModal}
          title="Confirm Settlement"
          onSubmit={onSubmit}
          submitText="Confirm"
          error={error}
        >
          <Typography gutterBottom>
            Are you sure you want to manually mark this invoice as paid? This may trigger automatic renewals based on the invoice. This action cannot be reversed.
          </Typography>
          <KeyValueItem label="Responsible Party">
            <span id="settle-invoice-member">{invoice.memberName}</span>
          </KeyValueItem>
          <KeyValueItem label="Type">
            <span id="settle-invoice-amount">{InvoiceableResourceDisplay[invoice.resourceClass]}</span>
          </KeyValueItem>
          <KeyValueItem label="Amount">
            <span id="settle-invoice-amount">{`$${invoice.amount}`}</span>
          </KeyValueItem>
          <KeyValueItem label="Due Date">
            <span id="settle-invoice-due-date">{timeToDate(invoice.dueDate)}</span>
          </KeyValueItem>
        </FormModal>
      )}
    </>
  );
}


export default SettleInvoiceModal;
