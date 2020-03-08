import * as React from "react";
import Grid from "@material-ui/core/Grid"
import ErrorIcon from '@material-ui/icons/Error';
import { message } from "makerspace-ts-api-client";

import useWriteTransaction from "../hooks/useWriteTransaction";
import { Typography } from "@material-ui/core";

interface Props {
  reportError(error: string): void;
}

class ErrorBoundaryInternal extends React.Component<Props, { hasError: boolean }> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    }
  }

  public componentDidCatch(error: Error) {
    this.setState({ hasError: true });
    this.props.reportError(error.toString());
  }

  render() {

    if (this.state.hasError) {
      return (
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >
          <ErrorIcon fontSize="large" color="error"/>
          <Typography color="error">
            An unexpected error has occured. Please refresh the page and try again.
          </Typography>
        </Grid>
      )
    }
    return this.props.children; 
  }
}

const ErrorBoundary: React.FC = ({ children }) => {
  const { call } = useWriteTransaction(message);

  const reportError = React.useCallback((err: string) => {
    call({ messageDetails: { message: err } });
  }, [call]);

  return (
    <ErrorBoundaryInternal reportError={reportError}>
      {children}
    </ErrorBoundaryInternal>
  );
}

export default ErrorBoundary