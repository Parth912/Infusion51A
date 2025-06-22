import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';

// Column
import { InvestorConvertingDocsColumns } from '../../../appconfig/DatatableSetting';

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

import { chooseOptions, emptyTemplate, headerTemplate } from '../../../components/ImageUploadComponent/ImageUploadSetting';
import { convertToInvestorValidate } from '../../../config/Validate';

export const InvestorConvertingDocs = () => {
    document.title = "Investor Converting Documents | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investor Converting Documents</span>
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
    const [convertingDocsList, setConvertingDocsList] = useState<any>([]);
    const [convertingDocsData, setConvertingDocsData] = useState<any>({});
    const [convertingFile, setConvertingFile] = useState<any>("");
    const [convertingDocsModal, setConvertingDocsModal] = useState<boolean>(false);
    const [convertingDocsLoader, setConvertingDocsLoader] = useState<boolean>(false);
    const [advocateSign, setAdvocateSign] = useState<boolean>(false);
    const [editId, setEditId] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    const [deleteId, setDeleteId] = useState<any>(null);
    const [deleteLoader, setDeleteLoader] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);

    // Doc type dropdown values
    const docTypeDropDown: any = ([
        { code: "Direct", name: "Direct" },
        { code: "eSign", name: "eSign" },
    ]);

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    // useEffect
    useEffect(() => {
        getAllConvertingDocsListFromAPI();
    }, []);

    // Get all converting doc list from api
    const getAllConvertingDocsListFromAPI = () => {
        // Api call
        pageService
            .getAllConvertInvestorDoc("")
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setConvertingDocsList([]);
                    } else {
                        setConvertingDocsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setConvertingDocsList([]);
                }
            });
    };

    // Get single convert document data from api
    const getSingleConvertDocumentDataFromAPI = (id: any) => {
        setPageLoad(true);
        // Api call
        pageService.getSingleConvertInvestorDoc(id).then((response) => {
            // Get response
            if (response) {
                const responseData = response;
                setConvertingDocsData({
                    "name": responseData?.name,
                    "type": { code: responseData?.type, name: responseData?.type},
                });
                if(responseData?.advocate_sign === "Yes"){
                    setAdvocateSign(true);
                }
                setConvertingFile(responseData?.doc_url);
                setPageLoad(true);
            } else {
                setPageLoad(true);
                setConvertingDocsData({});
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

    // Template for type
    const typeBodyTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                {rowData?.type === "Direct" ? <Badge severity='success' value="Direct"></Badge> : <Badge severity='info' value="eSign"></Badge>}
            </>
        )
    };

    // Template for actions
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                <div className="tb-actions">
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-square p-btn-default"
                        tooltip="Update" tooltipOptions={{ position: 'top' }}
                        onClick={() => openUpdateDocumentModal(rowData.id)}
                    />
                    <Button
                        icon="pi pi-trash"
                        className="p-button-square p-btn-default"
                        tooltip="Delete" tooltipOptions={{ position: 'top' }}
                        onClick={() => openDeleteDocumentModal(rowData.id)}
                    />
                </div>
            </>
        )
    };

    // Template for document
    const documentTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                {rowData?.doc_url === null || rowData?.doc_url === "" ? "-" : <a href={rowData?.doc_url} target='_blank'>View</a>}
            </>
        )
    };

    // Open add new document modal
    const openAddNewDocumentModal = () => {
        setConvertingDocsModal(true);
    };

    // Open update document modal
    const openUpdateDocumentModal = (id: any) => {
        setEditId(id);
        setConvertingDocsModal(true);
        getSingleConvertDocumentDataFromAPI(id);
    };

    // Open delete document modal
    const openDeleteDocumentModal = (id: any) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    // Close delete document modal
    const closeDeleteDocumentModal = () => {
        setDeleteId(null);
        setDeleteModal(false);
        setDeleteLoader(false);
    };

    // Close add new document modal
    const closeAddNewDocumentModal = () => {
        setEditId(null);
        setConvertingDocsData({});
        setConvertingFile("");
        setAdvocateSign(false);
        setConvertingDocsModal(false);
        setConvertingDocsLoader(false);
    };

    //On Change Converting Docs Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == "type"){
            val = e;
            setConvertingFile("");
        } else {
            val = (e.target && e.target.value) || '';
        }
        setConvertingDocsData({ ...convertingDocsData, [name]: val });
    };

    // for remove converting file
    const onTemplateRemoveConvertingFile = (callback: any) => {
        setConvertingFile({});
        callback();
    };

    // for upload converting doc
    const itemConvertingDocTemplate = (file: any, props: any) => {
        setConvertingFile(file);
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
                                style={{ width: "32px" }}
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={() => onTemplateRemoveConvertingFile(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Add update document form ui
    const addUpdateDocumentFormUI = () => {
        return(
            <>
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">Document Name <span className="required">*</span></label>
                        <InputText
                            value={convertingDocsData?.name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter First Name"
                            onChange={(e) => onInputChange(e, "name")}
                            className={errors['name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Document Type <span className="required">*</span></label>
                        <Dropdown
                            value={convertingDocsData?.type}
                            name="name"
                            options={docTypeDropDown}
                            filter
                            optionLabel="name"
                            placeholder="Select Document Type"
                            onChange={(e) => onInputChange(e.value, "type")}
                            className={errors['type'] && 'p-invalid'}
                            disabled={editId !== null ? true : false}
                        />
                        <small className="p-invalid-txt">{errors['type']}</small>
                    </div>

                    {
                        convertingDocsData?.type?.code === "eSign" ?
                            <>
                                <div className="field col-6">
                                    <label htmlFor="doc_url">Upload or Drag & Drop File <span className="required">*</span></label>
                                    <FileUpload
                                        ref={fileUploadRef}
                                        accept="application/pdf"
                                        name="doc_url[]"
                                        className="imageupload"
                                        chooseOptions={chooseOptions}
                                        emptyTemplate={emptyTemplate}
                                        headerTemplate={headerTemplate}
                                        itemTemplate={itemConvertingDocTemplate}
                                    ></FileUpload>
                                    <small className="p-invalid-txt">{errors['doc_url']}</small>
                                </div>
                                {editId != null && (
                                    <>
                                        <div className="field col-12 md:col-4 editImage">
                                            {typeof (convertingFile) === 'string' ? (
                                                <>  
                                                    <label htmlFor="photo">Old File</label>
                                                    <img src="/assets/images/pdf-1.png"
                                                        onClick={() => window.open(convertingFile, '_blank')} width={80} height={50} style={{ cursor: "pointer" }}>
                                                    </img>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="field col-12">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => setAdvocateSign(e.checked)} checked={advocateSign}></Checkbox>
                                        <label className="ml-2">Signed By Attorney Also</label>
                                    </div>
                                </div>
                            </>
                        :
                            <></>
                    }
                </div>
            </>
        )
    };

    // Add update converting doc data
    const addUpdateConvertingDocData = () => {
        const { errors, isError } = convertToInvestorValidate(convertingDocsData, convertingFile);
        setErrors(errors);
        if (!isError) {
            setConvertingDocsLoader(true);

            // request data
            let formData = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            }

            formData.append('name', convertingDocsData?.name);
            formData.append('type', convertingDocsData?.type?.code);
            if(advocateSign){
                formData.append('advocate_sign', "Yes");
            }else{
                formData.append('advocate_sign', "No");
            }

            // Check if company logo is selected or not for upload
            if (convertingFile && convertingFile.name) {
                formData.append('doc_url', convertingFile);
            }

            // call api
            pageService.addUpdateConvertInvestorDoc(formData).then((response) => {
                // Get response
                if (response) {
                    setConvertingDocsLoader(false);
                    setConvertingDocsModal(false);
                    setConvertingDocsData({});
                    setEditId(null);
                    setAdvocateSign(false);
                    setConvertingFile("");
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getAllConvertingDocsListFromAPI();
                } else {
                    setConvertingDocsLoader(false);
                    setConvertingDocsModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setConvertingDocsLoader(false);
                setConvertingDocsModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    // Delete document api call
    const deleteDocumentApiCall = () => {
        setDeleteLoader(true);

        // call api
        pageService.deleteConvertInvestorDoc(deleteId).then((response) => {
            // Get response
            if (response) {
                setDeleteLoader(false);
                setDeleteModal(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                getAllConvertingDocsListFromAPI();
            } else {
                setDeleteLoader(false);
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
                        <div className="page-title">Investor Converting Documents</div>
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
                        <Button className="p-button mr-2" label="Add New Document" onClick={() => openAddNewDocumentModal()} />
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
                                    value={convertingDocsList}
                                    paginator={convertingDocsList.length > 0 && true}
                                    globalFilter={globalFilter}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage="No Documents Found"
                                >
                                    {InvestorConvertingDocsColumns.map((col, i) => {
                                        if (col.field === 'doc_url') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={documentTemplate}
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
                                                />
                                            );
                                        }  else if (col.field === 'type') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={typeBodyTemplate}
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
                                    {InvestorConvertingDocsColumns.map((col, i) => (
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
                visible={convertingDocsModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={editId !== null ? "Update Document Details" : "Add New Document"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeAddNewDocumentModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addUpdateConvertingDocData()}
                            loading={convertingDocsLoader}
                        />
                    </>
                }
                onHide={closeAddNewDocumentModal}
            >
                {addUpdateDocumentFormUI()}
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                visible={deleteModal}
                style={{ width: '450px' }}
                header="Delete Client Details"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeDeleteDocumentModal}
                        />
                        <Button
                            label="Delete"
                            className="p-button-danger"
                            onClick={deleteDocumentApiCall}
                            loading={deleteLoader}
                        />
                    </>
                }
                onHide={closeDeleteDocumentModal}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: Do you really want to delete this document?
                    </span>
                </div>
            </Dialog>
        </>
    )
};