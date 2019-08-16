import * as React from "react";
import Typography from "@material-ui/core/Typography";

import { Transaction } from "makerspace-ts-api-client";
import FormModal from "ui/common/FormModal";
import KeyValueItem from "ui/common/KeyValueItem";
import Form from "ui/common/Form";
import { timeToDate } from "ui/utils/timeToDate";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";

interface OwnProps {
  transaction: Partial<Transaction>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  isAdmin: boolean;
  onClose: () => void;
  onSubmit: (form: Form) => void;
}


class DeleteTransactionModal extends React.Component<OwnProps, {}> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, transaction, isAdmin } = this.props;

    const title = isAdmin ? "Refund Transaction" : "Request Refund";
    const text = isAdmin ? (
      <span>
          Are you sure you want to refund this transaction?
      </span>
    ) : (
      <span>
        Would you like to request a refund for this transaction?
        <br/>
        An administrator will review the request and notify you of a decision. Please note, requests for refunds are evaluated on a case by case basis and are not guaranteed.
      </span>
    );

    return transaction ? (
      <FormModal
        formRef={this.setFormRef}
        id="refund-transaction"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={title}
        onSubmit={onSubmit}
        error={error}
      >
        <Typography gutterBottom>
          {text}
        </Typography>
        <KeyValueItem label="Date">
          <span id="refund-transaction-date">{timeToDate(transaction.createdAt)}</span>
        </KeyValueItem>
        <KeyValueItem label="Amount">
          <span id="refund-transaction-amount">{numberAsCurrency(Number(transaction.amount) - Number(transaction.discountAmount))}</span>
        </KeyValueItem>
        { isAdmin && transaction.memberName &&
          <KeyValueItem label="Member">
            <span id="refund-transaction-member">{transaction.memberName}</span>
          </KeyValueItem>}
        { transaction.invoice &&
          <KeyValueItem label="Description">
            <span id="refund-transaction-description">{transaction.invoice.description}</span>
          </KeyValueItem>
        }
      </FormModal>
    ) : null;
  }
}

export default DeleteTransactionModal;
