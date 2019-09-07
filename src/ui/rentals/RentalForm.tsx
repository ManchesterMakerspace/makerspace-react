import * as React from "react";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormLabel from "@material-ui/core/FormLabel";

import FormModal from "ui/common/FormModal";
import { fields } from "ui/rentals/constants";
import Form from "ui/common/Form";
import { toDatePicker } from "ui/utils/timeToDate";
import { Rental } from "makerspace-ts-api-client";
import MemberSearchInput from "../common/MemberSearchInput";

interface OwnProps {
  rental: Partial<Rental>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
  title?: string;
}

class RentalForm extends React.Component<OwnProps> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public validate = (form: Form): Promise<Rental> => form.simpleValidate<Rental>(fields);

  public render(): JSX.Element {
    const { isOpen, onClose, isRequesting, error, onSubmit, rental } = this.props;

    return isOpen && (
      <FormModal
        formRef={this.setFormRef}
        id="rental-form"
        loading={isRequesting}
        isOpen={isOpen}
        closeHandler={onClose}
        title={this.props.title || "Update Rental"}
        onSubmit={onSubmit}
        submitText="Submit"
        error={error}
      >
        <Grid container spacing={24}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              required
              value={rental.number}
              label={fields.number.label}
              name={fields.number.name}
              id={fields.number.name}
              placeholder={fields.number.placeholder}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              value={rental.description}
              label={fields.description.label}
              name={fields.description.name}
              id={fields.description.name}
              placeholder={fields.description.placeholder}
            />
          </Grid>
          {rental && rental.id && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                value={toDatePicker(rental.expiration)}
                label={fields.expiration.label}
                name={fields.expiration.name}
                placeholder={fields.expiration.placeholder}
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.memberId.label}</FormLabel>
            <MemberSearchInput
              name={fields.memberId.name}
              placeholder={fields.memberId.placeholder}
              getFormRef={() => this.formRef}
              initialSelection={rental && { value: rental.memberId, label: rental.memberName, id: rental.memberId }}
            />
          </Grid>
        </Grid>
      </FormModal>
    )
  }
}

export default RentalForm;
