import * as React from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem
} from "@material-ui/core";
import {
  Menu as MenuIcon,
} from "@material-ui/icons";

import Login from "ui/auth/Login";

interface Props {
  logout: () => void;
  auth: boolean;
}

interface State {
  authOpen: boolean;
  anchorEl: HTMLElement;
}

export default class Header extends React.Component<Props, State> {

  constructor(props: Props){
    super(props)
    this.state = {
      authOpen: false,
      anchorEl: null,
    };
  }

  private openSignIn = () => {
    this.setState({ authOpen: true });
  }
  private closeSignIn = () => {
    this.setState({ authOpen: false });
  }

  private attachMenu = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: event.currentTarget });
  }

  private detachMenu = () => {
    this.setState({ anchorEl: null });
  };

  private renderMenuNavLink = (path: string, label: string) => {
    return (
      <Link to={path} style={{ textDecoration: 'none', color: 'unset' }} onClick={this.detachMenu}>
        <MenuItem>
          {label}
        </MenuItem>
      </Link>
    )
  }

  private renderHambMenu = (): JSX.Element => {
    const { anchorEl } = this.state;
    const menuOpen = Boolean(anchorEl);

    return (
      <>
        <IconButton
          className="menu-button"
          color="inherit" aria-label="Menu"
          onClick={this.attachMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={menuOpen}
          onClose={this.detachMenu}
        >
          {this.renderMenuNavLink("/members", "Membership")}
          {this.renderMenuNavLink("/rentals", "Rentals")}
          {this.renderMenuNavLink("/billing", "Billing")}
          {this.renderMenuNavLink("/subscriptions", "Subscriptions")}
          <MenuItem onClick={this.detachMenu}>Profile</MenuItem>
          <MenuItem onClick={this.logoutUser}>Logout</MenuItem>
        </Menu>
      </>
    )
  }

  private logoutUser = () => {
    const { logout } = this.props;
    logout();
    this.detachMenu();
  }

  public render(): JSX.Element {
    const { auth } = this.props;
    const { authOpen } = this.state;

    return (
      <div className="root">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit" className="flex">
              Manchester Makerspace
            </Typography>
            {
              auth ?
                this.renderHambMenu()
              : <Button color="inherit" onClick={this.openSignIn}>
                  Login
                </Button>
            }
          </Toolbar>
        </AppBar>
        <Login
          isOpen={authOpen}
          onClose={this.closeSignIn}
        />
      </div>
    )
  }
}
