import * as React from "react";
import useReactRouter from "use-react-router";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";
import Hidden from "@material-ui/core/Hidden";

import { createInvoice, InvoiceOption } from "makerspace-ts-api-client";
import { discountParam, invoiceOptionParam, MembershipOptions } from '../MembershipOptions';
import { useSearchQuery, useSetSearchQuery } from "hooks/useSearchQuery";
import { useMembershipOptions } from "hooks/useMembershipOptions";
import useWriteTransaction from "ui/hooks/useWriteTransaction";
import { Form } from "components/Form/Form";
import { noneInvoiceOption } from "ui/membership/MembershipSelectForm";
import { CartPreview } from "./CartPreview";
import { buildNewMemberProfileRoute } from "ui/member/utils";
import { useAuthState } from "ui/reducer/hooks";
import { ToastStatus, useToastContext } from "components/Toast/Toast";
import { Routing } from "app/constants";

interface Props {}

export const MembershipSelectStep: React.FC<Props> = ({ children }) => {
  const {
    invoiceOptionId: invoiceOptionIdParam,
    discountId: discountIdParam,
  } = useSearchQuery({
    invoiceOptionId: invoiceOptionParam,
    discountId: discountParam
  });

  const { history } = useReactRouter();
  const { currentUser } = useAuthState();
  const { create } = useToastContext();

  const { allOptions, promotionOptions, defaultOption } = useMembershipOptions(true);
  console.error("MembershipSelectStep", "allOptions", allOptions);

  React.useEffect(() => {
    setInvoiceOption(allOptions.find(({ id }) => id === invoiceOptionIdParam));
  }, [invoiceOptionIdParam, allOptions]);

  const [invoiceOption, setInvoiceOption] = React.useState(allOptions.find(({ id }) => id === invoiceOptionIdParam));
  const setSearchQuery = useSetSearchQuery();
  const updateInvoiceOption = React.useCallback((newOpt: InvoiceOption) => {
    setSearchQuery({ [invoiceOptionParam]: newOpt.id });
    setInvoiceOption(newOpt);
  }, [setSearchQuery, setInvoiceOption]);

  React.useEffect(() => {
    const firstSelection = promotionOptions[0] || defaultOption;
    !invoiceOptionIdParam && firstSelection && updateInvoiceOption(firstSelection);
  }, [defaultOption]);

  const isNoneOption = invoiceOption?.id === noneInvoiceOption.id;
  const onSubmit = React.useCallback(async () => {
    if (isNoneOption) {
      create({
        status: ToastStatus.Info,
        message: (
          <>
            <Typography component="span" variant="body1">Select a membership anytime in </Typography>
            <Link 
              href={Routing.Settings.replace(Routing.PathPlaceholder.MemberId, currentUser.id)} 
              target="_blank"
            >
              <Typography component="span" variant="body1">settings</Typography>
            </Link>
          </>
        )
      });

      history.push(buildNewMemberProfileRoute(currentUser.id));
      return;
    };
    return true;
  }, [invoiceOption, discountIdParam, isNoneOption]);

  return (
    <Form
      id="membership-select-form"
      onSubmit={onSubmit}
      hideFooter={true}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box>
            <Typography variant="body1">
              {invoiceOption ? "Confirm" : "Select"} your membership selection. If you have a discount code, please enter it now.
            </Typography>
          </Box>
          <MembershipOptions onSelect={updateInvoiceOption} />
        </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs={5} md={3}>
            <CartPreview />
          </Grid>
      </Grid>
      <>{children}</>
    </Form>
  );
};
