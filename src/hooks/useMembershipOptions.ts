
import * as React from "react";
import useReadTransaction from "ui/hooks/useReadTransaction";
import { InvoiceOption, listInvoiceOptions, InvoiceableResource } from "makerspace-ts-api-client";
import { noneInvoiceOption } from "ui/membership/MembershipSelectForm";

const byAmount = (a: InvoiceOption, b: InvoiceOption) => Number(a.amount) - Number(b.amount);
const defaultPlanId = "membership-one-month-recurring";

interface ParsedInvoiceOptions {
  loading: boolean;
  error: string;
  promotionOptions: InvoiceOption[];
  normalOptions: InvoiceOption[];
  defaultOption: InvoiceOption;
  allOptions: InvoiceOption[];
}

export const useMembershipOptions = (includeNone?: boolean): ParsedInvoiceOptions => {
  const {
    isRequesting,
    error,
    data: membershipOptions = []
  } = useReadTransaction(
    listInvoiceOptions, 
    { types: [InvoiceableResource.Member] },
    undefined,
    undefined,
    false
  );

  return React.useMemo(() => {
    const promotionOptions: InvoiceOption[] = [];
    let defaultOption: InvoiceOption;

    const normalOptions = membershipOptions.reduce((opts, option) => {
      if (option.planId === defaultPlanId) {
        defaultOption = option;
      }
      
      if (option.isPromotion) {
        promotionOptions.push(option);
      } else {
        opts.push(option);
      }
      return opts;
    }, [] as InvoiceOption[]);

    const sortedNormalOpts = normalOptions.sort(byAmount);
    
    return {
      error,
      loading: isRequesting,
      promotionOptions,
      normalOptions: sortedNormalOpts,
      defaultOption: defaultOption || sortedNormalOpts[0],
      allOptions: promotionOptions.concat(sortedNormalOpts).concat(includeNone ? [noneInvoiceOption] : [])
    };
  }, [membershipOptions, isRequesting, error]);
}