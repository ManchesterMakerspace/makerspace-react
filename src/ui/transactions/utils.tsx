import * as React from "react";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import { Transaction, TransactionStatusEnum } from "makerspace-ts-api-client";

export const renderTransactionStatus = (transaction: Transaction) => {
  let label = "Pending";
  let color = Status.Info;
  console.error("transaction.stat", transaction.status);

  switch (transaction.status) {
    case TransactionStatusEnum.Settled:
      color = Status.Success;
      label = "Successful";
      break;
    case "submitted_for_settlement" as TransactionStatusEnum:
      color = Status.Warn;
      label = "Pending";
      break;
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
      break;
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