import * as React from 'react';
import { connect } from "react-redux";

import { ScopedThunkDispatch, State as ReduxState } from "ui/reducer";
import { sessionLoginUserAction } from "ui/auth/actions";
import Header from "ui/common/Header";
import LoadingOverlay from 'ui/common/LoadingOverlay';
import PrivateRouting from 'app/PrivateRouting';
import PublicRouting from 'app/PublicRouting';
import { CollectionOf } from 'app/interfaces';
import { Permission } from "app/entities/permission";
import { MemberInvoice, RentalInvoice } from "app/entities/invoice";
import { withRouter, RouteComponentProps } from 'react-router';

interface StateProps {
  currentUserId: string;
  isSigningIn: boolean;
  permissions: CollectionOf<Permission>;
  isAdmin: boolean;
}
interface DispatchProps {
  attemptLogin: () => void;
}
interface OwnProps extends RouteComponentProps<{}> {}

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
    const { currentUserId, permissions, isAdmin } = this.props;
    if (attemptingLogin) {
      return <LoadingOverlay id="body"/>;
    } else {
      return currentUserId ? <PrivateRouting permissions={permissions} currentUserId={currentUserId} isAdmin={isAdmin}/> : <PublicRouting/>;
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
    auth: { currentUser, permissions, isRequesting: isSigningIn },
  } = state;

  return {
    currentUserId: currentUser.id,
    isAdmin: currentUser.isAdmin,
    permissions,
    isSigningIn,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    attemptLogin: () => dispatch(sessionLoginUserAction())
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
