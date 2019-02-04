import * as React from 'react';
import { connect } from "react-redux";

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { activeSessionLogin } from "ui/auth/actions";
import Header from "ui/common/Header";
import LoadingOverlay from 'ui/common/LoadingOverlay';
import PrivateRouting from 'app/PrivateRouting';
import PublicRouting from 'app/PublicRouting';
import { CollectionOf } from 'app/interfaces';
import { Invoice } from 'app/entities/invoice';

interface StateProps {
  auth: string;
  isSigningIn: boolean;
  stagedInvoices: CollectionOf<Invoice>;
  isCheckingOut: boolean;
  checkoutError: string;
}
interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps {}

interface State {
  attemptingLogin: boolean;
}

interface Props extends StateProps, DispatchProps, OwnProps { }

class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      attemptingLogin: true,
    }
  }

  public componentDidMount() {
    this.setState({ attemptingLogin: true });
    this.props.attemptLogin();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isSigningIn: wasSigningIn } = prevProps;
    const { isSigningIn } = this.props;

    const { attemptingLogin } = this.state;
    if (wasSigningIn && !isSigningIn) {
      if (attemptingLogin) {
        this.setState({ attemptingLogin: false });
      }
    }
  }

  private renderBody = ():JSX.Element => {
    const { attemptingLogin } = this.state;
    const { auth } = this.props;
    if (attemptingLogin) {
      return <LoadingOverlay id="body"/>;
    } else {
      return auth ? <PrivateRouting auth={auth} /> : <PublicRouting/>;
    }
  }
  public render(): JSX.Element {
    return (
      <div className="root">
        <Header/>
        {this.renderBody()}
      </div>
    )
  }
}

const mapStateToProps = (state: ReduxState, _ownProps: OwnProps): StateProps => {
  const {
    auth: { currentUser, isRequesting: isSigningIn },
    checkout: { invoices }
  } = state;

  const {
    isRequesting: isCheckingOut,
    error: checkoutError
  } = state.checkout;

  return {
    auth: currentUser.id,
    stagedInvoices: invoices,
    isSigningIn,
    isCheckingOut,
    checkoutError
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    attemptLogin: () => dispatch(activeSessionLogin())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
