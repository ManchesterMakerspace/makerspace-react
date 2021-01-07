import * as React from "react";
import { useDispatch } from "react-redux";
import useReactRouter from "use-react-router";
import kebabCase from "lodash/kebabCase";

import FormLabel from "@material-ui/core/FormLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import Paper from "@material-ui/core/Paper";
import CardContent from "@material-ui/core/CardContent";
import InputAdornment from "@material-ui/core/InputAdornment";
import RemoveRedEye from "@material-ui/icons/RemoveRedEye";

import { createInvoice, InvoiceOption } from "makerspace-ts-api-client";
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
import MembershipSelectForm, { invoiceOptionParam, discountParam, noneInvoiceOption } from "ui/membership/MembershipSelectForm";
import InvoicingGate from "../membership/InvoicingGate";
import { states } from "../member/states";

const SignUpFormComponent: React.FC = () => {
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
    const validSignUp: Record<string, any> = await form.simpleValidate<SignUpForm>(SignUpFields);
    if (!form.isValid()) return;

    const { street, unit, city, state, postalCode, ...rest } = validSignUp;

    await dispatch(submitSignUpAction({
      ...rest as SignUpForm,
      address: {
        street,
        unit,
        city,
        state,
        postalCode
      }
    }));
    // Don't attempt to create a new invoice if they selected "none"
    if (option && option.id !== noneInvoiceOption.id) {
      await buildInvoice({ body: option });
    }
  }, [option]);

  React.useEffect(() => {
    if (!isRequesting && error && error.match(new RegExp(EmailExistsError))) {
      dispatch({ type: Action.LogoutSuccess }); // Clear error & redirect
      openEmailNote();
    }
  }, [openEmailNote, isRequesting, error]);

  const selectMembership = React.useCallback((option: InvoiceOption, discountId: string) => {
    setOption({ discountId, id: option.id });
  }, [setOption]);


  return (
    <>
    <Grid container justify="center" spacing={16}>
      <Grid item md={10} xs={12}>
        <Grid container justify="center" spacing={16}>
          <Grid item xs={12}>
            <Paper style={{ minWidth: 275, padding: "1rem" }}>
                <Form
                  id={signUpPrefix}
                  loading={isRequesting}
                  title="Create an Account"
                  onSubmit={submit}
                  submitText="Sign Up"
                >
                  <Grid container spacing={16}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.firstname.label}
                        name={SignUpFields.firstname.name}
                        id={SignUpFields.firstname.name}
                        placeholder={SignUpFields.firstname.placeholder}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.lastname.label}
                        name={SignUpFields.lastname.name}
                        id={SignUpFields.lastname.name}
                        placeholder={SignUpFields.lastname.placeholder}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.street.label}
                        name={SignUpFields.street.name}
                        id={SignUpFields.street.name}
                        placeholder={SignUpFields.street.placeholder}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={SignUpFields.unit.label}
                        name={SignUpFields.unit.name}
                        id={SignUpFields.unit.name}
                        placeholder={SignUpFields.unit.placeholder}
                      />
                    </Grid>
                    <Grid item sm={12} md={5}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.city.label}
                        name={SignUpFields.city.name}
                        id={SignUpFields.city.name}
                        placeholder={SignUpFields.city.placeholder}
                      />
                    </Grid>

                    <Grid item sm={6} md={4}>
                    <FormLabel component="legend">{SignUpFields.state.label}</FormLabel>
                      <Select
                        name={SignUpFields.state.name}
                        fullWidth
                        native
                        required
                        placeholder={SignUpFields.state.placeholder}
                      >
                        {[<option id={`${SignUpFields.state.name}-option-none`} key={"none"} value={""}>{SignUpFields.state.placeholder}</option>].concat(Object.keys(states).map(
                          (key) => <option id={`${SignUpFields.state.name}-option-${kebabCase(key)}`} key={kebabCase(key)} value={key}>{key}</option>))}
                      </Select>
                    </Grid>

                    <Grid item sm={6} md={3}>
                      <TextField
                        fullWidth
                        required
                        label={SignUpFields.postalCode.label}
                        name={SignUpFields.postalCode.name}
                        id={SignUpFields.postalCode.name}
                        placeholder={SignUpFields.postalCode.placeholder}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={SignUpFields.phone.label}
                        name={SignUpFields.phone.name}
                        id={SignUpFields.phone.name}
                        placeholder={SignUpFields.phone.placeholder}
                        type="phone"
                      />
                    </Grid>
                    <InvoicingGate>
                      {open => open && (
                        <Grid item xs={12}>
                          <MembershipSelectForm onSelect={selectMembership} allowNone={true}/>
                        </Grid>
                      )}
                    </InvoicingGate>
                    {!isRequesting && error && <ErrorMessage id={`${signUpPrefix}-error`} error={error} />}
                  </Grid>
                </Form>
            </Paper>
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

export default SignUpFormComponent;
