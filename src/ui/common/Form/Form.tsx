import React from "react";
import { CollectionOf } from "app/interfaces";

interface Props {
  id: string;
  title?: string;
  onCancel?: () => void;
  cancelText?: string;
  onSubmit?: (form: Form) => void;
  submitText?: string;
  loading?: boolean;
  error?: string;
}

interface State {
  values: CollectionOf<string>;
  errors: CollectionOf<string>;
  isDirty: boolean;
  touched: CollectionOf<boolean>;
}

class Form extends React.Component<Props, State> {

  // Form:
  // Creates a context that inputs register to
  // Smart builder
  // Validator
  // isValid
  // No need for reset form since unmounting Context will clear it
  // getValues, setValue, setError, isValid, handleSubmit, handleChange, 


  // Need FormField component to register
  // CHeckbox, text & date, select, async select, radio
} 