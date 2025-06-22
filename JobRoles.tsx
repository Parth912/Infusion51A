import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';

// Column
import { JobRolesColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
    jobRolesStatus,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { jobRoleValidate } from '../../../config/Validate';
import { Loader } from '../../../components/Loader/Loader';

export const JobRoles = () => {
    document.title = "Job Roles | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Job Roles</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    const [jobRoleList, setJobRoleList] = useState<any>([]);
    const [editId, setEditId] = useState<any>(null);
    const [jobRoleName, setJobRoleName] = useState<any>("");
    const [errors, setErrors] = useState<any>({});

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);

    // Page service
    const pageService = new PageService();

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [status, setStatus] = useState<any>({ name: 'All', code: "All" });
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [addUpdateModal, setAddUpdateModal] = useState<boolean>(false);
    const [statusChangePageLoad, setStatusChangePageLoad] = useState<boolean>(false);
    const [interviewStagesList, setInterviewStagesList] = useState<any>([]);
    const [selectedInterviewStages, setSelectedInterviewStages] = useState<any>([
        {
            stage: '',
            order_number: ''
        }
    ]);
    const [isStageArrayUpdate, setIsStageArrayUpdate] = useState<boolean>(false);

    // use effect method
    useEffect(() => {
        getJobRolesDataFromAPI();
        getInterviewStagesMasterDataFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [status]);

    useEffect(() => {
        if (isStageArrayUpdate) {
            setIsStageArrayUpdate(false);
            interviewStagesUI();
        }
    }, [isStageArrayUpdate]);

    // Get interview stages master from API
    const getInterviewStagesMasterDataFromAPI = async () => {
        // Api call
        pageService
            .getInterviewStagesMasterList("dropdown")
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setInterviewStagesList([]);
                    } else {
                        setInterviewStagesList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setInterviewStagesList([]);
                }
            });
    };

    // Get jon roles from API
    const getJobRolesDataFromAPI = async () => {
        // Api call
        pageService
            .getJobRolesList(status.code)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setJobRoleList([]);
                    } else {
                        setJobRoleList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setJobRoleList([]);
                }
            });
    };

    // left part of toolbar
    const leftToolbarTemplate = () => {
        return (
            <>
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                        placeholder="Search..."
                    />
                </span>
            </>
        );
    };

    // right part of toolbar
    const rightToolbarTemplate = () => {
        return (
            <>
                <Dropdown
                    value={status}
                    onChange={(e) => setStatus(e.value)}
                    options={jobRolesStatus}
                    optionLabel="name"
                    placeholder="Status"
                ></Dropdown>
                <Button
                    label="Interview Stages"
                    className="ml-2"
                    onClick={() => navigate("/interview-stages")}
                />
            </>
        );
    };

    // for column status
    const statusTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData.status == 0 ? <><Badge value="Inactive" severity="warning"></Badge></> : <><Badge value="Active" severity="success"></Badge></>}
            </>
        )
    };

    // for column action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                <InputSwitch className="mr-2" checked={rowData.status == 1 ? true : false} onChange={(e) => jobRoleStatusChange(e.value, rowData.id)} />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    onClick={() => editModalHandleChange(rowData.id)}
                    tooltip="Edit" 
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    // Handle change status toggle
    const jobRoleStatusChange = (value: any, id: any) => {
        try {
            setStatusChangePageLoad(true);
            // request data
            let formData = new FormData();
            formData.append('id', id);
            formData.append('status', value);

            // call api
            pageService.changeJobRoleStatus(formData).then((response) => {
                // Get response
                if (response) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    setTimeout(() => {
                        setStatusChangePageLoad(false);
                        getJobRolesDataFromAPI();
                    }, 1000);
                } else {
                    setStatusChangePageLoad(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            });
        } catch (error: any) {
            setStatusChangePageLoad(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.error,
            });
        }
    };

    // Add modal open
    const addModalHandleChange = () => {
        setAddUpdateModal(true);
    };

    // Edit Modal Open
    const editModalHandleChange = (job_role_id: any) => {
        setEditId(job_role_id);
        setAddUpdateModal(true);
        // Api call
        pageService
            .getSingleJobRole(job_role_id)
            .then((response) => {
                // Get response
                if (response) {
                    setJobRoleName(response.name);
                    setStatusChangePageLoad(false);
                } else {
                    setStatusChangePageLoad(false);
                    setJobRoleName("");
                }
            });
    };

    // Add update modal close
    const hideAddUpdateModal = () => {
        setAddUpdateModal(false);
        setEditId(null);
        setJobRoleName("");
        setSelectedInterviewStages([
            {
                stage: '',
                order_number: ''
            }
        ]);
        setErrors({});
    }

    // On click of submit on add or update
    const addUpdateJobRole = () => {
        const { errors, isError } = jobRoleValidate(jobRoleName);
        setErrors(errors);

        try {
            if (!isError) {
                setSubmitLoading(true);

                // request data
                let formData = new FormData();
                if (editId !== null) {
                    formData.append('id', editId);
                }
                formData.append('name', jobRoleName);

                // call api
                pageService.addUpdateJobRole(formData).then((response) => {
                    // Get response
                    if (response) {
                        setSubmitLoading(false);
                        setAddUpdateModal(false);
                        setJobRoleName("");
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.data.message,
                        });
                        getJobRolesDataFromAPI();
                    } else {
                        setSubmitLoading(false);
                        setAddUpdateModal(true);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Something went wrong, Please try again.',
                        });
                    }
                });
            }
        } catch (error: any) {
            setSubmitLoading(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.error,
            });
        }
    };

    // On select stage change
    const onSelectStageChange = (e: any, name: any, index: number) => {
        let tempExtraArr = selectedInterviewStages;
        let val;
        if (name == "stage") {
            val = e;
        } else {
            val = (e.target && e.target.value) || '';
        }
        tempExtraArr[index][name] = val;
        console.log(tempExtraArr)
        setSelectedInterviewStages(tempExtraArr);
        setIsStageArrayUpdate(true);
    };

    // Add more stage
    const addMoreStage = () => {
        const defaultObject = {
            stage: '',
            order_number: ''
        };
        let array = selectedInterviewStages;
        array.push(defaultObject);
        setSelectedInterviewStages(array);
        setIsStageArrayUpdate(true);
    };

    // Delete stage
    const deleteStage = (index: number) => {
        let deleteExtraArray = selectedInterviewStages;
        deleteExtraArray.splice(index, 1);
        setSelectedInterviewStages(deleteExtraArray);
        setIsStageArrayUpdate(true);
    };

    // Interview stages ui
    const interviewStagesUI = () => {
        return(
            <>
                {
                    selectedInterviewStages.map((item: any, index: any) => {
                        return (
                            <>
                                <div className="p-fluid formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label htmlFor="name">Round <span style={{ color: "red" }}>*</span></label>
                                        <Dropdown
                                            value={item?.stage}
                                            name="name"
                                            options={interviewStagesList}
                                            filter
                                            optionLabel="name"
                                            placeholder="Select Interview Round"
                                            onChange={(e) => onSelectStageChange(e.value, "stage", index)}
                                            className={errors['country'] && 'p-invalid'}
                                        />
                                        <small className="p-invalid-txt">{errors['first_name']}</small>
                                    </div>
                                    {
                                        index > 0 ?
                                            <>
                                                <div className="field col-12 md:col-2">
                                                    <Button
                                                        icon="pi pi-trash"
                                                        className="p-button-rounded p-button-danger mt-5"
                                                        onClick={() => deleteStage(index)}
                                                    />
                                                </div>
                                            </>
                                            
                                            :
                                            <></>
                                    }
                                </div>
                            </>
                        )
                    })
                }
            </>
        )
    };

    // page template
    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Job Roles</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <Toolbar className="page-header-search-area" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                        </div>
                        <Button className="p-button mr-2" label="Add New Job Role" onClick={() => addModalHandleChange()} />
                    </div>
                </div>
            </div>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                        {/* Datatable Start */}
                        {pageLoad == true ? (
                            <>
                                <DataTable
                                    className="datatable-responsive" stripedRows
                                    value={jobRoleList}
                                    paginator={jobRoleList.length > 0 && true}
                                    globalFilter={globalFilter}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage="No Roles Found"
                                >
                                    {JobRolesColumns.map((col, i) => {
                                        if (col.field === 'status') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={statusTemplate}
                                                    filter
                                                    sortable
                                                />
                                            );
                                        } else if (col.field === 'action') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={actionBodyTemplate}
                                                    filter
                                                    sortable
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
                                    {JobRolesColumns.map((col, i) => (
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
                        {/* Datatable End */}
                    </div>
                </div>
            </div>

            {/* Add Update Dialog */}
            <Dialog
                visible={addUpdateModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={editId !== null ? "Update Job Role" : "Add New Job Role"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideAddUpdateModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addUpdateJobRole()}
                            loading={submitLoading}
                        />
                    </>
                }
                onHide={hideAddUpdateModal}
            >
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="name">Job Role <span className="required">*</span></label>
                        <InputText
                            value={jobRoleName}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Job Role"
                            onChange={(e) => setJobRoleName(e.target.value)}
                            className={errors['name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['name']}</small>
                    </div>
                </div>

                {interviewStagesUI()}
                <div className="field col-12 md:col-12">
                    <Button
                        style={{ width: 'fit-content' }}
                        label="Add More"
                        icon="pi pi-plus"
                        className="p-button"
                        onClick={addMoreStage}
                    />
                </div>
            </Dialog>

            {/* Loader Start */}
            {
                statusChangePageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    );
};
