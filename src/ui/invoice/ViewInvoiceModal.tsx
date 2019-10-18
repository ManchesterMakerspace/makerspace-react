import * as React from "react";
import Typography from "@material-ui/core/Typography";
import useModal from "../hooks/useModal";
import { ActionButton } from "../common/ButtonRow";
import FormModal from "ui/common/FormModal";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";
import InvoiceDetails from "./InvoiceDetails";

interface Props {
  invoice: MemberInvoice | RentalInvoice;
}

const ViewInvoiceModal: React.FC<Props> = ({ invoice }) => {
  const {isOpen, openModal, closeModal} = useModal();

  return (
    <>
      <ActionButton 
        id="view-invoice-button"
        color="secondary"
        variant="outlined"
        label="View"
        onClick={openModal}
      />
    {isOpen && (
      <FormModal
          id="select-membership"
          isOpen={isOpen}
          closeHandler={closeModal}
          cancelText="Close"
        >
          <Typography variant="h4" gutterBottom>
            Details
          </Typography>
          <InvoiceDetails invoice={invoice}/>
        </FormModal>
      )}
    </>
  )
};

export default ViewInvoiceModal;
