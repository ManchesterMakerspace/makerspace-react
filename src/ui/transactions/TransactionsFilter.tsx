import * as React from "react";
import Grid from "@material-ui/core/Grid";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import { useQueryContext } from "../common/Filters/QueryContext";
import { withFilterButton } from "../common/FilterButton";
import { toDatePicker } from "../utils/timeToDate";
import useReadTransaction from "../hooks/useReadTransaction";
import { adminListBillingPlans } from "makerspace-ts-api-client";
import LoadingOverlay from "../common/LoadingOverlay";
import ErrorMessage from "../common/ErrorMessage";

export const transactionStatuses = {
  authorizing: {
    label: "Authorizing",
    value: "Authorizing"
  },
  authorized: {
    label: "Authorized",
    value: "Authorized"
  },
  authorizationExpired: {
    label: "Authorization Expired",
    value: "AuthorizationExpired"
  },
  submittedForSettlement: {
    label: "Submitted For Settlement",
    value: "SubmittedForSettlement"
  },
  settling: {
    label: "Settling",
    value: "Settling"
  },
  settlementPending: {
    label: "SettlementPending",
    value: "SettlementPending"
  },
  settlementDeclined: {
    label: "SettlementDeclined",
    value: "SettlementDeclined"
  },
  settled: {
    label: "Settled",
    value: "Settled"
  },
  voided: {
    label: "Voided",
    value: "Voided"
  },
  processorDeclined: {
    label: "ProcessorDeclined",
    value: "ProcessorDeclined"
  },
  gatewayRejected: {
    label: "GatewayRejected",
    value: "GatewayRejected"
  },
  failed: {
    label: "Failed",
    value: "Failed"
  },
}

const TransactionFilters: React.FC<{ close: () => void, onChange: () => void }> = ({ close, onChange }) => {
  const { params, setParam } = useQueryContext();

  const { data: billingPlans = [], isRequesting: plansLoading, error: plansError } = useReadTransaction(adminListBillingPlans, {});

  const onSearch = React.useCallback((event: React.KeyboardEvent<EventTarget>) => {
    if (event.key === "Enter") {
      const searchTerm = (event.target as HTMLInputElement).value;
      setParam("search", searchTerm);
      onChange();
      close();
    }
  }, [setParam, onChange, close]);

  const setType =  React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setParam("type", event.target.value);
      onChange();
      close();
    }, [setParam, onChange, close]);


  const toggleRefunded = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      let param;
      if (value === "true") {
        param = true;
      } else if (value === "false") {
        param = false;
      }
      setParam("refund", param);
      if (!params.type) {
        setParam("type", "Sale");
      }
      onChange();
      close();
    }, [setParam, onChange, close, params]);

  const onInputChange = React.useCallback((param: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setParam(param, value);
    onChange();
    close();
  }, [setParam, onChange, close]);

  const onCheckboxChange = React.useCallback((param: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.currentTarget;
    setParam(param, ((curr: string[]) => {
      if (checked) {
        return [...curr, value];
      } else {
        const updated = curr.slice();
        const valIndex = updated.indexOf(value);
        if (valIndex > -1) {
          updated.splice(valIndex, 1);
        }
        return updated;
      }
    }));
    onChange();
    close();
  }, [setParam, onChange, close]);

  const paramToVal = (param: any) => {
    return param === true ? "true" : param === false ? "false" : "both"
  }

  const fallbackUI = (plansLoading && <LoadingOverlay  id="plans-loading" contained={true}/>)
  || (plansError && <ErrorMessage error={plansError} />);

  return (
    <>
      <Typography variant="headline" gutterBottom>Transaction Filters</Typography>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Search for transactions</FormLabel>
          <TextField
                id="transaction-search-input"
                type="text"
                placeholder="Search..."
                onKeyPress={onSearch}
              />
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Transaction Type</FormLabel>
          <RadioGroup name="settled" value={params.type} onChange={setType}>
            <FormControlLabel value="Sale" control={<Radio />} label="Sale" />
            <FormControlLabel value="Credit" control={<Radio />} label="Credit" />
            <FormControlLabel control={<Radio />} label="Both" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Refunded</FormLabel>
          <RadioGroup name="settled" value={paramToVal(params.refund)} onChange={toggleRefunded}>
            <FormControlLabel value="true" control={<Radio />} label="Refunded" />
            <FormControlLabel value="false" control={<Radio />} label="Not Refunded" />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Transaction Start Due</FormLabel>
          <TextField
              value={toDatePicker(params.startDate)}
              name="start-date-filter"
              id="start-date-filter"
              type="date"
              onChange={onInputChange("startDate")}
            />
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Filter by Transaction End Due</FormLabel>
          <TextField
              value={toDatePicker(params.endDate)}
              name="end-date-filter"
              id="end-date-filter"
              type="date"
              onChange={onInputChange("endDate")}
            />
        </FormControl>
      </Grid>
      <Grid item xs={12} style={{ marginBottom: "1em" }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Transaction status</FormLabel>
            <FormGroup>
              {Object.values(transactionStatuses).map(status => (
              <FormControlLabel
                key={status.value}
                control={<Checkbox checked={params.transactionStatus.includes(status.value)} onChange={onCheckboxChange("transactionStatus")} value={status.value} />}
                label={status.label}
              />
              ))}
          </FormGroup>
        </FormControl>
      </Grid>
    </>
  )

};

export default withFilterButton(TransactionFilters);
