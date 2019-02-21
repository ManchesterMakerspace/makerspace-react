import * as React from "react";
import Dialog from "@material-ui/core/Dialog";
import { withStyles } from '@material-ui/core/styles';

import Form from "ui/common/Form";

interface FormModalProps {
  formRef: (ref: Form) => Form | void;
  id: string;
  isOpen: boolean;
  title?: string;
  closeHandler?: () => void;
  cancelText?: string;
  onSubmit?: (form: Form) => void;
  submitText?: string;
  loading?: boolean;
  children?: React.ReactNode;
  error?: string;
  fullScreen?: boolean;
  style?: { [key: string]: string }
}

const styles = {
  root: {
    overflow: 'visible'
  }
}

const FormModal: React.SFC<FormModalProps> = (props: FormModalProps & { classes: any }) => {
  const { formRef, isOpen, id, loading, title, closeHandler, cancelText,
    submitText, onSubmit, children, error, style, fullScreen, classes } = props;

  return (
    <Dialog
      classes={{ paperScrollPaper: classes.root }}
      fullWidth={true}
      fullScreen={fullScreen}
      aria-labelledby={`${id}-title`}
      open={isOpen}
      onClose={closeHandler}
      disableBackdropClick={true}
    >
      <Form
        ref={formRef}
        id={id}
        title={title}
        onCancel={closeHandler}
        cancelText={cancelText}
        loading={loading}
        onSubmit={onSubmit}
        submitText={submitText}
        error={error}
        style={style}
      >
        {children}
      </Form>
    </Dialog>
  );
}

export default withStyles(styles)(FormModal);