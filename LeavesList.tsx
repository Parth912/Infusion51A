import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

//Prime React Component Inbuilt
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { BreadCrumb } from 'primereact/breadcrumb';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';

import moment from "moment/moment";

// Column
import { EmployeeLeavesListColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { applyLeaveValidate } from '../../../config/Validate';

export const LeavesList = () => {
    document.title = "Leaves | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Leaves</span>
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
    const [leavesList, setLeavesList] = useState<any>([]);
    const [applyLeaveModal, setApplyLeaveModal] = useState<boolean>(false);
    const [applyLeaveLoader, setApplyLeaveLoader] = useState<boolean>(false);
    const [leaveData, setLeaveData] = useState<any>({});
    const [editId, setEditId] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    const [leaveTypes, setLeaveTypes] = useState<any>([]);
    const [isLeaveDataUpdate, setIsExtraArrayUpdate] = useState<boolean>(false);

    // useEffect
    useEffect(() => {
        getLeaveTypes();
        getAllLeavesFromAPI();
    }, []);

    useEffect(() => {
        if (isLeaveDataUpdate) {
            setIsExtraArrayUpdate(false);
            applyForJobUI();
        }
    }, [isLeaveDataUpdate]);

    // Get leave types
    const getAllLeavesFromAPI = () => {
        pageService
            .getAllLeaves(localStorage.getItem("id"))
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setLeavesList([]);
                    } else {
                        setLeavesList(DataList);
                        setPageLoad(true);
                    }
                }
            });
    };

    // Get all leaves
    const getLeaveTypes = () => {
        pageService
            .getAllLeaveType("selection")
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setLeaveTypes([]);
                    } else {
                        setLeaveTypes(DataList);
                    }
                }
            });
    };

    // Template for actions
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>

            </>
        )
    };

    // Template for status
    const statusTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.status === "Pending" ? <Badge severity='warning' value="Pending" /> : rowData?.status === "Rejected" ? <Badge severity='danger' value="Rejected" /> : <Badge severity='success' value="Approved" />}
            </>
        )
    };

    // Template for half leave
    const halfLeaveTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                {rowData?.is_half === 0 ? "No" : "Yes"}
            </>
        )
    };

    // Template for leave type
    const leaveTypeBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.leave_type?.name}
            </>
        )
    };

    // Open apply leave modal
    const openApplyLeaveModal = () => {
        setApplyLeaveModal(true);
    };

    // Open apply leave modal
    const openEditLeaveModal = (id: any) => {
        setEditId(id);
        setApplyLeaveModal(true);
    };

    // Close apply leave modal
    const closeApplyLeaveModal = () => {
        setEditId(null);
        setErrors({});
        setLeaveData({});
        setApplyLeaveLoader(false);
        setApplyLeaveModal(false);
    };

    //On Change Leave Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name === "leave_type_id") {
            val = e;
            setLeaveData({ ...leaveData, [name]: val });
        } else if (name === 'is_half') {
            if (e.checked) {
                val = e.value || '';
            } else {
                val = "";
            }
            setLeaveData({ ...leaveData, [name]: val });
        } else if (name === 'from_date' || name === 'to_date') {
            val = e;
            let tempLeaveData = leaveData;
            if (name === 'from_date' && tempLeaveData?.to_date === undefined){
                tempLeaveData["from_date"] = val;
                tempLeaveData["to_date"] = val;
                setLeaveData(tempLeaveData);
            }else{
                setLeaveData({ ...leaveData, [name]: val });
            }
        } else {
            val = (e.target && e.target.value) || '';
            setLeaveData({ ...leaveData, [name]: val });
        }
        setIsExtraArrayUpdate(true);
    };

    // Apply leave
    const applyLeaveApiCall = () => {
        const { errors, isError } = applyLeaveValidate(leaveData);
        setErrors(errors);
        if (!isError) {
            setApplyLeaveLoader(true);

            // request data
            let formData: any = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            }

            formData.append('user_id', localStorage.getItem("id"));
            formData.append('leave_type_id', leaveData?.leave_type_id?.code);
            formData.append('title', leaveData?.title);
            formData.append('description', leaveData?.description);
            const fromDate = moment(leaveData?.from_date).format('YYYY-MM-DD');
            formData.append('from_date', fromDate);
            const toDate = moment(leaveData?.to_date).format('YYYY-MM-DD');
            formData.append('to_date', toDate);

            if (leaveData?.is_half === "Yes"){
                formData.append('is_half', 1);
            }

            // call api
            pageService.addUpdateLeave(formData).then((response) => {
                // Get response
                if (response) {
                    setApplyLeaveLoader(false);
                    setApplyLeaveModal(false);
                    setLeaveData({});
                    setEditId(null);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getAllLeavesFromAPI();
                } else {
                    setApplyLeaveLoader(false);
                    setApplyLeaveModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setApplyLeaveLoader(false);
                setApplyLeaveModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    const applyForJobUI = () => {
        return(
            <>
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">Leave Type <span style={{ color: "red" }}>*</span></label>
                        <Dropdown
                            value={leaveData?.leave_type_id}
                            name="name"
                            options={leaveTypes}
                            filter
                            optionLabel="name"
                            placeholder="Select Leave Type"
                            onChange={(e) => onInputChange(e.value, "leave_type_id")}
                            className={errors['leave_type_id'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['leave_type_id']}</small>
                    </div>

                    <div className="field col-6">
                        <label htmlFor="name">Title <span className="required">*</span></label>
                        <InputText
                            value={leaveData?.title}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Title"
                            onChange={(e) => onInputChange(e, "title")}
                            className={errors['title'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['title']}</small>
                    </div>

                    <div className="field col-12">
                        <label htmlFor="name">Reason <span className="required">*</span></label>
                        <InputTextarea
                            value={leaveData?.description}
                            autoComplete="off"
                            onChange={(e) => onInputChange(e, "description")}
                            className={errors['description'] && 'p-invalid'}
                            rows={5}
                            cols={30}
                        />
                        <small className="p-invalid-txt">{errors['description']}</small>
                    </div>

                    <div className="field col-12">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="is_half"
                                name="is_half"
                                value="Yes"
                                onChange={(e) => onInputChange(e, 'is_half')}
                                checked={leaveData?.is_half == "Yes" ? true : false}
                            />
                            <label htmlFor="is_half" className="ml-2">Are you applying for half leave?</label>
                        </div>
                    </div>

                    <div className="field col-6">
                        <label htmlFor="name">From <span className="required">*</span></label>
                        <Calendar
                            placeholder='Select From Date'
                            value={leaveData?.from_date}
                            onChange={(e) => onInputChange(e.value, "from_date")}
                            dateFormat="yy-mm-dd"
                        />
                        <small className="p-invalid-txt">{errors['from_date']}</small>
                    </div>

                    <div className="field col-6">
                        <label htmlFor="name">To <span className="required">*</span></label>
                        <Calendar
                            placeholder='Select To Date'
                            value={leaveData?.to_date}
                            onChange={(e) => onInputChange(e.value, "to_date")}
                            dateFormat="yy-mm-dd"
                            disabled={leaveData?.from_date === undefined || leaveData?.is_half === "Yes" ? true : false}
                        />
                        <small className="p-invalid-txt">{errors['to_date']}</small>
                    </div>
                    <small className="p-invalid-txt">{errors['date_validate']}</small>
                </div>
            </>
        )
    };

    return(
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Leaves</div>
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
                        <Button className="p-button mr-2" label="Apply Leave" onClick={() => openApplyLeaveModal()} />
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
                                        value={leavesList}
                                        paginator={leavesList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Leaves Found"
                                    >
                                        {EmployeeLeavesListColumns.map((col, i) => {
                                            if (col.field === 'status') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={statusTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'action') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={actionBodyTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'leave_type') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={leaveTypeBodyTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'is_half') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={halfLeaveTemplate}
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
                                        {EmployeeLeavesListColumns.map((col, i) => (
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
                visible={applyLeaveModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={editId !== null ? "Update Leave Details" : "Apply For Leave"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeApplyLeaveModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => applyLeaveApiCall()}
                            loading={applyLeaveLoader}
                        />
                    </>
                }
                onHide={closeApplyLeaveModal}
            >
                {applyForJobUI()}
            </Dialog>
        </>
    )
};

