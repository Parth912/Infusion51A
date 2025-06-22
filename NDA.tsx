import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';
import { FileUpload } from 'primereact/fileupload';

// Column
import { NDAListColumns } from '../../../appconfig/DatatableSetting';

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
import { NDAValidate } from '../../../config/Validate';
import { Loader } from '../../../components/Loader/Loader';
import { chooseOptions, emptyTemplate, headerTemplate } from '../../../components/ImageUploadComponent/ImageUploadSetting';

export const NDA = () => {
    document.title = "eSign | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">NDA</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    // Page service
    const pageService = new PageService();

    const [NDAList, setNDAList] = useState<any>([]);
    const [driveFolderURL, setDriveFolderURL] = useState<any>("");
    const [driveFolderDetails, setDriveFolderDetails] = useState<any>({});
    const [NDAName, setNDAName] = useState<any>("");
    const [NDAFile, setNDAFile] = useState<any>("");
    const [editId, setEditId] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [addUpdateModal, setAddUpdateModal] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<any>(null);

    // use effect method
    useEffect(() => {
        getNDAListFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Get all nda
    const getNDAListFromAPI = () => {
        setPageLoad(false);

        // Api call
        pageService.listAllNDA().then((response) => {
            // Get response
            if (response) {
                const DataList = response;
                if (DataList.length == 0) {
                    setNDAList([]);
                } else {
                    setNDAList(DataList);
                }
                setPageLoad(true);
            } else {
                setPageLoad(false);
                setNDAList([]);
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

    // On add modal open
    const addModalOpen = () => {
        setAddUpdateModal(true);
    };

    // On edit modal open
    const editModalOpen = (id: any, name: any, file_url: any, folder_url: any, folder_name: any, folder_id: any) => {
        setEditId(id);
        setDriveFolderURL(folder_url);
        setDriveFolderDetails({
            id: folder_id,
            name: folder_name
        });
        setNDAName(name);
        setNDAFile(file_url);
        setAddUpdateModal(true);
    };

    // On add update modal close
    const addUpdateModalClose = () => {
        setAddUpdateModal(false);
        setDriveFolderDetails({});
        setDriveFolderURL("");
        setNDAName("");
        setNDAFile("");
        setErrors({});
        setEditId(null);
        setSubmitLoading(false);
    };

    // On delete modal open
    const deleteModalOpen = (id: any) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    // On delete modal close
    const deleteModalClose = () => {
        setDeleteId(null);
        setDeleteModal(false);
        setSubmitLoading(false);
    };

    // Template for action body
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <div className="tb-actions">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    onClick={() => editModalOpen(rowData.id, rowData?.name, rowData?.file_url, rowData?.drive_folder_url, rowData?.drive_folder_name, rowData?.drive_folder_id)}
                    tooltip="Edit" 
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-square p-btn-default"
                    onClick={() => deleteModalOpen(rowData.id)}
                    tooltip="Delete"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        )
    };

    // Template for nda name
    const nameBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <a href={rowData?.file_url} target='_blank' style={{ color: "black" }}>{rowData?.name}</a>
            </>
        )
    };

    // for remove nda file
    const onTemplateRemoveNDAFile = (callback: any) => {
        setNDAFile("");
        callback();
    };

    // for upload nda file
    const itemNDAFileTemplate = (file: any, props: any) => {
        setNDAFile(file);
        removeFile.current = props.onRemove;
        return (
            <>
                <div className="flex align-items-center flex-wrap">
                    <div className="flex align-items-center" style={{ width: '40%' }}>
                        <img
                            alt={file.name}
                            role="presentation"
                            src="/assets/images/pdf-1.png"
                            width={100}
                        />
                        <div className="flex" style={{ alignItems: "center" }}>
                            <span className="mr-3">{file.name}</span>
                            <Button
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={() => onTemplateRemoveNDAFile(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // On drive folder url change
    const onDriveFolderURLChange = (val: any) => {
        if(val !== ""){
            setDriveFolderURL(val);
            try {
                // call api
                pageService.getDriveFolderDetails(val).then((response) => {
                    // Get response
                    if (response) {
                        setDriveFolderDetails(response);
                    } else {
                        setDriveFolderDetails({});
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Something went wrong, Please try again.',
                        });
                    }
                }).catch((error) => {
                    if (error.response && error.response.status === 400) {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Message',
                            detail: error.response.data.message,
                        });
                    } else {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Something went wrong, Please try again.',
                        });
                    }
                });
            } catch (error: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data.message,
                });
            }
        }
    }; 

    // On submit add update nda
    const onSubmitAddUpdateNDA = () => {
        const { errors, isError } = NDAValidate(NDAName, NDAFile, driveFolderURL);
        setErrors(errors);

        try {
            if (!isError) {
                setSubmitLoading(true);

                // request data
                let formData: any = new FormData();
                if (editId !== null) {
                    formData.append('id', editId);
                }

                formData.append('drive_folder_url', driveFolderURL);
                formData.append('drive_folder_id', driveFolderDetails?.id);
                formData.append('drive_folder_name', driveFolderDetails?.name);

                formData.append('name', NDAName);
                if (NDAFile !== "" && NDAFile.name) {
                    formData.append('file_url', NDAFile);
                }

                // call api
                pageService.addUpdateNDA(formData).then((response) => {
                    // Get response
                    if (response) {
                        setSubmitLoading(false);
                        setAddUpdateModal(false);
                        setDriveFolderURL("");
                        setDriveFolderDetails({});
                        setNDAName("");
                        setNDAFile("");
                        setEditId(null);
                        setErrors({});
                        getNDAListFromAPI();
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.message,
                        });
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

    // On delete nda submit
    const onDeleteSubmit = () => {
        setSubmitLoading(true);

        let formData: any = new FormData();
        formData.append('id', deleteId);

        // call api
        pageService.deleteNDA(formData).then((response) => {
            // Get response
            if (response) {
                setSubmitLoading(false);
                setDeleteModal(false);
                setDeleteId(null);
                getNDAListFromAPI();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
            } else {
                setSubmitLoading(false);
                setDeleteModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong, Please try again.',
                });
            }
        });
    };

    return(
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">eSign</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <Toolbar className="page-header-search-area" left={leftToolbarTemplate}></Toolbar>
                        </div>
                        <Button className="p-button mr-2" label="New Document" onClick={() => addModalOpen()} />
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
                                        value={NDAList}
                                        paginator={NDAList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No NDA's Found"
                                    >
                                        {NDAListColumns.map((col, i) => {
                                            if (col.field === 'action') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={actionBodyTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={nameBodyTemplate}
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
                                        {NDAListColumns.map((col, i) => (
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
                header={editId !== null ? "Update Document" : "Add New Document"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={addUpdateModalClose}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => onSubmitAddUpdateNDA()}
                            loading={submitLoading}
                        />
                    </>
                }
                onHide={addUpdateModalClose}
            >
                <div className="formgrid grid">
                    <span className="mb-2 ml-2" style={{ color: "red" }}>
                        <b>Note:</b> Below field is for when user submits the document after signature it directly uploads to the google drive in provided folder url.
                    </span>
                    <div className="field col-12">
                        <label htmlFor="name">Drive Folder URL <span className="required">*</span></label>
                        <InputText
                            defaultValue={driveFolderURL}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Drive Folder URL"
                            onChange={(e) => onDriveFolderURLChange(e.target.value)}
                            className={errors['drive_folder_url'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['drive_folder_url']}</small>
                    </div>

                    {
                        !window.cn(driveFolderDetails) && (Object.keys(driveFolderDetails).length > 0) ?
                            <>
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <p><b>&nbsp;&nbsp;Folder Name : </b>{driveFolderDetails?.name}</p>
                                    </div>
                                </div>
                            </>
                            :
                            <></>
                    }

                    <div className="field col-12">
                        <label htmlFor="name">Name <span className="required">*</span></label>
                        <InputText
                            value={NDAName}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter NDA Name"
                            onChange={(e) => setNDAName(e.target.value)}
                            className={errors['name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['name']}</small>
                    </div>
                    <div className="field col-12">
                        <label htmlFor="manual_file">Drag and Drop Or Upload File </label>
                        <FileUpload
                            ref={fileUploadRef}
                            accept="application/pdf"
                            name="file_url[]"
                            className="imageupload"
                            chooseOptions={chooseOptions}
                            emptyTemplate={emptyTemplate}
                            headerTemplate={headerTemplate}
                            itemTemplate={itemNDAFileTemplate}
                        ></FileUpload>
                        <small className="p-invalid-txt">{errors['file_url']}</small>
                    </div>
                    {editId != null && (
                        <>
                            {
                                !window.cn(NDAFile) && NDAFile !== undefined && NDAFile !== "" ?
                                    <div className="field col-12 md:col-4 editImage cursor-pointer">
                                        {typeof (NDAFile) === 'string' ? (
                                            <>
                                                <label htmlFor="photo">Old File</label>
                                                <img src="/assets/images/pdf-1.png"
                                                    onClick={() => window.open(NDAFile, '_blank')} width={110} height={70}>
                                                </img>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                    :
                                    <></>
                            }

                        </>
                    )}
                </div>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                visible={deleteModal}
                style={{ width: '450px' }}
                header="Delete NDA"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={deleteModalClose}
                        />
                        <Button
                            label="Delete"
                            className="p-button-danger"
                            onClick={onDeleteSubmit}
                            loading={submitLoading}
                        />
                    </>
                }
                onHide={deleteModalClose}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: Do you really want to delete this NDA?
                    </span>
                </div>
            </Dialog>
        </>
    )
};