import * as React from "react";
import AwesomeDebouncePromise from 'awesome-debounce-promise';

import { listMembers, isApiErrorResponse, getMember } from "makerspace-ts-api-client";
import { SelectOption, AsyncSelectFixed, AsyncCreatableSelect, AsyncSelectProps, AsyncCreateableSelectProps } from "./AsyncSelect";
import Form from "./Form";

interface Props  {
  name: string;
  placeholder?: string;
  creatable?: boolean;
  initialSelection?: SelectOption;
  disabled?: boolean;
  onChange?(selection: SelectOption): void;
  getFormRef?(): Form;
}

async function searchMemberOptions(searchValue: string) {
  const membersResponse = await listMembers({ search: searchValue });

  if (isApiErrorResponse(membersResponse)) {
    console.error(membersResponse.error);
  } else {
    const members = membersResponse.data;
    const memberOptions = members.map(member => ({
      value: member.email,
      label: `${member.firstname} ${member.lastname}`,
      id: member.id
    }));
    return memberOptions;
  }
}

type MemberSearchComponent = React.FunctionComponent<AsyncSelectProps<SelectOption> | AsyncCreateableSelectProps<SelectOption>>;

const MemberSearchInput: React.FC<Props> = ({
  creatable,
  disabled,
  name,
  onChange,
  getFormRef,
  placeholder,
  initialSelection,
}) => {
  // Track field value
  const [selection, setSelection] = React.useState<SelectOption>(initialSelection);
  const componentRef = React.useRef<MemberSearchComponent>(creatable ? AsyncCreatableSelect : AsyncSelectFixed);
  const loadMembers = React.useRef<(search: string) => Promise<SelectOption[]>>(AwesomeDebouncePromise(searchMemberOptions, 250));

  // Determine select component
  React.useEffect(() => {
    if (!componentRef.current) {
      componentRef.current = creatable ? AsyncCreatableSelect : AsyncSelectFixed;
    }
  }, [creatable]);

  React.useEffect(() => {
    getFormRef && selection && getFormRef().setValue(name, selection);
  }, [getFormRef, name, JSON.stringify(selection)]);

  React.useEffect(() => {
    initialSelection && setSelection(initialSelection);
  }, [setSelection, JSON.stringify(initialSelection)]);

  // Fetch initial member option
  React.useEffect(() => {
    const fetchMember = async () => {
      if (selection) {
        const response = await getMember(selection.id);
        if (isApiErrorResponse(response)) {
          console.error(response.error);
        } else {
          const member = response.data;
          setSelection({
            value: member.id,
            label: `${member.firstname} ${member.lastname}`,
            id: member.id
          });
        }
      }
    }

    initialSelection && initialSelection.id && fetchMember();
  }, [JSON.stringify(initialSelection), setSelection]);

  const updateSelection = React.useCallback((newSelection: SelectOption) => {
    setSelection(newSelection);
    onChange && onChange(newSelection);
  }, [onChange, setSelection]);

  return (
    <componentRef.current
      isClearable
      name={name}
      id={name}
      value={selection && selection.value ? selection : undefined}
      placeholder={placeholder}
      onChange={updateSelection}
      isDisabled={disabled}
      loadOptions={loadMembers.current}
      getFormRef={getFormRef}
    />
  )
};

export default MemberSearchInput;