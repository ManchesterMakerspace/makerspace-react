import { TablePageObject } from "./table";
import utils from "./common";

const tableId = "rentals-table";
class RentalsPageObject extends TablePageObject {

  public actionButtons = {
    create: "#rentals-list-create",
    edit: "#rentals-list-edit",
    delete: "#rentals-list-delete",
    renew: "#rentals-list-renew",
  }

  private rentalFormId = "#invoice-form";
  public rentalForm = {
    id: `${this.rentalFormId}`,
    description: `${this.rentalFormId}-description`,
    number: `${this.rentalFormId}-number`,
    expiration: `${this.rentalFormId}-expiration`,
    member: `${this.rentalFormId}-member`,
    submit: `${this.rentalFormId}-submit`,
    cancel: `${this.rentalFormId}-cancel`,
    error: `${this.rentalFormId}-error`,
    loading: `${this.rentalFormId}-loading`,
  }


  private deleteRentalModalId = "#delete-rental";
  public deleteRentalModal = {
    id: `${this.deleteRentalModalId}-confirm`,
    number: `${this.deleteRentalModalId}-number`,
    description: `${this.deleteRentalModalId}-description`,
    member: `${this.deleteRentalModalId}-member`,
    submit: `${this.deleteRentalModalId}-submit`,
    cancel: `${this.deleteRentalModalId}-cancel`,
    error: `${this.deleteRentalModalId}-error`,
    loading: `${this.deleteRentalModalId}-loading`,
  }
}

export default new RentalsPageObject(tableId);