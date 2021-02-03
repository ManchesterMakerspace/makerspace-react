export const basicUserLogins = new Array(5).fill(undefined).map((_, index) => ({
  email: `basic_member${index}@test.com`,
  password: "password"
}));
export const getBasicUserLogin = () => basicUserLogins.length && basicUserLogins.pop();

export const adminUserLogins = new Array(5).fill(undefined).map((_, index) => ({
  email: `admin_member${index}@test.com`,
  password: "password"
}));
export const getAdminUserLogin = () => adminUserLogins.length && adminUserLogins.pop();

export const paypalUserLogins = new Array(5).fill(undefined).map((_, index) => ({
  email: `paypal_member${index}@test.com`,
  firstname: "PayPal",
  lastname: `Member${index}`,
  password: "password"
}));

export const invoiceOptionIds = {
  monthly: "one-month",
  quarterly: "three-months",
  annualy: "one-year"
};

export const cardIds = ["0001", "0002", "0000"];

const getRakeCmd = () => {
  let baseCmd = "RAILS_ENV=test";
  if (process.env.RAILS_DIR) {
    baseCmd += ` BUNDLE_GEMFILE=${process.env.RAILS_DIR}/Gemfile`
  }
  baseCmd += " bundle exec rake";
  if (process.env.RAILS_DIR) {
    baseCmd += ` -f ${process.env.RAILS_DIR}/Rakefile`
  }
  return baseCmd;
}

export const resetDb = async () => {
  const cp = require('child_process');
  return new Promise((resolve, reject) => {
    cp.exec(`${getRakeCmd()} db:db_reset`, (error: Error) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve();
    });
  });
};

export const createRejectCard = (cardNumber: string) => {
  const cp = require('child_process');
  return new Promise((resolve, reject) => {
    cp.exec(`${getRakeCmd()} db:reject_card["${cardNumber}"]`, (error: Error) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve();
    })
  })
};

export const cancelMemberSubscription = (memberEmail: string, paypal?: boolean) => {
  const cp = require('child_process');
  return new Promise((resolve, reject) => {
    const cmd = paypal ? "paypal_webhook" : "braintree_webhook";
    cp.exec(`${getRakeCmd()} db:${cmd}["${memberEmail}"]`, (error: Error) => {
      if (error) {
        console.log(error);
        reject(error);
      }
      resolve();
    })
  })
}

export const creditCardNumbers = {
  visa: "4111111111111111",
  mastercard: "5555555555554444",
  amex: "378282246310005",
  discover: "6011111111111117",
  debit: "4012000033330125",
  invalid: "4000111111111115",
};
