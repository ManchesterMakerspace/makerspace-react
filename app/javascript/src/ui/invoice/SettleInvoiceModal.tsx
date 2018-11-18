import * as React from "react";
import Typography from "@material-ui/core/Typography";

import { Invoice } from "app/entities/invoice";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
import { timeToDate } from "ui/utils/timeToDate";

interface OwnProps {
  invoice: Partial<Invoice>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class SettleInvoiceModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, invoice } = this.props;

    return invoice ? (
      <FormModal
        formRef={this.setFormRef}
        id="settle-invoice-confirm"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Confirm Settlement"
        onSubmit={onSubmit}
        submitText="Confirm"
        error={error}
      >
        <Typography gutterBottom>
          Are you sure you want to manually settle this invoice?  This action cannot be reversed.
        </Typography>
        <KeyValueItem label="Contact">
          <span id="settle-invoice-contact">{invoice.contact}</span>
        </KeyValueItem>
        <KeyValueItem label="Amount">
          <span id="settle-invoice-amount">{`$${invoice.amount}`}</span>
        </KeyValueItem>
        <KeyValueItem label="Due Date">
          <span id="settle-invoice-due-date">{timeToDate(invoice.dueDate)}</span>
        </KeyValueItem>
      </FormModal>
    ) : null;
  }
}

export default SettleInvoiceModal;
