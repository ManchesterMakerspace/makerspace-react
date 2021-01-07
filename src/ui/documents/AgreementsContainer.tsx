import * as React from "react";
import useReactRouter from "use-react-router";
import { useAuthState } from "../reducer/hooks";
import { buildProfileRouting } from "../member/utils";
import MembershipAgreement from "./MembershipAgreement";
import RentalAgreement from "./RentalAgreement";


const resources = ["membership", "rental"];

const AgreementContainer: React.FC = () => {
  const { 
    history, 
    match: { params: { resource, resourceId } } 
  } = useReactRouter<{ resource: string, resourceId: string }>();
  const { currentUser: { id } } = useAuthState();

  React.useEffect(() => {
    if (!resources.includes(resource)) {
      history.push(buildProfileRouting(id));
    }
  }, []);

  return (
    resource === "membership" ? 
      <MembershipAgreement />
      : <RentalAgreement rentalId={resourceId} />
  );
};

export default AgreementContainer;
