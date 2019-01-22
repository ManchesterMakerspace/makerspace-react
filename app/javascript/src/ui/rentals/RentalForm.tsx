import * as React from "react";
import AsyncCreatableSelect from 'react-select/lib/AsyncCreatable';
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";

import { Rental } from "app/entities/rental";

import FormModal from "ui/common/FormModal";
import { fields } from "ui/rentals/constants";
import Form from "ui/common/Form";
import { toDatePicker } from "ui/utils/timeToDate";
import { getMember } from "api/members/transactions";
import { getMembers } from "api/members/transactions";
import { MemberDetails } from "app/entities/member";
import FormLabel from "@material-ui/core/FormLabel";

interface OwnProps {
  rental: Partial<Rental>;
  isOpen: boolean;
  isRequesting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: Form) => void;
  title?: string;
}
interface State {
  member: SelectOption;
}
type SelectOption = { label: string, value: string, id?: string };

class RentalForm extends React.Component<OwnProps, State> {
  public formRef: Form;
  private setFormRef = (ref: Form) => this.formRef = ref;

  public constructor(props: OwnProps) {
    super(props);
    this.state = {
      member: undefined,
    }
  }

  public componentDidUpdate(prevProps: OwnProps) {
    const { isOpen: wasOpen } = prevProps;
    const { isOpen } = this.props;
    if (isOpen === !wasOpen) {
      this.initRentalMember();
    }
  }


  public validate = async (form: Form): Promise<Rental> => {
    const details = await form.simpleValidate<Rental>(fields);
    return {
      ...details,
      memberId: this.state.member && this.state.member.id,
    }
  }

  private initRentalMember = async () => {
    const { rental } = this.props;
    this.setState({ member: { value: rental.memberId, label: rental.memberName, id: rental.memberId } })
    if (rental && rental.memberId) {
      try {
        const { data } = await getMember(rental.memberId);
        const { member } = data;
        if (member) {
          this.updateMemberValue({ value: member.id, label: `${member.firstname} ${member.lastname}`, id: member.id });
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      this.updateMemberValue({ value: "", label: "None", id: undefined });
    }
  }

  // Need to update internal state and set form value since input is otherwise a controlled input
  private updateMemberValue = (newMember: SelectOption) => {
    this.setState({ member: newMember });
    this.formRef && this.formRef.setValue(fields.member.name, newMember);
  }

  private memberOptions = async (searchValue: string) => {
    try {
      const membersResponse = await getMembers({ search: searchValue });
      const members: MemberDetails[] = membersResponse.data ? membersResponse.data.members : [];
      const memberOptions = members.map(member => ({ value: member.email, label: `${member.firstname} ${member.lastname}`, id: member.id }));
      return memberOptions;
    } catch (e) {
      console.log(e);
    }
  }

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
              required
              value={rental.description}
              label={fields.description.label}
              name={fields.description.name}
              id={fields.description.name}
              placeholder={fields.description.placeholder}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
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
          <Grid item xs={12}>
            <FormLabel component="legend">{fields.member.label}</FormLabel>
            <AsyncCreatableSelect
              isClearable
              name={fields.member.name}
              value={this.state.member}
              onChange={this.updateMemberValue}
              placeholder={fields.member.placeholder}
              id={fields.member.name}
              loadOptions={this.memberOptions}
            />
          </Grid>
        </Grid>
      </FormModal>
    )
  }
}

export default RentalForm;
