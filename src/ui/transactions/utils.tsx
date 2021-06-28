import * as React from "react";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import { Transaction, TransactionStatusEnum } from "makerspace-ts-api-client";

export const renderTransactionStatus = (transaction: Transaction) => {
  let label = "Pending";
  let color = Status.Info;

  switch (transaction.status) {
    case TransactionStatusEnum.Settled:
      color = Status.Success;
      label = "Successful";
      break;
    case TransactionStatusEnum.SubmmittedForSettlement:
      color = Status.Warn;
      label = "Pending";
    case TransactionStatusEnum.Failed:
    case TransactionStatusEnum.ProcessorDeclined:
    case TransactionStatusEnum.SettlementDeclined:
    case TransactionStatusEnum.GatewayRejected:
    case TransactionStatusEnum.Voided:
      color = Status.Danger;
      label = "Failed";
      break;
    default:
      color = Status.Warn;
      label = "Unknown";
  }

  return (
    <StatusLabel label={label} color={color}/>
  );
}

export const getTransactionDescription = (transaction: Transaction) => {
  let description = "";
  if (transaction.refundedTransactionId) {
    description +=  "Refund"
  } else if (transaction.subscriptionId) {
    description += "Subscription Payment"
  } else {
    description += "Standard Payment"
  }

  if (transaction.invoice) {
    description += ` for ${transaction.invoice.name}`;
  }

  return description;
}