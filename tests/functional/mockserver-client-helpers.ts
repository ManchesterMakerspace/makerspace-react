import { Url } from "./paths";
import { QueryParams } from "app/interfaces";
import { RentalQueryParams } from "app/entities/rental";

import {
  Rental,
  Card,
  Plan,
  Member,
  Subscription,
  Invoice,
  InvoiceOption,
  Transaction,
  EarnedMembership,
  Report,
} from "makerspace-ts-api-client";
import { AuthForm } from "ui/auth/interfaces";
import { InvoiceQueryParams } from "app/entities/invoice";
import { PaymentMethod } from "app/entities/paymentMethod";
import { Permission } from "app/entities/permission";
import { CollectionOf } from "app/interfaces";
import { rootURL } from "../pageObjects/common";

enum Method {
  Get = "GET",
  Post = "POST",
  Put = "PUT",
  Delete = "DELETE",
  Patch = "PATCH"
}
interface HttpRequest {
  method: Method;
  path: string;
  body?: string;
  queryStringParameters?: {
    name: string,
    values: string[]
  }[]
}
interface HttpResponse {
  statusCode: number;
  body?: string;
  headers?: {
    name: string,
    value: string,
  }[];
}
export interface MockRequest {
  httpRequest: HttpRequest;
  httpResponse: HttpResponse;
}

const mockserver = require('mockserver-client').mockServerClient(process.env.MOCKSERVER_DOMAIN || 'localhost', 1080);
mockserver.setDefaultHeaders([
  { "name": "Content-Type", "values": ["application/json; charset=utf-8"] },
  { "name": "Cache-Control", "values": ["no-cache, no-store"] },
  { "name": "Access-Control-Allow-Origin", "values": [rootURL]},
]);

type AnyQueryParam = QueryParams;
const objectToQueryParams = (params: AnyQueryParam) => {
  if (!(params)) { return; }
  return Object.entries(params).map(([name, values]) => ({
    values: Array.isArray(values) ? values.map(v => String(v)) : [String(values)],
    name: Array.isArray(values) ? `${name}[]` : name
  }));
}

