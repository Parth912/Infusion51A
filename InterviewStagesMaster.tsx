import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';

// Column
import { InterviewStagesMasterColumns } from '../../../appconfig/DatatableSetting';

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
import { InterviewStagesMasterValidate } from '../../../config/Validate';
import { Loader } from '../../../components/Loader/Loader';

export const InterviewStagesMaster = () => {
    document.title = "Interview Stages | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Interview Stages</span>
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

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [addUpdateModal, setAddUpdateModal] = useState(false);
    const [statusChangePageLoad, setStatusChangePageLoad] = useState(false);
    const [interviewStagesList, setInterviewStagesList] = useState<any>([]);
    const [editId, setEditId] = useState<any>(null);
    const [interviewStageName, setInterviewStageName] = useState<any>("");
    const [errors, setErrors] = useState<any>({});

    // use effect method
    useEffect(() => {
        getInterviewStagesMasterDataFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Get interview stages master from API
    const getInterviewStagesMasterDataFromAPI = async () => {
        // Api call
        pageService
            .getInterviewStagesMasterList()
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
                
            </>
        );
    };

    // for column status
    const statusTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData.status === 0 ? <><Badge value="Inactive" severity="warning"></Badge></> : <><Badge value="Active" severity="success"></Badge></>}
            </>
        )
    };

    // for column action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                <InputSwitch className="mr-2" checked={rowData.status === 1 ? true : false} onChange={(e) => interviewStageStatusChange(e.value, rowData.id)} />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    onClick={() => editModalHandleChange(rowData)}
                    tooltip="Edit" tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    // Handle change status toggle
    const interviewStageStatusChange = (value: any, id: any) => {
        try {
            setStatusChangePageLoad(true);
            // request data
            let formData = new FormData();
            formData.append('id', id);
            formData.append('status', value);

            // call api
            pageService.changeInterviewStageStatus(formData).then((response) => {
                // Get response
                if (response) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    setTimeout(() => {
                        setStatusChangePageLoad(false);
                        getInterviewStagesMasterDataFromAPI();
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
    const editModalHandleChange = (rowData: any) => {
        setEditId(rowData.id);
        setInterviewStageName(rowData.name);
        setAddUpdateModal(true);
    };

    // Add update modal close
    const hideAddUpdateModal = () => {
        setAddUpdateModal(false);
        setEditId(null);
        setInterviewStageName("");
        setErrors({});
    }

    // On click of submit on add or update
    const addUpdateInterviewStage = () => {
        const { errors, isError } = InterviewStagesMasterValidate(interviewStageName);
        setErrors(errors);

        try {
            if (!isError) {
                setSubmitLoading(true);

                // request data
                let formData = new FormData();
                if (editId !== null) {
                    formData.append('id', editId);
                }
                formData.append('name', interviewStageName);

                // call api
                pageService.addUpdateInterviewStageMaster(formData).then((response) => {
                    // Get response
                    if (response) {
                        setSubmitLoading(false);
                        setAddUpdateModal(false);
                        setInterviewStageName("");
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.data.message,
                        });
                        getInterviewStagesMasterDataFromAPI();
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

    // page template
    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Interview Stages</div>
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
                        <Button className="p-button mr-2" label="Add New Interview Stage" onClick={() => addModalHandleChange()} />
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
                                        value={interviewStagesList}
                                        paginator={interviewStagesList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Data Found"
                                    >
                                        {InterviewStagesMasterColumns.map((col, i) => {
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
                                        {InterviewStagesMasterColumns.map((col, i) => (
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
                header={editId !== null ? "Update Interview Stage Name" : "Add New Interview Stage"}
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
                            onClick={() => addUpdateInterviewStage()}
                            loading={submitLoading}
                        />
                    </>
                }
                onHide={hideAddUpdateModal}
            >
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="name">Stage Name <span className="required">*</span></label>
                        <InputText
                            value={interviewStageName}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Interview Stage Name"
                            onChange={(e) => setInterviewStageName(e.target.value)}
                            className={errors['name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['name']}</small>
                    </div>
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
