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


class DeleteInvoiceModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, invoice } = this.props;

    return invoice ? (
      <FormModal
        formRef={this.setFormRef}
        id="delete-invoice-confirm"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title="Delete Invoice"
        onSubmit={onSubmit}
        submitText="Delete"
        error={error}
      >
        <Typography gutterBottom>
          Are you sure you want to delete this invoice?
        </Typography>
        <KeyValueItem label="Contact">
          {invoice.contact}
        </KeyValueItem>
        <KeyValueItem label="Amount">
          {`$${invoice.amount}`}
        </KeyValueItem>
        <KeyValueItem label="Due Date">
          {timeToDate(invoice.dueDate)}
        </KeyValueItem>
      </FormModal>
    ) : null;
  }
}

export default DeleteInvoiceModal;
