import * as React from "react";

import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import LoadingOverlay from "../common/LoadingOverlay";

interface Props {
  id: string;
  src: string;
}

const buildDocumentUrl = (document: string) => `${process.env.BASE_URL || ""}/api/documents/${document}`;
export const documents = {
  memberContract: buildDocumentUrl("member_contract"),
  codeOfConduct: buildDocumentUrl("code_of_conduct"),
  rentalAgreement: buildDocumentUrl("rental_agreement"),
}

const DocumentFrame: React.FC<Props> = ({ id, src }) => {
  const [loading, setLoading] = React.useState(true);

  return (
    <Card style={{ height: "75vh" }}>
      <CardContent style={{ height: "100%" }}>
        <Grid container spacing={16} style={{ height: "100%" }}>
          <Grid item xs={12} style={{ height: "100%" }}>
            {loading && <LoadingOverlay id={id} />}
            <iframe
              id={id}
              name={id}
              src={src}
              style={{ height: "100%", width: "100%" }}
              onLoad={() => setLoading(false)}
              frameBorder={0}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DocumentFrame;