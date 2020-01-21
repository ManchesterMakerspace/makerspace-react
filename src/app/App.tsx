import * as React from 'react';
import useReactRouter from "use-react-router";
import { useDispatch } from "react-redux";

import { sessionLoginUserAction } from "ui/auth/actions";
import Header from "ui/common/Header";
import LoadingOverlay from 'ui/common/LoadingOverlay';
import { useAuthState } from "ui/reducer/hooks";
import PrivateRouting from 'app/PrivateRouting';
import PublicRouting from 'app/PublicRouting';
import { Routing } from 'app/constants';
import { buildProfileRouting } from 'ui/member/utils';

const publicPaths = [Routing.Login, Routing.SignUp, Routing.PasswordReset];

const App: React.FC = () => {
  const { location: { pathname }, history } = useReactRouter();
  const dispatch = useDispatch();
  const { currentUser: { id: currentUserId, isAdmin }, permissions, isRequesting, error } = useAuthState();
  const [attemptingLogin, setAttemptingLogin] = React.useState(true);
  const [loginAttempted, setLoginAttempted] = React.useState();
  const [initialPath] = React.useState(pathname);

  // Attempt login on mount except when going to password reset
  React.useEffect(() => {
    if (initialPath !== Routing.PasswordReset) {
      dispatch(sessionLoginUserAction());
    }
  }, []);

  React.useEffect(() => {
    setLoginAttempted(true);
  }, []);

  // Redirect after login if they were navigation elsewhere
  React.useEffect(() => {
    if (!error && !isRequesting) {
      loginAttempted && setAttemptingLogin(false);
      if (currentUserId) {
        if (
            initialPath &&
            initialPath !== Routing.Root && // Don't nav to initial if initial is root
            !publicPaths.some(path => initialPath.startsWith(path)) && // or initial is a public path
            !pathname.startsWith(Routing.SignUp) // or user just signed up
          ) {
          history.push(initialPath);
        } else {
          history.push(buildProfileRouting(currentUserId));
        }
      }
    }
  }, [isRequesting]);

  return (
    <div className="root">
      <Header />
      {attemptingLogin ?
        <LoadingOverlay id="body" />
        : (currentUserId ? <PrivateRouting permissions={permissions} currentUserId={currentUserId} isAdmin={isAdmin} /> : <PublicRouting />)
      }
    </div>
  )
}

export default App;
