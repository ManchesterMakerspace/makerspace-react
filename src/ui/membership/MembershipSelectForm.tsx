import * as React from "react";
import useReactRouter from "use-react-router";

import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import { InvoiceOption, listInvoiceOptions } from "makerspace-ts-api-client";

import { InvoiceableResource } from "app/entities/invoice";

import ErrorMessage from "ui/common/ErrorMessage";
import TableContainer from "ui/common/table/TableContainer";
import { numberAsCurrency } from "ui/utils/numberAsCurrency";
import useReadTransaction from "../hooks/useReadTransaction";
import DuplicateInvoiceModal from "./DuplicateInvoiceModal";

export const invoiceOptionParam = "optionId";
export const discountParam = "discountId";
const byAmount = (a: InvoiceOption, b: InvoiceOption) => Number(a.amount) - Number(b.amount);

interface Props {
  title?: string;
  onSelect?: (option: InvoiceOption, discountId: string) => void;
  allowNone: boolean;
}

const MembershipSelect: React.FC<Props> = ({ onSelect, allowNone, title }) => {
  const { history, location: { search } } = useReactRouter();
  const [selectedOption, setSelectedOption] = React.useState<InvoiceOption>();

  const searchParams = React.useMemo(() => new URLSearchParams(search), [search]);
  const { membershipOptionId, discountId } = React.useMemo(() => {
    const membershipOptionId = searchParams.get(invoiceOptionParam);
    const discountId = searchParams.get(discountParam);
    return { membershipOptionId, discountId };
  }, [search, searchParams]);

  const {
    isRequesting,
    error,
    data: options = []
  } = useReadTransaction(listInvoiceOptions, { types: [InvoiceableResource.Membership] });

  // Select bookmarked option on load
  React.useEffect(() => {
    if (options.length) {
      const option = (options || []).find(option => option.id === membershipOptionId);
      setSelectedOption(option);
    }
  }, [membershipOptionId, setSelectedOption, options]);
  
  const allOptions = React.useMemo(() => {
    return options.sort(byAmount)
                  .concat(allowNone ? [{ 
                    id: "none",
                    name: "None",
                    description: "Paid with cash or select an option later",
                    amount: "0",
                    resourceClass: undefined,
                    quantity: 0,
                    disabled: false,
                    operation: undefined,
                  }] : []);
  }, [allowNone, options]);

  const updateSelection = React.useCallback((optionId: string, discountId: string) => {
    const option = (options || []).find(option => option.id === optionId);
    setSelectedOption(option);
    optionId ? searchParams.set(invoiceOptionParam, optionId) : searchParams.delete(invoiceOptionParam);
    discountId ? searchParams.set(discountParam, discountId) : searchParams.delete(discountParam);
    history.push({
      search: searchParams.toString()
    });
    onSelect && onSelect(option, discountId);
  }, [onSelect, options, history, searchParams]);

  // Add option and discount IDs to query params
  const selectMembershipOption = React.useCallback((event: React.MouseEvent<HTMLTableElement>) => {
    const optionId = event.currentTarget.id;
    const option = (options || []).find(option => option.id === optionId);
    updateSelection(optionId, discountId ? option.discountId : undefined);
  }, [updateSelection, discountId, options]);

  // Add or remove discount ID from query params
  const toggleDiscount = React.useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const option = (options || []).find(option => option.id === membershipOptionId);
    updateSelection(membershipOptionId, checked ? (option.discountId || "apply") : undefined);
  }, [updateSelection, membershipOptionId]);

  const fields = React.useMemo(() =>  [
    {
      id: "name",
      label: "Name",
      cell: (row: InvoiceOption) => row.name
    },
    {
      id: "description",
      label: "Description",
      cell: (row: InvoiceOption) => row.description
    },
    {
      id: "amount",
      label: "Amount",
      cell: (row: InvoiceOption) => numberAsCurrency(row.amount)
    },
    {
      id: "select",
      label: "",
      cell: (row: InvoiceOption) => {
        const selected = membershipOptionId === row.id;
        const variant = selected ? "contained" : "outlined";
        const label = selected ? "Selected" : "Select";

        return (
          <Button id={row.id} variant={variant} color="primary" onClick={selectMembershipOption}>
            {label}
          </Button>
        );
      }
    }
  ], [selectMembershipOption, membershipOptionId]);

  let normalizedError: JSX.Element =
    (error && (
      <>
        Error reading membership options: {error}. Email{" "}
        <a href={`mailto: contact@manchestermakerspace.org`}>contact@manchestermakerspace.org</a> if your desired
        membership option is not present
      </>
    ));


  return (
    <>
      <DuplicateInvoiceModal type={selectedOption && selectedOption.resourceClass} />
      <TableContainer
        id="membership-select-table"
        title={typeof title === undefined && "Select a Membership"}
        data={allOptions}
        columns={fields}
        rowId={(row: InvoiceOption) => row.id}
        loading={isRequesting}
      />
      <FormControlLabel
        control={
          <Checkbox
            name="discount-select"
            value="discount-select"
            checked={!!discountId}
            onChange={toggleDiscount}
            color="default"
          />
        }
        label="Apply 10% Discount for all student, senior (+65) and military. Proof of applicable affiliation may be required during orientation."
      />
      <ErrorMessage error={normalizedError} />
    </>
  );
}
export default MembershipSelect;
