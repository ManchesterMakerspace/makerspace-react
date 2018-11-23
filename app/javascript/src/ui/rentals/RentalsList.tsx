import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";


import { Rental, Properties } from "app/entities/rental";
import { QueryParams, CollectionOf } from "app/interfaces";
import { MemberDetails } from "app/entities/member";

import { State as ReduxState, ScopedThunkDispatch } from "ui/reducer";
import { SortDirection } from "ui/common/table/constants";
import TableContainer from "ui/common/table/TableContainer";
import { Column } from "ui/common/table/Table";
import { readRentalsAction } from "ui/rentals/actions";
import { Status } from "ui/constants";
import StatusLabel from "ui/common/StatusLabel";
import { timeToDate } from "ui/utils/timeToDate";
import { CrudOperation } from "app/constants";
import RentalForm from "ui/rentals/RentalForm";
import UpdateRentalContainer, { UpdateRentalRenderProps } from "ui/rentals/UpdateRentalContainer";
import DeleteRentalModal from "ui/rentals/DeleteRentalModal";
import ButtonRow, { ActionButton } from "ui/common/ButtonRow";
import Form from "ui/common/Form";

interface OwnProps {
  member?: MemberDetails;
  fields?: Column<Rental>[];
}
interface DispatchProps {
  getRentals: (admin: boolean, queryParams?: QueryParams) => void;
}
interface StateProps {
  rentals: CollectionOf<Rental>;
  totalItems: number;
  isReading: boolean;
  readError: string;
  isCreating: boolean;
  createError: string;
  isUpdating: boolean;
  updateError: string;
  admin: boolean;
}
interface Props extends OwnProps, DispatchProps, StateProps { }
interface State {
  selectedIds: string[];
  pageNum: number;
  orderBy: string;
  order: SortDirection;
  modalOperation: CrudOperation;
  openRentalForm: boolean;
}

