import * as React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import Form from "ui/common/Form";
import { withLoading } from "../common/LoadingOverlay";
import DocumentFrame, { documents } from "./Document";

const id = "code-of-conduct";
const document = {
  displayName: "Code of Conduct",
  name: `${id}-checkbox`,
  transform: (val: string) => !!val,
  validate: (val: boolean) => val,
  error: "You must accept to continue",
  label: "I have read and agree to the Manchester Makerspace Code of Conduct",
}

interface Props {
  onAccept: () => void;
}

const CodeOfConduct: React.FC<Props> = ({ onAccept }) => {
  const onSubmit = React.useCallback(async (form: Form) => {
    await form.simpleValidate({ [id]: document });

    if (!form.isValid()) {
      return;
    }
    onAccept();
  }, [onAccept]);

  
  return (
    <Form
    key={id}
    id={`${id}-form`}
    submitText="Proceed"
    onSubmit={onSubmit}
  >
    <DocumentFrame id={id} src={documents.codeOfConduct} />
    <div key={document.name}>
      <FormControlLabel
        control={
          <Checkbox
            id={document.name}
            name={document.name}
            color="primary"
          />
        }
        label={document.label}
      />
    </div>
  </Form>
  );
};

export default withLoading(CodeOfConduct);
