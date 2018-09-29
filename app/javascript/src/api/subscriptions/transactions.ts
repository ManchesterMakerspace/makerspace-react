import axios from "axios";
import { Url } from "app/constants";
import { buildJsonUrl, handleApiError } from "app/utils";
import { QueryParams } from "app/interfaces";
import { encodeQueryParams } from "api/utils/encodeQueryParams";

export const getSubscriptions = async (queryParams?: QueryParams) => {
  try {
    return await axios.get(buildJsonUrl(Url.Billing.Subscriptions), { params: encodeQueryParams(queryParams) });
  } catch (e) {
    const error = handleApiError(e);
    throw error;
  }
}