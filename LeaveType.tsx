import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { InputSwitch } from 'primereact/inputswitch';

// Column
import { LeaveTypeColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    LeaveTypeDropdown,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { leaveTypeValidate } from '../../../config/Validate';

export const LeaveType = () => {
    document.title = "Leave Type | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Leave Type</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);

    // Page service
    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [leaveTypeList, setLeaveTypeList] = useState<any>([]);
    const [addLeaveTypeModal, setAddLeaveTypeModal] = useState<boolean>(false);
    const [addLeaveTypeLoader, setAddLeaveTypeLoader] = useState<boolean>(false);
    const [leaveTypeData, setLeaveTypeData] = useState<any>({});
    const [editId, setEditId] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    const [statusChangeLoader, setStatusChangeLoader] = useState<boolean>(false);

    // useEffect
    useEffect(() => {
        getLeaveTypesFromAPi();
    }, []);

    // Get leave types from api
    const getLeaveTypesFromAPi = () => {
        // Api call
        pageService
            .getAllLeaveType()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setLeaveTypeList([]);
                    } else {
                        setLeaveTypeList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                }
            });
    };

    // Get single leave type data
    const getSingleLeaveTypeData = (id: any) => {
        pageService.getSingleLeaveType(id).then((response) => {
            // Get response
            if (response) {
                const responseData = response;
                setLeaveTypeData({
                    "name": response?.name,
                    "type": { name: response?.type, code: response?.type },
                    "total_leave_count": response?.total_leave_count
                });
                setPageLoad(true);
            } else {
                setPageLoad(true);
                setLeaveTypeData({});
            }
        });
    };

    // Change leave type status api call
    const changeLeaveTypeStatusApiCall = (val: any, rowData: any) => {
        setStatusChangeLoader(true);

        // request data
        let formData: any = new FormData();

        formData.append("id", rowData?.id);
        formData.append("status", val);

        // call api
        pageService.changeLeaveTypeStatus(formData).then((response) => {
            // Get response
            if (response) {
                setStatusChangeLoader(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                getLeaveTypesFromAPi();
            } else {
                setStatusChangeLoader(false);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong, Please try again.',
                });
            }
        }).catch(error => {
            setStatusChangeLoader(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Message',
                detail: error.response.data.error,
            });
        });
    };

    // Template for actions
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <div className="tb-actions">
                <InputSwitch className="mr-2" checked={rowData?.status === 1 ? true : false} onChange={(e) => changeLeaveTypeStatusApiCall(e.value, rowData)} />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    tooltip="Update"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => openEditLeaveTypeModal(rowData.id)}
                />
            </div>
        )
    };

    // Open add leave type modal
    const openAddLeaveTypeModal = () => {
        setAddLeaveTypeModal(true);
    };

    // Open edit leave type modal
    const openEditLeaveTypeModal = (id: any) => {
        setEditId(id);
        getSingleLeaveTypeData(id);
        setAddLeaveTypeModal(true);
    };

    // Close add update leave type modal
    const closeAddLeaveTypeModal = () => {
        setEditId(null);
        setErrors({});
        setLeaveTypeData({});
        setAddLeaveTypeLoader(false);
        setAddLeaveTypeModal(false);
    };

    //On Change Leave Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == "type") {
            val = e;
        } else {
            val = (e.target && e.target.value) || '';
        }
        setLeaveTypeData({ ...leaveTypeData, [name]: val });
    };

    // Add update leave type
    const addUpdateLeaveTypeApiCall = () => {
        const { errors, isError } = leaveTypeValidate(leaveTypeData);
        setErrors(errors);
        if (!isError) {
            setAddLeaveTypeLoader(true);

            // request data
            let formData = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            }

            formData.append("name", leaveTypeData?.name);
            formData.append("type", leaveTypeData?.type?.code);
            formData.append("total_leave_count", leaveTypeData?.total_leave_count);

            // call api
            pageService.addUpdateLeaveType(formData).then((response) => {
                // Get response
                if (response) {
                    setAddLeaveTypeLoader(false);
                    setAddLeaveTypeModal(false);
                    setLeaveTypeData({});
                    setEditId(null);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getLeaveTypesFromAPi();
                } else {
                    setAddLeaveTypeLoader(false);
                    setAddLeaveTypeModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setAddLeaveTypeLoader(false);
                setAddLeaveTypeModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Leave Type</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <Toolbar className="page-header-search-area"></Toolbar>
                        </div>
                        <Button className="p-button mr-2" label="New Leave Type" onClick={() => openAddLeaveTypeModal()} />
                    </div>
                </div>
            </div>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            {/* Datatable Start */}
                            {pageLoad ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive" stripedRows
                                        value={leaveTypeList}
                                        paginator={leaveTypeList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Leave Type Found"
                                    >
                                        {LeaveTypeColumns.map((col, i) => {
                                            if (col.field === 'action') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={actionBodyTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'sr_no') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={(_, { rowIndex }) => rowIndex + 1}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        sortable
                                                        filter
                                                    />
                                                );
                                            }
                                        })}
                                    </DataTable>
                                </>
                            ) : (
                                <>
                                    {/* Skeleton Data table */}
                                    <DataTable value={Skeletonitems}>
                                        {LeaveTypeColumns.map((col, i) => (
                                            <Column
                                                key={col.field}
                                                field={col.field}
                                                header={col.header}
                                                body={SkeletonbodyTemplate}
                                            />
                                        ))}
                                    </DataTable>
                                </>
                            )}
                            {/* Datatable End */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Update Dialog */}
            <Dialog
                visible={addLeaveTypeModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={editId !== null ? "Update Leave Type Details" : "Add New Leave Type"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeAddLeaveTypeModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addUpdateLeaveTypeApiCall()}
                            loading={addLeaveTypeLoader}
                        />
                    </>
                }
                onHide={closeAddLeaveTypeModal}
            >
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">Name <span className="required">*</span></label>
                        <InputText
                            value={leaveTypeData?.name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Name"
                            onChange={(e) => onInputChange(e, "name")}
                            className={errors['name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['name']}</small>
                    </div>

                    <div className="field col-6">
                        <label htmlFor="name">Type <span className="required">*</span></label>
                        <Dropdown
                            value={leaveTypeData?.type}
                            name="name"
                            options={LeaveTypeDropdown}
                            filter
                            optionLabel="name"
                            placeholder="Select Leave Type"
                            onChange={(e) => onInputChange(e.value, "type")}
                            className={errors['type'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['type']}</small>
                    </div>

                    <div className="field col-6">
                        <label htmlFor="name">Leaves Per year <span className="required">*</span></label>
                        <InputText
                            value={leaveTypeData?.total_leave_count}
                            name="name"
                            type='number'
                            autoComplete="off"
                            placeholder="Enter Total Leaves Per Year"
                            onChange={(e) => onInputChange(e, "total_leave_count")}
                            className={errors['total_leave_count'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['total_leave_count']}</small>
                    </div>
                </div>
            </Dialog>
        </>
    )
};

