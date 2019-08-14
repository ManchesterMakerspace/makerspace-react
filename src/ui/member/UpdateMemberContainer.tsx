import * as React from "react";
import { connect } from "react-redux";

import { Member } from "makerspace-ts-api-client";
import { CrudOperation } from "app/constants";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import Form from "ui/common/Form";
import RenewalForm from "ui/common/RenewalForm"
import { updateMemberAction } from "ui/member/actions";
import { createMembersAction } from "ui/members/actions";
import MemberForm from "ui/member/MemberForm"

export interface UpdateMemberRenderProps extends Props {
  submit: (form: Form) => Promise<Member>;
  setRef: (ref: MemberForm | RenewalForm) => void;
}
interface OwnProps {
  member: Partial<Member>;
  isOpen: boolean;
  operation: CrudOperation;
  closeHandler: () => void;
  render: (renderPayload: UpdateMemberRenderProps) => JSX.Element;
}
interface StateProps {
  isAdmin: boolean;
  error: string;
  isRequesting: boolean;
}
interface DispatchProps {
  dispatchMember: (updatedMember: Member, isAdmin: boolean) => Promise<Member>;
}
interface Props extends OwnProps, StateProps, DispatchProps {}

class EditMember extends React.Component<Props, {}> {
  private formRef: MemberForm;
  private setFormRef = (ref: MemberForm) => this.formRef = ref;

  public componentDidUpdate(prevProps: Props){
    const { isRequesting: wasRequesting } = prevProps;
    const { isOpen, isRequesting, closeHandler, error } = this.props;
    if (isOpen && wasRequesting && !isRequesting && !error) {
      closeHandler();
    }
  }

  private submitMemberForm = async (form: Form) => {
    const validUpdate: Member = await this.formRef.validate(form);

    if (!form.isValid()) return;

    return await this.props.dispatchMember(validUpdate, this.props.isAdmin);
  }

  public render(): JSX.Element {
    const { render } = this.props;
    const renderPayload = {
      ...this.props,
      submit: this.submitMemberForm,
      setRef: this.setFormRef,
    }
    return render(renderPayload);
  }
}

const mapStateToProps = (
  state: ReduxState,
  ownProps: OwnProps
): StateProps => {
  const { isRequesting: isUpdating, error: updateError } = state.member.update
  const { isRequesting: isCreating, error: createError } = state.members.create
  const { currentUser: { isAdmin } } = state.auth;

  return {
    isAdmin,
    isRequesting: ownProps.member && ownProps.member.id ? isUpdating : isCreating,
    error: ownProps.member && ownProps.member.id ? updateError : createError,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps,
): DispatchProps => {
  const { member, operation } = ownProps;
  return {
    dispatchMember: (memberDetails, isAdmin) => {
      let action;
      switch (operation) {
        case CrudOperation.Update:
          action = (updateMemberAction(member.id, memberDetails, isAdmin));
          break;
        case CrudOperation.Create:
          action = (createMembersAction(memberDetails));
          break;
      }
      return dispatch(action);
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditMember);
