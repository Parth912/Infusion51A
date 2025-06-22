import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { TabMenu } from 'primereact/tabmenu';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Badge } from 'primereact/badge';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { EmployeeLeavesListAdminColumns } from '../../../appconfig/DatatableSetting';
import { Dialog } from 'primereact/dialog';

export const EmployeeDetails = () => {
    document.title = "Employee Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/leads">Employees</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Employee Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    // Page service
    const pageService = new PageService();
    const toast = useRef<any>(null);

    const tabitems = [
        { label: 'Overview' },
        { label: 'Leaves' },
    ];

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [currentTab, setCurrentTab] = useState<any>({ index: 0, value: "Overview" });
    const [employeeId, setEmployeeId] = useState<any>("");
    const [employeeDetails, setEmployeeDetails] = useState<any>({});
    const [viewDetailsModal, setViewDetailsModal] = useState<boolean>(false);
    const [viewDetails, setViewDetails] = useState<any>({});
    const [approveRejectLeaveModal, setApproveRejectLeaveModal] = useState<boolean>(false);
    const [approveRejectLeaveId, setApproveRejectLeaveId] = useState<any>("");
    const [approveRejectLeaveStatus, setApproveRejectLeaveStatus] = useState<any>("");
    const [approveRejectLeaveLoader, setApproveRejectLeaveLoader] = useState<boolean>(false);

    useEffect(() => {
        console.log("hello");
        if (location.state) {
            const state = location.state;
            setEmployeeId(state);
            getEmployeeDetails(state);
        }
    }, []);

    // On change tab
    const changeCurrentTab = (tab: any) => {
        setCurrentTab({ index: tab?.index, value: tab?.value?.label });
    };

    // Get employee details
    const getEmployeeDetails = (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleEmployee(state.employee_id)
            .then((response) => {
                // Get response
                if (response) {
                    setEmployeeDetails(response);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                }
            });
    };

    // Open view details modal
    const openViewDetailsModal = (rowData: any) => {
        setViewDetails(rowData);
        setViewDetailsModal(true);
    };

    // Close view details modal
    const closeViewDetailsModal = () => {
        setViewDetails({});
        setViewDetailsModal(false);
    };

    // Open approve leave modal
    const openApproveRejectLeaveModal = (id: any, status: any) => {
        setApproveRejectLeaveModal(true);
        setApproveRejectLeaveId(id);
        setApproveRejectLeaveStatus(status);
    };

    // Close approve leave modal
    const closeApproveRejectLeaveModal = () => {
        setApproveRejectLeaveModal(false);
        setApproveRejectLeaveId("");
        setApproveRejectLeaveStatus("");
    };

    // Approve reject leave
    const approveRejectLeave = () => {
        // request data
        let formData: any = new FormData();
        
        formData.append('id', approveRejectLeaveId);
        formData.append('status', approveRejectLeaveStatus);

        // call api
        pageService.addUpdateLeave(formData).then((response) => {
            // Get response
            if (response) {
                setApproveRejectLeaveModal(false);
                setApproveRejectLeaveId("");
                setApproveRejectLeaveStatus("");
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                getEmployeeDetails({ employee_id: employeeId.employee_id })
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong, Please try again.',
                });
            }
        }).catch(error => {
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
            <>
                <div className="tb-actions">
                    <Button
                        icon="pi pi-eye"
                        className="p-button-square p-button-outlined mr-3"
                        onClick={() => openViewDetailsModal(rowData)}
                        tooltip="View Details"
                        tooltipOptions={{ position: 'top' }}
                    />
                    <Button
                        icon="pi pi-times"
                        className="p-button-square p-button-outlined mr-3"
                        onClick={() => openApproveRejectLeaveModal(rowData.id, "Rejected")}
                        tooltip="Reject Leave" 
                        tooltipOptions={{ position: 'top' }}
                        disabled={rowData.status === "Pending" || rowData.status === "Approved" ? false : true}
                    />
                    <Button
                        icon="pi pi-check"
                        className="p-button-square p-button-outlined mr-3"
                        onClick={() => openApproveRejectLeaveModal(rowData.id, "Approved")}
                        tooltip="Approve Leave" 
                        tooltipOptions={{ position: 'top' }}
                        disabled={rowData.status === "Pending" || rowData.status === "Rejected" ? false : true}
                    />
                </div>
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
        return (
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

    return(
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} />  Employee Details</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
            </div>

            {
                !window.cn(employeeDetails) && employeeDetails !== "" && employeeDetails !== undefined && employeeDetails !== null && Object.keys(employeeDetails).length > 0 ?
                    <div className="grid">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-body pb-0">
                                    <div className="userprofile-card">
                                        <div className="userprofile-avatar-box">
                                            <span className="userprofile-avatar-img"><span className="userprofile-avatar-text">{employeeDetails?.first_name.substring(0, 1)}</span></span>
                                        </div>
                                        <div className="userprofile-infoarea">
                                            <div className="userprofile-info">
                                                <div className="userprofile-namebox">
                                                    <div className="userprofile-name">{employeeDetails?.full_name}</div>
                                                </div>
                                            </div>
                                            <div className="userprofile-listbox">
                                                {
                                                    !window.cn(employeeDetails?.mobile) && employeeDetails?.mobile !== null && employeeDetails?.mobile !== undefined ? <div className="userprofile-lists"><i className="ti ti-phone pr-2"></i> {employeeDetails?.mobile} </div> : <></>
                                                } 
                                            </div>
                                            <div className="userprofile-listbox">
                                                {
                                                    !window.cn(employeeDetails?.email) && employeeDetails?.email !== null && employeeDetails?.email !== undefined ? <div className="userprofile-lists"><i className="ti ti-mail pr-2"></i> {employeeDetails?.email} </div> : <></>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="userprofile-menu">
                                        <div className="userprofile-menulist">
                                            <TabMenu model={tabitems} activeIndex={currentTab?.index} onTabChange={(e) => changeCurrentTab(e)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {
                                currentTab?.value === "Overview" ?
                                <>
                                    <div className="grid">
                                        <div className="col-8">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title">Overview</h3>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="userprofile-ullist">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Birth Date</div>
                                                            <div className="userprofile-value">2000-05-17</div>
                                                        </div>
                                                    </div>
                                                    <div className="userprofile-ullist mt-2">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Job Role</div>
                                                            <div className="userprofile-value">Developer</div>
                                                        </div>
                                                    </div>
                                                    <div className="userprofile-ullist mt-2">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">ID Proof</div>
                                                            <div className="userprofile-value"><a href='#' target='_blank'>View</a></div>
                                                        </div>
                                                    </div>
                                                    <div className="userprofile-ullist mt-2">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Contract</div>
                                                            <div className="userprofile-value"><a href='#' target='_blank'>View</a></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                                :
                                currentTab?.value === "Leaves" ? 
                                <>
                                    <div className="grid">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title">Leaves</h3>
                                                    </div>
                                                </div>
                                                <div className="card-body p-0">
                                                    <div className="card-body-inner">
                                                        <DataTable
                                                            className="datatable-responsive" stripedRows
                                                            value={employeeDetails?.leaves}
                                                            paginator={employeeDetails?.leaves.length > 0 && true}
                                                            rows={defaultRowOptions}
                                                            rowsPerPageOptions={defaultPageRowOptions}
                                                            paginatorTemplate={paginatorLinks}
                                                            currentPageReportTemplate={showingEntries}
                                                            emptyMessage="No Leaves Found"
                                                        >
                                                            {EmployeeLeavesListAdminColumns.map((col, i) => {
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
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                                :
                                <></>
                            }
                            
                        </div>
                    </div>
                :
                    <></>
            }

            {/* View Details Modal */}
            <Dialog
                visible={viewDetailsModal}
                style={{ width: '450px' }}
                header="Leave Details"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeViewDetailsModal}
                        />
                    </>
                }
                onHide={closeViewDetailsModal}
            >
                <div className="formgrid grid">
                    <div className="field col-12">
                        <p><b>Leave Type :</b> {viewDetails?.leave_type?.name}</p>
                    </div>
                    <div className="field col-12">
                        <p><b>Title :</b> {viewDetails?.title}</p>
                    </div>
                    <div className="field col-12">
                        <p><b>Reason :</b> {viewDetails?.description}</p>
                    </div>
                    <div className="field col-12">
                        <p><b>Half Leave :</b> {viewDetails?.is_half === 1 ? "Yes" : "No"}</p>
                    </div>
                    <div className="field col-12">
                        <p><b>From :</b> {viewDetails?.from_date}</p>
                    </div>
                    <div className="field col-12">
                        <p><b>To :</b> {viewDetails?.to_date}</p>
                    </div>
                </div>
            </Dialog>

            {/* Approve Reject Modal */}
            <Dialog
                visible={approveRejectLeaveModal}
                style={{ width: '450px' }}
                header={!window.cn(approveRejectLeaveStatus) && approveRejectLeaveStatus == "Approved" ? "Approve Leave" : "Reject Leave"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeApproveRejectLeaveModal}
                        />
                        <Button
                            label={ approveRejectLeaveStatus == "Approved" ? "Approve" : "Reject" }
                            className={approveRejectLeaveStatus == "Approved" ? "p-button-success" : "p-button-danger" }
                            onClick={approveRejectLeave}
                            loading={approveRejectLeaveLoader}
                        />
                    </>
                }
                onHide={closeApproveRejectLeaveModal}
            >
                <div className="flex align-items-center justify-content-start">
                    {!window.cn(approveRejectLeaveStatus) && approveRejectLeaveStatus == "Approved" ?
                        <>
                            <i
                                className="pi pi-verified mr-3 approve-triangle"
                                style={{ fontSize: '2rem' }}
                            />
                            <span className="approve-dailog-note">
                                Note: Approve Leave Application.
                            </span>
                        </>

                        : approveRejectLeaveStatus == "Rejected" ?
                            <>
                                <i
                                    className="pi pi-exclamation-triangle mr-3 delete-triangle"
                                    style={{ fontSize: '2rem' }}
                                />
                                <span className="delete-dialog-note">
                                    Note: Do you really want to reject this leave application?
                                </span>
                            </>

                            : <></>

                    }
                </div>
            </Dialog>
            

            {/* Loader Start */}
            {
                pageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    )
};