export const mockRequests = {
  accessCard: {
    get: {
      ok: (id: string, accessCard: Partial<Card>): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/api/admin/cards/${id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ card: accessCard })
        }
      })
    },
    post: {
      ok: (accessCard: Partial<Card>): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/api/admin/cards`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ card: accessCard })
        }
      })
    },
    put: {
      ok: (id: string, accessCard: Partial<Card>): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/api/admin/cards/${id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ card: accessCard })
        }
      })
    }
  },
  billingPlans: {
    get: {
      ok: (plans: Partial<Plan>[]): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Billing.Plans}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ plans })
        }
      })
    }
  },
  transactions: {
    post: {
      ok: (resultingTransaction: Transaction) => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Billing.Transactions}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ transaction: resultingTransaction })
        }
      })
    },
    get: {
      ok: (transactions: Partial<Transaction>[], queryParams?: QueryParams, admin: boolean = false): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: admin ? `/${Url.Admin.Billing.Transactions}` : `/${Url.Billing.Transactions}`
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ transactions }),
        }
      })
    }
  },
  transaction: {
    delete: {
      ok: (transactionId: string, admin: boolean = false) => ({
        httpRequest: {
          method: Method.Delete,
          path: `/${admin ? Url.Admin.Billing.Transactions : Url.Billing.Transactions}/${transactionId}`,
        },
        httpResponse: {
          statusCode: 204,
        }
      })
    }
  },
  subscriptions: {
    get: {
      ok: (subscriptions: Partial<Subscription>[], queryParams?: QueryParams, admin: boolean = false): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: admin ? `/${Url.Admin.Billing.Subscriptions}` : `/${Url.Billing.Subscriptions}`
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ subscriptions }),
        }
      })
    }
  },
  subscription: {
    get: {
      ok: (subscription: Partial<Subscription>, admin: boolean = false): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Billing.Subscriptions : Url.Billing.Subscriptions}/${subscription.id}`
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ subscription }),
        }
      })
    },
    delete: {
      ok: (subscriptionId: string, admin: boolean = false) => ({
        httpRequest: {
          method: Method.Delete,
          path: `/${admin ? Url.Admin.Billing.Subscriptions : Url.Billing.Subscriptions}/${subscriptionId}`,
        },
        httpResponse: {
          statusCode: 204,
        }
      })
    }
  },
  members: {
    get: {
      ok: (members: Partial<Member>[], queryParams?: QueryParams): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Members}`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(members.length) }],
          statusCode: 200,
          body: JSON.stringify({ members })
        }
      })
    },
    post: {
      ok: (member: Partial<Member>, memberId: string) => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Admin.Members}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ member: { ...member, id: memberId }})
        }
      })
    },
  },
  member: {
    get: {
      ok: (id: string, member: Partial<Member>, admin: boolean = false): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Members : Url.Members}/${id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({member})
        }
      })
    },
    put: {
      ok: (id: string, member: Partial<Member>, admin: boolean = false): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/${admin ? Url.Admin.Members : Url.Members}/${id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({member})
        }
      })
    }
  },
  passwordReset: {
    requestReset: {
      ok: (email: string): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: "/api/members/password",
          body: JSON.stringify({ member: { email } })
        },
        httpResponse: {
          statusCode: 200,
        }
      })
    },
    updatePassword: {
      ok: (token: string, password: string): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: "/api/members/password",
          body: JSON.stringify(
            {
              member: {
                resetPasswordToken: token,
                password
              }
            }
          )
        },
        httpResponse: {
          statusCode: 200,
        }
      })
    }
  },
  paymentMethods: {
    new: {
      ok: (clientToken: string) => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Billing.PaymentMethods}/new`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ clientToken })
        }
      })
    },
    get: {
      ok: (paymentMethods: PaymentMethod[]) => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Billing.PaymentMethods}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ paymentMethods })
        }
      })
    },
    post: {
      ok: (paymentMethodNonce: string, paymentMethodId: string, makeDefault = false) => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Billing.PaymentMethods}`,
          body: JSON.stringify({
            paymentMethod: {
              paymentMethodNonce,
              makeDefault
            }
          })
        },
        httpResponse: {
          statusCode: 200,
          body: paymentMethodId
        }
      })
    },
    delete: {
      ok: (paymentMethodId: string) => ({
        httpRequest: {
          method: Method.Delete,
          path: `/${Url.Billing.PaymentMethods}/${paymentMethodId}`,
        },
        httpResponse: {
          statusCode: 204,
        }
      }),
    }
  },
  permission: {
    get: {
      ok: (memberId: string, memberPermissions: CollectionOf<Permission>) => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Members}/${memberId}/permissions`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ permissions: memberPermissions })
        }
      })
    }
  },
  permissions: {
    get: {
      ok: (permissions: CollectionOf<Permission>) => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Admin.Permissions}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ permissions })
        }
      })
    },
  },
  rejectionCard: {
    get: {
      ok: (card: any) => ({
        httpRequest: {
          method: Method.Get,
          path: `/${Url.Admin.AccessCards}/new`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ card })
        }
      })
    }
  },
  rentals: {
    show: {
      ok: (rental: Partial<Rental>, queryParams: RentalQueryParams = {}, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Rentals : Url.Rentals}/${rental.id}`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ rental })
        }
      })
    },
    get: {
      ok: (rentals: Partial<Rental>[], queryParams: RentalQueryParams = {}, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Rentals : Url.Rentals}`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(rentals.length) }],
          statusCode: 200,
          body: JSON.stringify({ rentals })
        }
      })
    },
    post: {
      ok: (rental: Partial<Rental>): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Admin.Rentals}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ rental })
        }
      })
    },
    put: {
      ok: (rental: Partial<Rental>): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/${Url.Admin.Rentals}/${rental.id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ rental })
        }
      })
    },
    delete: {
      ok: (id: string): MockRequest => ({
        httpRequest: {
          method: Method.Delete,
          path: `/${Url.Admin.Rentals}/${id}`,
        },
        httpResponse: {
          statusCode: 204,
        }
      })
    }
  },
  signIn: {
    ok: (member: Partial<AuthForm | Member>): MockRequest => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignIn}`,
      },
      httpResponse: {
        statusCode: 200,
        body: JSON.stringify({ member })
      }
    }),
    error: () => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignIn}`,
      },
      httpResponse: {
        statusCode: 400,
      }
    })
  },
  signOut: {
    ok: () => ({
      httpRequest: {
        method: Method.Delete,
        path: `/${Url.Auth.SignIn}`,
      },
      httpResponse: {
        statusCode: 204,
      }
    }),
  },
  signUp: {
    ok: (member: Partial<AuthForm | Member>): MockRequest => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignUp}`,
      },
      httpResponse: {
        statusCode: 200,
        body: JSON.stringify({ member })
      }
    }),
    error: (statusCode?: string): MockRequest => ({
      httpRequest: {
        method: Method.Post,
        path: `/${Url.Auth.SignUp}`,
      },
      httpResponse: {
        statusCode: 400,
        body: "Email already exists"
      }
    })
  },
  invoices: {
    get: {
      ok: (invoices: Partial<Invoice>[], queryParams?: InvoiceQueryParams, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.Invoices : Url.Invoices}`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(invoices.length) }],
          statusCode: 200,
          body: JSON.stringify({invoices})
        }
      })
    },
    post: {
      ok: (invoice: Partial<Invoice>, admin = true): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${admin ? Url.Admin.Invoices : Url.Invoices}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ invoice })
        }
      })
    },
    put: {
      ok: (invoice: Invoice): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/${Url.Admin.Invoices}/${invoice.id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ invoice })
        }
      })
    },
    delete: {
      ok: (invoiceId: string): MockRequest => ({
        httpRequest: {
          method: Method.Delete,
          path: `/${Url.Admin.Invoices}/${invoiceId}`,
        },
        httpResponse: {
          statusCode: 204,
        }
      })
    }
  },
  invoiceOptions: {
    get: {
      ok: (invoiceOptions: Partial<InvoiceOption>[], queryParams?: QueryParams, admin = false): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.InvoiceOptions : Url.InvoiceOptions}`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(invoiceOptions.length) }],
          statusCode: 200,
          body: JSON.stringify({invoiceOptions})
        }
      })
    },
    post: {
      ok: (invoiceOption: Partial<InvoiceOption>): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.Admin.InvoiceOptions}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ invoiceOption })
        }
      })
    },
    put: {
      ok: (invoiceOption: InvoiceOption): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/${Url.Admin.InvoiceOptions}/${invoiceOption.id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ invoiceOption })
        }
      })
    },
    delete: {
      ok: (invoiceOptionId: string): MockRequest => ({
        httpRequest: {
          method: Method.Delete,
          path: `/${Url.Admin.InvoiceOptions}/${invoiceOptionId}`,
        },
        httpResponse: {
          statusCode: 204,
        }
      })
    }
  },
  earnedMemberships: {
    get: {
      ok: (earnedMemberships: Partial<EarnedMembership>[], queryParams?: AnyQueryParam, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.EarnedMemberships : Url.EarnedMemberships}`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(earnedMemberships.length) }],
          statusCode: 200,
          body: JSON.stringify({ earnedMemberships })
        }
      })
    },
    post: {
      ok: (earnedMembership: Partial<EarnedMembership>, admin = true): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${admin ? Url.Admin.EarnedMemberships : Url.EarnedMemberships}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ earnedMembership })
        }
      })
    },
    show: {
      ok: (earnedMembership: Partial<EarnedMembership>, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.EarnedMemberships : Url.EarnedMemberships}/${earnedMembership.id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ earnedMembership })
        }
      })
    },
    put: {
      ok: (earnedMembership: EarnedMembership): MockRequest => ({
        httpRequest: {
          method: Method.Put,
          path: `/${Url.Admin.EarnedMemberships}/${earnedMembership.id}`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ earnedMembership })
        }
      })
    }
  },
  earnedMembershipReports: {
    get: {
      ok: (membershipId: string, reports: Partial<Report>[], queryParams?: AnyQueryParam, admin?: boolean): MockRequest => ({
        httpRequest: {
          method: Method.Get,
          path: `/${admin ? Url.Admin.EarnedMemberships : Url.EarnedMemberships}/${membershipId}/reports`,
          ...queryParams && {
            queryStringParameters: objectToQueryParams(queryParams)
          }
        },
        httpResponse: {
          headers: [{ name: "total-items", value: String(reports.length) }],
          statusCode: 200,
          body: JSON.stringify({ reports })
        }
      })
    },
    post: {
      ok: (membershipId: string, report: Partial<Report>): MockRequest => ({
        httpRequest: {
          method: Method.Post,
          path: `/${Url.EarnedMemberships}/${membershipId}/reports`,
        },
        httpResponse: {
          statusCode: 200,
          body: JSON.stringify({ report })
        }
      })
    },
  },
}


// By default, mocks 1 response, but can be configured to mock unlimited or specified num
export const mock = (requestObject: MockRequest, times: number = 1) => {
  const configuredRequest = {
    ...requestObject,
    times: {
      ...times ? {
        remainingTimes: times,
      } : {
        unlimited: true
      },
    }
  };
  return mockserver.mockAnyResponse(configuredRequest);
}

export const reset = () => mockserver.reset();
