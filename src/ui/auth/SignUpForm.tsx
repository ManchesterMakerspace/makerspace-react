import * as React from "react";
import { useDispatch } from "react-redux";
import useReactRouter from "use-react-router";

import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import InputAdornment from "@material-ui/core/InputAdornment";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";

import { createInvoice, InvoiceOption, listInvoiceOptions } from "makerspace-ts-api-client";
import { SignUpFields, EmailExistsError, signUpPrefix } from "ui/auth/constants";
import { SignUpForm } from "ui/auth/interfaces";
import ErrorMessage from "ui/common/ErrorMessage";
import Form from "ui/common/Form";
import useModal from "../hooks/useModal";
import FormModal from "../common/FormModal";
import { Routing } from "app/constants";
import { submitSignUpAction } from "./actions";
import { Action } from "ui/auth/constants";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import MembershipSelectForm, { invoiceOptionParam, discountParam } from "ui/membership/MembershipSelectForm";
import useReadTransaction from "ui/hooks/useReadTransaction";
import { InvoiceableResource } from "app/entities/invoice";

const SignUpForm: React.FC = () => {
  const { isOpen: emailNoteOpen, openModal: openEmailNote, closeModal: closeEmailNote } = useModal();
  const { history, location: { search } } = useReactRouter();
  const goToLogin = React.useCallback(() => history.push(Routing.Login), [history]);
  const dispatch = useDispatch();
  const { isRequesting, error } = useAuthState();
  const searchParams = new URLSearchParams(search);
  const [option, setOption] = React.useState<{ id: string, discountId: string }>({
    id: searchParams.get(invoiceOptionParam),
    discountId: searchParams.get(discountParam),
  });
  const { call: buildInvoice } = useWriteTransaction(createInvoice);
  const [mask, setMask] = React.useState(true);
  const toggleMask = React.useCallback(() => setMask(curr => !curr), [setMask]);

  const submit = React.useCallback(async (form: Form) => {
    const validSignUp: SignUpForm = await form.simpleValidate<SignUpForm>(SignUpFields);
    if (!form.isValid()) return;
    await dispatch(submitSignUpAction(validSignUp));
    if (option) {
      await buildInvoice(option);
    }
  }, []);

  React.useEffect(() => {
    if (!isRequesting && error && error.match(new RegExp(EmailExistsError))) {
      dispatch({ type: Action.LogoutSuccess }); // Clear error & redirect
      openEmailNote();
    }
  }, [openEmailNote, isRequesting, error]);

  const selectMembership = React.useCallback((option: InvoiceOption, discountId: string) => {
    setOption({ discountId, id: option.id });
  }, [setOption]);

  // TODO: Remove this when all invoicing released globally
  const {
    data: options = []
  } = useReadTransaction(listInvoiceOptions, { types: [InvoiceableResource.Membership] });

  return (
    <>
    <Grid container justify="center" spacing={16}>
      <Grid item md={10} xs={12}>
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Card style={{ minWidth: 275 }}>
              <CardContent>
                <Form
                  id={signUpPrefix}
                  loading={isRequesting}
                  title="Create an Account"
                  onSubmit={submit}
                  submitText="Sign Up"
                >
                  <Grid container spacing={16}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.firstname.label}
                        name={SignUpFields.firstname.name}
                        id={SignUpFields.firstname.name}
                        placeholder={SignUpFields.firstname.placeholder}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.lastname.label}
                        name={SignUpFields.lastname.name}
                        id={SignUpFields.lastname.name}
                        placeholder={SignUpFields.lastname.placeholder}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.email.label}
                        name={SignUpFields.email.name}
                        id={SignUpFields.email.name}
                        placeholder={SignUpFields.email.placeholder}
                        type="email"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.password.label}
                        name={SignUpFields.password.name}
                        id={SignUpFields.password.name}
                        placeholder={SignUpFields.password.placeholder}
                        type={mask ? 'password' : 'text'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <RemoveRedEye style={{cursor: 'pointer'}} onClick={toggleMask} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    {options.length && (
                      <Grid item xs={12}>
                        <MembershipSelectForm onSelect={selectMembership} allowNone={true}/>
                      </Grid>
                    )}
                    {!isRequesting && error && <ErrorMessage id={`${signUpPrefix}-error`} error={error} />}
                  </Grid>
                </Form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Button id="auth-toggle" variant="outlined" color="secondary" fullWidth onClick={goToLogin}>
              Already a Member? Login
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    {emailNoteOpen && (
      <FormModal
        isOpen={true}
        id="email-exists"
        title="Email already exists"
        onSubmit={goToLogin}
        submitText="Login"
        closeHandler={closeEmailNote}
      >
        <Card style={{minWidth: 275}}>
        <CardContent>
            An account with this email already exists.  Please login to continue.
        </CardContent>
      </Card>
      </FormModal>
    )}
    </>
  );
}

export default SignUpForm;
