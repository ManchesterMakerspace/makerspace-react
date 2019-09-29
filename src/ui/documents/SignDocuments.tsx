import * as React from "react";
import useReactRouter from "use-react-router";

import Grid from "@material-ui/core/Grid";

import { updateMember, getMember, Member } from "makerspace-ts-api-client";
import { buildProfileRouting } from "../member/utils";
import { useAuthState } from "../reducer/hooks";
import useWriteTransaction from "../hooks/useWriteTransaction";
import CodeOfConduct from "./CodeOfConduct";
import MemberContract from "./MemberContract";
import useReadTransaction from "../hooks/useReadTransaction";

enum Documents {
  codeOfConduct = "code-of-conduct",
  memberContract = "member-contract",
}

const SignDocuments: React.FC<{ memberId: string }> = () => {
  const [display, setDisplay] = React.useState<Documents>(Documents.codeOfConduct);
  const { history } = useReactRouter();
  const { currentUser: { id: currentUserId } } = useAuthState();

  const onSuccess = React.useCallback(({ reset }) => {
    history.push(buildProfileRouting(currentUserId));
  }, [history]);
  const {
    isRequesting: updating,
    call: update
  } = useWriteTransaction(updateMember, onSuccess);

  const {
    refresh: refreshMember,
  } = useReadTransaction(getMember, currentUserId);

  const onContractAccept = React.useCallback(async (signature: string) => {
    await update(currentUserId, { signature });
    refreshMember();
  }, [update]);

  const onConductAccept = React.useCallback(() => {
    setDisplay(Documents.memberContract);
  }, [setDisplay]);

  let renderDoc;
  switch (display) {
    case Documents.codeOfConduct:
      renderDoc = <CodeOfConduct onAccept={onConductAccept} loading={updating}/>;    
      break;
    case Documents.memberContract:
      renderDoc = <MemberContract onAccept={onContractAccept} loading={updating}/>;    
      break;
  }

  return (
    <Grid container spacing={16} justify="center">
      <Grid item md={10} sm={12}>
        {renderDoc}
      </Grid>
    </Grid>
  );
}

export default SignDocuments;
