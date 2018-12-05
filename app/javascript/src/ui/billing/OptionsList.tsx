import * as React from "react";
import { connect } from "react-redux";
import Grid from "@material-ui/core/Grid";

import { InvoiceOption, InvoiceOperation, InvoiceableResource } from "app/entities/invoice";
import { CrudOperation } from "app/constants";
import { CollectionOf, QueryParams } from "app/interfaces";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import Form from "ui/common/Form";
import { Column } from "ui/common/table/Table";
import { readOptionsAction, readBillingPlansAction } from "ui/billing/actions";
import ButtonRow from "ui/common/ButtonRow";
import BillingForm from "ui/billing/BillingForm";
import DeleteInvoiceOptionModal from "ui/billing/DeleteInvoiceOptionModal";
import UpdateBillingContainer, { UpdateBillingRenderProps } from "ui/billing/UpdateBillingContainer";
import { BillingPlan } from "app/entities/billingPlan";
import { InvoiceOptionQueryParams } from "api/invoices/interfaces";
import StatusLabel from "ui/common/StatusLabel";
import { Status } from "ui/common/constants";

interface OwnProps { }
interface DispatchProps {
  getOptions: (queryParams?: InvoiceOptionQueryParams) => void;
  getBillingPlans: (type: InvoiceableResource) => void;
}
interface StateProps {
  billingPlans: CollectionOf<BillingPlan>;
  options: CollectionOf<InvoiceOption>;
  totalItems: number;
  loading: boolean;
  error: string;
  isCreating: boolean;
  createError: string;
  plansLoading: boolean;
  plansError: string;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedId: string;
  pageNum: number;
  orderBy: string;
  search: string;
  order: SortDirection;
  openCreateForm: boolean;
  openEditForm: boolean;
  openDeleteConfirm: boolean;
}

const fields: Column<InvoiceOption>[] = [
  {
    id: "name",
    label: "Name",
    cell: (row: InvoiceOption) => row.name,
  }, {
    id: "description",
    label: "Description",
    cell: (row: InvoiceOption) => row.description,
  }, {
    id: "quantity",
    label: "Billing Frequency",
    cell: (row: InvoiceOption) => row.quantity,
  }, {
    id: "amount",
    label: "Amount",
    cell: (row: InvoiceOption) => row.amount,
  },
  {
    id: "disabled",
    label: "Disabled",
    cell: (row: InvoiceOption) => row.disabled ? <StatusLabel label="Disabled" color={Status.Default}/>
                                                : <StatusLabel label="Enabled" color={Status.Success} />,
  }
];

class OptionsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedId: undefined,
      pageNum: 0,
      orderBy: "",
      search: "",
      order: SortDirection.Asc,
      openCreateForm: false,
      openEditForm: false,
      openDeleteConfirm: false,
    };
  }
  public componentDidMount() {
    this.getOptions();
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    const { isCreating: wasCreating, options: priorInvoices, loading: wasLoading } = prevProps;
    const { isCreating, createError, options, loading } = this.props;

    // Set initial selection on initial load
    if (
      (wasLoading && !loading) && // Has finished reading
      (prevState === this.state) // State is static - Nothing can happen during initial load
    ) {
      this.setState({ selectedId: undefined });
    }

    if ((wasCreating && !isCreating && !createError) // refresh list on create
    ) {
      this.getOptions();
    }
  }

  private getQueryParams = (): InvoiceOptionQueryParams => {
    const {
      pageNum,
      orderBy,
      order,
      search
    } = this.state
    return {
      pageNum,
      orderBy,
      order,
      search,
      types: Object.values(InvoiceableResource)
    };
  }
  private getOptions = () => {
    this.setState({ selectedId: undefined });
    this.props.getOptions(this.getQueryParams());
  }
  private openCreateForm = () => this.setState({ openCreateForm: true });
  private closeCreateForm = () => this.setState({ openCreateForm: false });
  private openEditForm = () => this.setState({ openEditForm: true });
  private closeEditForm = () => this.setState({ openEditForm: false });
  private openDeleteConfirm = () => this.setState({ openDeleteConfirm: true });
  private closeDeleteConfirm = () => this.setState({ openDeleteConfirm: false });

  private renderBillingForms = () => {
    const { options, getBillingPlans, billingPlans, plansLoading, plansError } = this.props;
    const { selectedId, openCreateForm, openEditForm, openDeleteConfirm } = this.state;

    const editForm = (renderProps: UpdateBillingRenderProps) => (
      <BillingForm
        ref={renderProps.setRef}
        option={renderProps.billingOption}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        getBillingPlans={getBillingPlans}
        billingPlans={billingPlans}
        plansLoading={plansLoading}
        plansError={plansError}
      />
    );

    const createForm = (renderProps: UpdateBillingRenderProps) => (
      <BillingForm
        ref={renderProps.setRef}
        option={renderProps.billingOption}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
        getBillingPlans={getBillingPlans}
        billingPlans={billingPlans}
        plansLoading={plansLoading}
        plansError={plansError}
      />
    );

    const deleteModal = (renderProps: UpdateBillingRenderProps) => {
      const submit = async (form: Form) => {
        const success = await renderProps.submit(form);
        success && this.setState({ selectedId: undefined });
      }
      return (
        <DeleteInvoiceOptionModal
          ref={renderProps.setRef}
          option={renderProps.billingOption}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isRequesting}
          error={renderProps.error}
          onClose={renderProps.closeHandler}
          onSubmit={submit}
        />
      );
    }

    return (
      <>
        <UpdateBillingContainer
          operation={CrudOperation.Update}
          isOpen={openEditForm}
          billingOption={options[selectedId]}
          closeHandler={this.closeEditForm}
          render={editForm}
        />
        <UpdateBillingContainer
          operation={CrudOperation.Create}
          isOpen={openCreateForm}
          billingOption={{ operation: InvoiceOperation.Renew }}
          closeHandler={this.closeCreateForm}
          render={createForm}
        />
        <UpdateBillingContainer
          operation={CrudOperation.Delete}
          isOpen={openDeleteConfirm}
          billingOption={options[selectedId]}
          closeHandler={this.closeDeleteConfirm}
          render={deleteModal}
        />
      </>
    )
  }

  private rowId = (row: InvoiceOption) => row.id;
  private getActionButtons = () => {
    const { selectedId } = this.state;
    return (
      <ButtonRow
        actionButtons={[{
          id: "billing-list-create",
          variant: "contained",
          color: "primary",
          onClick: this.openCreateForm,
          label: "Create Billing Option"
        }, {
          id: "billing-list-renew",
          variant: "outlined",
          color: "primary",
          disabled: !selectedId,
          onClick: this.openEditForm,
          label: "Edit Billing Option"
        }, {
          id: "billing-list-renew",
          variant: "contained",
          color: "secondary",
          disabled: !selectedId,
          onClick: this.openDeleteConfirm,
          label: "Delete Billing Option"
        }]}
      />
    )
  }

  // Only select one at a time
  private onSelect = (id: string, selected: boolean) => {
    if (selected) {
      this.setState({ selectedId: id });
    } else {
      this.setState({ selectedId: undefined });
    }
  }
  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      this.getOptions
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getOptions
    );
  }

  public render(): JSX.Element {
    const { options: data, totalItems, loading, error } = this.props;
    const {
      selectedId,
      pageNum,
      order,
      orderBy,
    } = this.state;

    return (
      <>
        <Grid style={{ paddingTop: 20 }}>
          {this.getActionButtons()}
        </Grid>
        <TableContainer
          id="billing-options-table"
          title="Billing Options"
          loading={loading}
          data={Object.values(data)}
          error={error}
          totalItems={totalItems}
          selectedIds={[selectedId]}
          pageNum={pageNum}
          columns={fields}
          order={order}
          orderBy={orderBy}
          onSort={this.onSort}
          rowId={this.rowId}
          onPageChange={this.onPageChange}
          onSelect={this.onSelect}
        />
        {this.renderBillingForms()}
      </>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    entities: options,
    billingPlans: {
      entities: billingPlans,
      isRequesting: plansLoading,
      error: plansError,
    },
    read: {
      totalItems,
      isRequesting: loading,
      error
    },
    create: {
      isRequesting: isCreating,
      error: createError
    }
  } = state.billing;
  return {
    options,
    billingPlans,
    totalItems,
    loading,
    error,
    isCreating,
    createError,
    plansLoading,
    plansError,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch
): DispatchProps => {
  return {
    getOptions: (queryParams) => dispatch(readOptionsAction(queryParams)),
    getBillingPlans: (type) => dispatch(readBillingPlansAction([type]))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OptionsList);