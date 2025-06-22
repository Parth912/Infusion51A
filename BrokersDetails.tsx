import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';

import moment from "moment/moment";
import { Link } from 'react-router-dom';

import { SkeletonbodyTemplate, Skeletonitems, taskStatusFilter } from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { LoginAnalysisColumns, TasksColumns } from '../../../appconfig/DatatableSetting';
import { addTaskValidate } from '../../../config/Validate';

export const BrokersDetails = () => {
    document.title = "Broker Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/brokers">Broker Lists</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Broker Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    const [globalFilter, setGlobalFilter] = useState<any>(null);

    const pageService = new PageService();
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    const [pageLoad, setPageLoad] = useState(false);
    const [brokerId, setBrokerId] = useState<any>();
    const [brokerData, setBrokerData] = useState<any>({});
    const [notificationsList, setNotificationsList] = useState<any>([]);
    const [notificationLoad, setNotificationLoad] = useState<boolean>(false);
    const [tasksList, setTasksList] = useState<any>([]);
    const [taskLoad, setTaskLoad] = useState<boolean>(false);
    const [taskStatus, setTaskStatus] = useState<any>({ code: "Pending", name: "Pending" });
    const [taskModal, setTaskModal] = useState<boolean>(false);
    const [taskDetail, setTaskDetail] = useState<any>("");
    const [taskLoader, setTaskLoader] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setBrokerId(state);
            getBrokerDetailsFromAPI(state);
            getUserAllNotificationsFromAPI(state);
        }
    }, []);

    useEffect(() => {
        if (location.state) {
            const state = location.state;
            getTasksFromAPI(state);
        }
    }, [taskStatus]);

    // Get Broker Details
    const getBrokerDetailsFromAPI = async (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleClientDetails(state.broker_id)
            .then((response) => {
                // Get response
                if (response) {
                    const responseData = response;
                    setBrokerData(responseData);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                    setBrokerData({});
                }
            });
    };

    // Get Tasks Details
    const getTasksFromAPI = async (state: any) => {
        setTaskLoad(false);
        // Api call
        pageService
            .getTask(state.broker_id, taskStatus?.code)
            .then((response) => {
                // Get response
                if (response) {
                    const responseData = response;
                    setTasksList(responseData);
                    setTaskLoad(true);
                } else {
                    setTaskLoad(true);
                    setTasksList([]);
                }
            });
    };

    // Get Broker analysis
    const getUserAllNotificationsFromAPI = async (state: any) => {
        setNotificationLoad(false);
        // Api call
        pageService
            .getUserAllNotifications(state.broker_id)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    setNotificationsList(DataList?.login_notification);
                    setNotificationLoad(true);
                } else {
                    setNotificationLoad(false);
                    setNotificationsList([]);
                }
            });
    };

    // Date formate template
    const dateFormatCreatedAtTemplate = (rowData: any, rowIndex: any) => {

        return (
            <>
                {rowData.created_at === rowData[rowIndex.field] && rowData.created_at !== null ? moment.utc(rowData.created_at).format('MMM DD, YYYY hh:mm A') : '-'}
            </>
        );
    };

    // Status template
    const statusTemplate = (rowData: any, rowIndex: any) => {

        return (
            <>
                {rowData.status == "Completed" ? <Badge value="Completed" severity="success"></Badge> : <Badge value="Pending" severity="warning"></Badge>}
            </>
        );
    };

    // Open add task modal
    const openTaskModal = () => {
        setTaskModal(true);
    };

    // Close add task modal
    const closeTaskModal = () => {
        setTaskDetail("");
        setTaskModal(false);
        setTaskLoader(false);
        setErrors({});
    };

    // Add task api call
    const addTaskApiCall = () => {
        const { errors, isError } = addTaskValidate(taskDetail);
        setErrors(errors);

        try {
            if (!isError) {
                setTaskLoader(true);

                // request data
                let formData: any = new FormData();
                formData.append('id', brokerId.broker_id);
                formData.append('task_detail', taskDetail);

                // call api
                pageService.addTask(formData).then((response) => {
                    // Get response
                    if (response) {
                        setTaskLoader(false);
                        setTaskModal(false);
                        setTaskDetail("");
                        getTasksFromAPI(brokerId);
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.message,
                        });
                    } else {
                        setTaskLoader(false);
                        setTaskModal(true);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Something went wrong, Please try again.',
                        });
                    }
                });
            }
        } catch (error: any) {
            setTaskLoader(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.error,
            });
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Broker Details {!window.cn(brokerData) && brokerData?.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : brokerData?.status == 1 ? <><Badge value="Active" severity="success"></Badge></> : <><Badge value="Access Revoked" severity="danger"></Badge></>}</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search"></div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="field col">
                        <div className="grid">
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Full Name</div>
                                    <div className="viewcard-text">{!window.cn(brokerData) ? brokerData?.first_name + " " + brokerData?.last_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Email</div>
                                    <div className="viewcard-text">{!window.cn(brokerData) ? brokerData?.email : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Mobile No.</div>
                                    <div className="viewcard-text">{!window.cn(brokerData) ? "+" + brokerData?.country?.phonecode + " " + brokerData?.mobile : ""}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="col-12 md:col-9">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title-box">
                                <h3 className="card-title">Everyday Tasks</h3>
                            </div>
                            <div className="card-toolbar">
                                <div className="p-toolbar p-component mb-4" role="toolbar">
                                    <div className="p-toolbar-group-left">
                                        <Button 
                                            className="p-button mr-2" 
                                            label="Assign Task" 
                                            onClick={() => openTaskModal()} 
                                        />
                                        <Dropdown
                                            value={taskStatus}
                                            onChange={(e) => setTaskStatus(e.value)}
                                            options={taskStatusFilter}
                                            optionLabel="name"
                                            placeholder="Select Status"
                                        ></Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {taskLoad ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive"
                                        value={tasksList}
                                        paginator={tasksList.length > 0 && true}
                                        rows={8}
                                        emptyMessage={"No Data Found"}
                                    >
                                        {TasksColumns.map((col, i) => {
                                            if (col.field === 'created_at') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={dateFormatCreatedAtTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'status') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={statusTemplate}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                    />
                                                );
                                            }
                                        })}
                                    </DataTable>
                                </>
                            ) : (
                                <>
                                    {/* Skeleton Data table */}
                                    <DataTable value={Skeletonitems}
                                        className="datatable-responsive" stripedRows
                                    >
                                        {TasksColumns.map((col, i) => (
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
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-3">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title-box">
                                <h3 className="card-title">Login Analysis</h3>
                            </div>
                            <div className="card-toolbar">
                                <div className="p-toolbar p-component mb-4" role="toolbar">
                                    <div className="p-toolbar-group-left"></div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {notificationLoad ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive"
                                        value={notificationsList}
                                        paginator={notificationsList.length > 0 && true}
                                        rows={8}
                                        emptyMessage={"No Data Found"}
                                    >
                                        {LoginAnalysisColumns.map((col, i) => {
                                            if (col.field === 'created_at') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={dateFormatCreatedAtTemplate}
                                                        sortable
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
                                    <DataTable value={Skeletonitems}
                                        className="datatable-responsive" stripedRows
                                    >
                                        {LoginAnalysisColumns.map((col, i) => (
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
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                visible={taskModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Add Today's Task"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={closeTaskModal}
                        />
                        <Button
                            label="Submit"
                            icon="pi pi-check"
                            className="p-button-success"
                            onClick={() => addTaskApiCall()}
                            loading={taskLoader}
                        />
                    </>
                }
                onHide={closeTaskModal}
            >
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="name">Enter Task <span style={{ color: "red" }}>*</span></label>
                        <InputTextarea
                            value={taskDetail}
                            onChange={(e) => setTaskDetail(e.target.value)}
                            rows={5}
                            cols={30}
                        />
                        <small className="p-invalid-txt">{errors['task_detail']}</small>
                    </div>
                </div>
            </Dialog>

            {/* Loader Start */}
            {
                pageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    )
}