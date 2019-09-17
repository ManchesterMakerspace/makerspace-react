import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import { CrudOperation } from "app/constants";
import UpdateMemberContainer, { UpdateMemberRenderProps } from "ui/member/UpdateMemberContainer";
import MemberForm from "ui/member/MemberForm";
import PaymentMethodsContainer from "ui/checkout/PaymentMethodsContainer";
import UpdateMembershipForm from "ui/membership/UpdateMembershipForm";
import { Whitelists } from "app/constants";
import { getMember } from "makerspace-ts-api-client";
import useReadTransaction from "../hooks/useReadTransaction";
import { useAuthState } from "../reducer/hooks";


const SettingsContainer: React.FC = () => {
  const { currentUser: { id: currentUserId }, permissions } = useAuthState();
  const billingEnabled = !!permissions[Whitelists.billing];
  const [selectedIndex, setIndex] = React.useState(0);
  const {
    isRequesting: loadingMember,
    error: memberError,
    data: member,
    refresh: refreshMember
  } = useReadTransaction(getMember, currentUserId);

  return (
    <Grid container spacing={16}>
      <Grid item md={4} sm={5} xs={12}>
      <List component="nav">
        <ListItem
          button
          selected={selectedIndex === 0}
          onClick={() => setIndex(0)}
        >
          {/* <ListItemIcon>
          </ListItemIcon> */}
          <ListItemText
            id="settings-profile"
            primary="Profile Details"
          />
        </ListItem>
        {billingEnabled && <>
          <ListItem
            button
            selected={selectedIndex === 1}
            onClick={() => setIndex(1)}
          >
            {/* <ListItemIcon>
            </ListItemIcon> */}
            <ListItemText
              id="settings-membership"
              primary="Membership"
            />
          </ListItem>
          <ListItem
            button
            selected={selectedIndex === 2}
            onClick={() => setIndex(2)}
          >
            {/* <ListItemIcon>
            </ListItemIcon> */}
            <ListItemText
              id="settings-payment-methods"
              primary="Payment Methods"
            />
          </ListItem>
        </>}
      </List>
      </Grid>
      <Grid item md={8} sm={7} xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={16}>
                <Grid item xs={12}>
                  {
                    selectedIndex == 0 && (
                      <UpdateMemberContainer
                        closeHandler={() => {}}
                        operation={CrudOperation.Update}
                        isOpen={selectedIndex === 0}
                        member={member}
                        render={(renderProps: UpdateMemberRenderProps) => (
                          <MemberForm
                            ref={renderProps.setRef}
                            member={member || {}}
                            isAdmin={false}
                            isOpen={renderProps.isOpen}
                            isRequesting={loadingMember || renderProps.isRequesting}
                            error={memberError || renderProps.error}
                            onClose={renderProps.closeHandler}
                            onSubmit={renderProps.submit}
                            noDialog={true}
                            title="Update Profile Details"
                          />
                        )}
                      />
                    )
                  }
                  {
                    selectedIndex === 1 && (
                      <UpdateMembershipForm subscriptionId={member.subscriptionId} member={member} getMember={refreshMember} />
                    )
                  }
                  {
                    selectedIndex === 2 && (
                      <PaymentMethodsContainer
                        title="Manage Payment Methods"
                        managingMethods={true}
                      />
                    )
                  }
                </Grid>
              </Grid>
            </CardContent>
          </Card>
      </Grid>
    </Grid>
  )
};

export default SettingsContainer;