class RentalsList extends React.Component<Props, State> {
  private fields: Column<Rental>[] = [
    {
      id: "number",
      label: "Number",
      cell: (row: Rental) => row.number,
      defaultSortDirection: SortDirection.Desc,
    },
    {
      id: "description",
      label: "Description",
      cell: (row: Rental) => row.description,
    },
    {
      id: "expiration",
      label: "Expiration Date",
      cell: (row: Rental) => timeToDate(row.expiration),
      defaultSortDirection: SortDirection.Desc,
    },
    ...this.props.admin ? [{
      id: "member",
      label: "Member",
      cell: (row: Rental) => row.memberName,
      defaultSortDirection: SortDirection.Desc,
      width: 200
    }] : [],
    {
      id: "status",
      label: "Status",
      cell: (row: Rental) => {
        const current = moment(row.expiration).valueOf() > Date.now();
        const statusColor = current ? Status.Success : Status.Danger;
        const label = current ? "Active" : "Expired";

        return (
          <StatusLabel label={label} color={statusColor}/>
        );
      },
    }
  ];

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIds: [],
      pageNum: 0,
      orderBy: "",
      order: SortDirection.Asc,
      modalOperation: undefined,
      openRentalForm: false,
    };
  }

  private openCreateModal = () => this.openRentalModal(CrudOperation.Create);
  private openUpdateModal = () => this.openRentalModal(CrudOperation.Update);
  private openDeleteModal = () => this.openRentalModal(CrudOperation.Delete);
  private openRentalModal = (operation: CrudOperation) => this.setState({ openRentalForm: true, modalOperation: operation });
  private closeRentalModal = () => { console.log("CLosing"); this.setState({ openRentalForm: false }); };

  private getActionButtons = () => {
    const { selectedIds } = this.state;
    const { admin } = this.props;
    const actionButtons: ActionButton[] = [
      ...admin ? [{
        id: "rentals-list-create",
        variant: "contained",
        color: "primary",
        onClick: this.openCreateModal,
        label: "Create New Rental"
      }, {
        id: "rentals-list-edit",
        variant: "outlined",
        color: "primary",
        disabled: !Array.isArray(selectedIds) || selectedIds.length !== 1,
          onClick: this.openUpdateModal,
        label: "Edit Rental"
      }, {
        id: "rentals-list-delete",
        variant: "contained",
        color: "secondary",
        disabled: !Array.isArray(selectedIds) || selectedIds.length !== 1,
          onClick: this.openDeleteModal,
        label: "Delete Rental"
      }] as ActionButton[] : [],
    ];

    return (
      <ButtonRow
        actionButtons={actionButtons}
      />
    )
  }

  private getQueryParams = (): QueryParams => {
    const { pageNum, orderBy, order } = this.state
    return { pageNum, orderBy, order };
  }

  public componentDidMount() {
    this.getRentals();
  }

  public componentDidUpdate(prevProps: Props) {
    const { isCreating: wasCreating, isUpdating: wasUpdating, member: oldMember } = prevProps;
    const { isCreating, createError, isUpdating, updateError, member } = this.props;


    if ((wasCreating && !isCreating && !createError) || // refresh list on create
        (wasUpdating && !isUpdating && !updateError) ||  // or update
        (oldMember !== member) // or member change
    ) {
      this.getRentals();
    }
  }

  private getRentals = () => {
    const { admin } = this.props;
    this.props.getRentals(admin, this.getQueryParams());
  }
  private rowId = (row: Rental) => row.id;

  private onSort = (prop: string) => {
    const orderBy = prop;
    let order = SortDirection.Desc;
    if (this.state.orderBy === orderBy && this.state.order === order) {
      order = SortDirection.Asc;
    }
    this.setState({ order, orderBy, pageNum: 0 },
      this.getRentals
    );
  }

  private onPageChange = (newPage: number) => {
    this.setState({ pageNum: newPage },
      this.getRentals
    );
  }


  // Only select one at a time
  private onSelect = (id: string, _selected: boolean) => {
    this.setState(currentState => {
      const updatedIds = currentState.selectedIds.slice();
      const existingIndex = currentState.selectedIds.indexOf(id);
      if (existingIndex > -1) {
        updatedIds.splice(existingIndex, 1)
      } else {
        updatedIds.push(id)
      }
      return { selectedIds: updatedIds };
    })
  }

  private onSelectAll = () => {
    this.setState(currentState => {
      const allIds = Object.keys(this.props.rentals);
      if (currentState.selectedIds.length === allIds.length) {
        return { selectedIds: [] };
      } else {
        return { selectedIds: allIds };
      }
    })
  }

  private renderInvoiceForms = () => {
    const { selectedIds, openRentalForm, modalOperation } = this.state;
    const { rentals, member, admin } = this.props;

    const editForm = (renderProps: UpdateRentalRenderProps) => (
      <RentalForm
        ref={renderProps.setRef}
        rental={renderProps.rental}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    );

    const createForm = (renderProps: UpdateRentalRenderProps) => (
      <RentalForm
        ref={renderProps.setRef}
        rental={renderProps.rental}
        isOpen={renderProps.isOpen}
        isRequesting={renderProps.isRequesting}
        error={renderProps.error}
        onClose={renderProps.closeHandler}
        onSubmit={renderProps.submit}
      />
    );


    const deleteModal = (renderProps: UpdateRentalRenderProps) => {
      const submit = async (form: Form) => {
        const success = await renderProps.submit(form);
        success && this.setState({ selectedIds: [] });
      }
      return (
        <DeleteRentalModal
          ref={renderProps.setRef}
          rental={renderProps.rental}
          isOpen={renderProps.isOpen}
          isRequesting={renderProps.isRequesting}
          error={renderProps.error}
          onClose={renderProps.closeHandler}
          onSubmit={submit}
        />
      );
    }

    const selectedId = selectedIds.length === 1 && selectedIds[0];

    return (admin &&
      <>
        <UpdateRentalContainer
          operation={CrudOperation.Update}
          isOpen={openRentalForm && modalOperation === CrudOperation.Update}
          rental={rentals[selectedId]}
          closeHandler={this.closeRentalModal}
          render={editForm}
        />
        <UpdateRentalContainer
          operation={CrudOperation.Create}
          isOpen={openRentalForm && modalOperation === CrudOperation.Create}
          rental={member ?{ memberId: member.id, memberName: `${member.firstname} ${member.lastname}` } : {}}
          closeHandler={this.closeRentalModal}
          render={createForm}
        />

        <UpdateRentalContainer
          operation={CrudOperation.Delete}
          isOpen={openRentalForm && modalOperation === CrudOperation.Delete}
          rental={rentals[selectedId]}
          closeHandler={this.closeRentalModal}
          render={deleteModal}
        />
      </>
    );
  }


  public render(): JSX.Element {
    const { rentals, totalItems, isReading, readError, admin } = this.props;

    const { selectedIds, pageNum, order, orderBy } = this.state;

    return (
      <>
        {
          admin && (
            this.getActionButtons()
          )
        }
        <TableContainer
          id="rentals-table"
          title="Rentals"
          loading={isReading}
          data={Object.values(rentals)}
          error={readError}
          totalItems={totalItems}
          selectedIds={selectedIds}
          pageNum={pageNum}
          columns={this.fields}
          order={order}
          orderBy={orderBy}
          onSort={this.onSort}
          rowId={this.rowId}
          onPageChange={this.onPageChange}
          onSelect={this.onSelect}
          onSelectAll={this.onSelectAll}
        />
        {this.renderInvoiceForms()}
      </>
    );
  }
}

const mapStateToProps = (
  state: ReduxState,
  _ownProps: OwnProps
): StateProps => {
  const {
    entities: rentals,
    read: {
      totalItems,
      isRequesting: isReading,
      error: readError
    },
    create: {
      isRequesting: isCreating,
      error: createError
    },
    update: {
      isRequesting: isUpdating,
      error: updateError
    }
  } = state.rentals;

  const { currentUser: { isAdmin: admin } } = state.auth;
  return {
    rentals,
    totalItems,
    isReading,
    readError,
    isCreating,
    createError,
    isUpdating,
    updateError,
    admin,
  }
}

const mapDispatchToProps = (
  dispatch: ScopedThunkDispatch,
  ownProps: OwnProps
): DispatchProps => {
  const { member } = ownProps;
  return {
    getRentals: (admin, queryParams) => dispatch(
      readRentalsAction(admin, {
        ...queryParams,
      ...member && { [Properties.MemberId]: member.id},
      })
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RentalsList);