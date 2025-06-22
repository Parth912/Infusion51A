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
import { Checkbox } from 'primereact/checkbox';
import { Badge } from 'primereact/badge';
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ListBox } from 'primereact/listbox';
import { BreadCrumb } from 'primereact/breadcrumb';

// Column
import { InvestmentMaterialColumns, InvestmentMaterialFolderColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

import { chooseOptions, emptyTemplate, headerTemplate } from '../../../components/ImageUploadComponent/ImageUploadSetting';

//Services
import PageService from '../../../service/PageService';
import { investmentMaterialFolderNameValidate, investmentMaterialValidate } from '../../../config/Validate';
import PDFViewer from '../../../components/PDFViewer';

export const InvestmentMaterial = () => {
    document.title = "Investment Material | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investment Material</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    // Page service
    const pageService = new PageService();

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    const op = useRef<any>(null);

    const moreOptions = [
        { name: "Move", code: 'move' }
    ];

    const [errors, setErrors] = useState<any>({});
    const [pageLoad, setPageLoad] = useState(false);
    const [investmentMaterialList, setInvestmentMaterialList] = useState<any>([]);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [materialUrl, setMaterialUrl] = useState<any>("");
    const [isConfidential, setIsConfidential] = useState<boolean>(false);
    const [isFlipBook, setIsFlipBook] = useState<boolean>(false);
    const [materialData, setMaterialData] = useState<any>({});
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
    const [addModal, setAddModal] = useState(false);
    const [materialAddButtonDisable, setMaterialAddButtonDisable] = useState<boolean>(true);
    const [fileName, setFileName] = useState<any>("");
    const [manualFile, setManualFile] = useState<any>("");
    const [editId, setEditId] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<any>(false);
    const [deleteLoader, setDeleteLoader] = useState<boolean>(false);
    const [addUpdateFolderModal, setAddUpdateFolderModal] = useState<boolean>(false);
    const [addUpdateFolderLoader, setAddUpdateFolderLoader] = useState<boolean>(false);
    const [folderName, setFolderName] = useState<any>("");
    const [folderEditId, setFolderEditId] = useState<any>(null);
    const [foldersList, setFoldersList] = useState<any>([]);
    const [selectedFolder, setSelectedFolder] = useState<any>({});
    const [deleteFolderId, setDeleteFolderId] = useState<any>(null);
    const [deleteFolderModal, setDeleteFolderModal] = useState<any>(false);
    const [viewModal, setViewModal] = useState<boolean>(false);
    const [viewId, setViewId] = useState<any>(null);
    const [viewName, setViewName] = useState<any>(null);
    const [isFlipBookURL, setIsFlipBookURL] = useState<any>("");

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getInvestmentMaterialDataFromAPI();
        getFoldersListFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        setMaterialUrl("");
        setMaterialData({});
        setMaterialAddButtonDisable(false);
    }, [manualFile]);

    // Get investment material from API
    const getInvestmentMaterialDataFromAPI = async () => {
        // Api call
        pageService
            .getAllInvestmentMaterial(null)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.data.length == 0) {
                        setInvestmentMaterialList([]);
                    } else {
                        setInvestmentMaterialList(DataList.data);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setInvestmentMaterialList([]);
                }
            });
    };

    // Get folders list for dropdown
    const getFoldersListFromAPI = () => {
        // Api call
        pageService
            .getAllInvtMaterialFolder()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setFoldersList([]);
                    } else {
                        setFoldersList(DataList);
                    }
                } else {
                    setFoldersList([]);
                }
            });
    };

    // Delete modal handle change
    const deleteModalHandleChange = (id: any) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    // View Modal For Investment Material 
    const viewInvestmentMaterialApiCall = (rowData: any) => {
        setIsFlipBook(rowData?.is_flipbook == 1 ? true : false);
        // Check if it's a flip book or not
        if (rowData?.is_flipbook == 1) {
            pageService
                .viewFlipBook(rowData?.id)
                .then((response) => {
                    // Get response
                    if (response) {
                        setIsFlipBookURL(response.url);
                    }
                });
        }
        setViewId(rowData?.id);
        setViewName(rowData?.file_name);
        setViewModal(true);
    };

    // Hide view modal
    const hideViewModal = () => {
        setViewModal(false);
        setIsFlipBook(false);
        setIsFlipBookURL("");
        setViewId(null);
        setViewName(null);
    };

    // Action Column template
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                {
                    rowData?.is_flipbook == 1 ?
                        <Button
                            icon="pi pi-eye"
                            className="p-button-square p-button-outlined mr-3"
                            onClick={() => viewInvestmentMaterialApiCall(rowData)}
                        />
                        :
                        <Button
                            icon="pi pi-eye"
                            className="p-button-square p-button-outlined mr-3"
                            onClick={() => window.open(rowData?.material_url, "_blank")}
                        />
                }
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    onClick={() => updateModalHandleChange(rowData.id)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-square p-btn-default"
                    onClick={() => deleteModalHandleChange(rowData.id)}
                />
                <Button
                    style={{ float: "right" }}
                    icon="pi pi-ellipsis-v"
                    className="p-button-square p-btn-default"
                    onClick={(e: any) => op.current.toggle(e)}
                />
                <OverlayPanel ref={op}>
                    <div className="overlaypanel-card-box">
                        <div className="overlaypanel-card-title">Action</div>
                        <div className="overlaypanel-card-body">
                            <ListBox value={""} onChange={(e) => { }} options={moreOptions} optionLabel="name" className="" />
                        </div>
                    </div>
                </OverlayPanel>
            </div>
        );
    };

    // Is confidential template
    const isConfidentialBodyTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.is_confidential == 1 ? <Badge value="Confidential" severity="danger"></Badge> : <Badge value="Normal" severity="warning"></Badge>}
            </>
        )
    }

    // Is flip book
    const isFilpBookBodyTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.is_flipbook == 1 ? <Badge value="Flip Book" severity="success"></Badge> : <Badge value="PDF" severity="info"></Badge>}
            </>
        )
    }

    // Total files template
    const totalFilesTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.invt_material.length}
            </>
        )
    }

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

    // Add modal open
    const addModalHandleChange = () => {
        setAddModal(true);
    };

    // Update modal open
    const updateModalHandleChange = (id: any) => {
        setEditId(id);
        setAddModal(true);

        // api call
        pageService
            .getSingleInvestmentMaterial(id)
            .then((response) => {
                // Get response
                if (response) {
                    if (response) {
                        if (response?.uploaded_from == "drive") {
                            setMaterialUrl(response?.material_url);
                            setMaterialData({
                                'material_id': response?.material_id,
                                'material_name': response?.material_name,
                                'material_type': "File",
                                'material_url': response?.material_url,
                                'uploaded_from': 'drive'
                            });
                            showDetails(response?.material_url, id);
                        } else {
                            setMaterialData({
                                'uploaded_from': 'manual'
                            });
                            setManualFile(response?.material_url);
                        }
                        setSelectedFolder({ code: response?.folder?.id, name: response?.folder?.folder_name });
                        setFileName(response?.file_name);
                        setIsConfidential(response?.is_confidential == 1 ? true : false);
                        setIsFlipBook(response?.is_flipbook == 1 ? true : false);
                    }
                }
            });
    };

    // Add modal close
    const hideAddModal = () => {
        setAddModal(false);
        setEditId(null);
        setMaterialUrl("");
        setIsConfidential(false);
        setIsFlipBook(false);
        setMaterialData({});
        setManualFile("");
        setFileName("");
        setSelectedFolder({});
        setErrors({});
    };

    // for remove manual file
    const onTemplateRemoveManualFile = (callback: any) => {
        setManualFile({});
        setMaterialAddButtonDisable(true);
        callback();
    };

    // for upload manual file
    const itemManualFileTemplate = (file: any, props: any) => {
        setManualFile(file);
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
                                onClick={() => onTemplateRemoveManualFile(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // On material url change
    const onMaterialUrlChange = (val: any) => {
        setMaterialUrl(val);
        setManualFile("");
        showDetails(val, editId);
    };

    // Show details
    const showDetails = (val: any, id: any) => {
        try {
            setDetailsLoading(true);

            // call api
            pageService.getFileOrFolderDetails(val, id).then((response) => {
                // Get response
                if (response) {
                    setDetailsLoading(false);
                    setMaterialData(response);
                    setMaterialAddButtonDisable(false);
                } else {
                    setDetailsLoading(false);
                    setMaterialData({});
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                    setMaterialAddButtonDisable(true);
                }
            }).catch((error) => {
                setDetailsLoading(false);
                setMaterialData({});
                setMaterialAddButtonDisable(true);
                if (error.response && error.response.status === 400) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Message',
                        detail: error.response.data.error,
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
            setDetailsLoading(false);
            setMaterialAddButtonDisable(true);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.error,
            });
        }
    };

    // On click of submit on add or update
    const addUpdateInvestmentMaterial = () => {
        try {
            const { errors, isError } = investmentMaterialValidate(materialUrl, manualFile, fileName, selectedFolder);
            setErrors(errors);

            if (!isError) {
                setSubmitLoading(true);

                // request data
                let formData = new FormData();

                if (editId !== null) {
                    formData.append('id', editId);
                }

                // Check if file is uploaded from drive or manual from directory
                if (materialUrl != "") {
                    formData.append('material_id', materialData?.id);
                    formData.append('material_name', materialData?.name);
                    formData.append('material_type', "File");
                    formData.append('material_url', materialData?.url);
                    formData.append('uploaded_from', 'drive');
                } else {
                    formData.append('material_name', fileName);
                    formData.append('material_type', "File");
                    formData.append('uploaded_from', 'manual');
                    if (manualFile && manualFile.name) {
                        formData.append('manual_file', manualFile);
                    }
                }
                formData.append('file_name', fileName);
                formData.append('folder_id', selectedFolder?.code);
                if (isConfidential == true) {
                    formData.append('is_confidential', "Yes");
                } else {
                    formData.append('is_confidential', "No");
                }

                if (isFlipBook == true) {
                    formData.append('is_flipbook', "Yes");
                } else {
                    formData.append('is_flipbook', "No");
                }

                // call api
                pageService.addInvestmentMaterial(formData).then((response) => {
                    // Get response
                    if (response) {
                        setSubmitLoading(false);
                        setAddModal(false);
                        setMaterialUrl("");
                        setMaterialData({});
                        setFileName("");
                        setSelectedFolder({});
                        setIsConfidential(false);
                        setIsFlipBook(false);
                        setExpandedRows(null);
                        getInvestmentMaterialDataFromAPI();
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.data.message,
                        });
                    } else {
                        setSubmitLoading(false);
                        setAddModal(true);
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

    // Hide delete modal
    const hideDeleteModal = () => {
        setDeleteId(null);
        setDeleteModal(false);
    };

    // Delete investment material
    const deleteInvestmentMaterialApiCall = () => {
        setDeleteLoader(true);

        // call api
        pageService.trashOrRevertFolderOrFile(deleteId, "file", "trash").then((response) => {
            // Get response
            if (response) {
                setDeleteLoader(false);
                setDeleteModal(false);
                setExpandedRows(null);
                setDeleteId(null);
                getInvestmentMaterialDataFromAPI();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
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

    // Check if any data is there for row expansion
    const allowExpansion = (rowData: any) => {
        return rowData?.invt_material?.length > 0;
    };

    // Row expansion template
    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="p-3">
                <DataTable
                    className="datatable-responsive invt-material-table"
                    value={data.invt_material}
                    paginator={data.invt_material.length > 0 && true}
                    rows={10}
                    emptyMessage="No Investment Material Found"
                >
                    {InvestmentMaterialColumns.map((col, i) => {
                        if (col.field === 'sr_no') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={(_, { rowIndex }) => rowIndex + 1}
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
                        } else if (col.field === 'is_confidential') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={isConfidentialBodyTemplate}
                                />
                            );
                        } else if (col.field === 'is_flipbook') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={isFilpBookBodyTemplate}
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
        );
    };

    // Add update modal handle change
    const addFolderModalHandleChange = () => {
        setAddUpdateFolderModal(true);
    };

    // On hide folder name
    const hideAddUpdateFolderModal = () => {
        setAddUpdateFolderModal(false);
        setFolderName("");
        setFolderEditId(null);
        setErrors({});
    };

    // On click of submit on add or update folder name
    const addUpdateFolderNameApiCall = () => {
        const { errors, isError } = investmentMaterialFolderNameValidate(folderName);
        setErrors(errors);

        try {
            if (!isError) {
                setAddUpdateFolderLoader(true);

                // request data
                let formData = new FormData();
                if (folderEditId !== null) {
                    formData.append('id', folderEditId);
                }
                formData.append('folder_name', folderName);

                // call api
                pageService.addUpdateInvtMaterialFolder(formData).then((response) => {
                    // Get response
                    if (response) {
                        setAddUpdateFolderLoader(false);
                        setAddUpdateFolderModal(false);
                        setFolderName("");
                        setFolderEditId(null);
                        setExpandedRows(null);
                        getInvestmentMaterialDataFromAPI();
                        getFoldersListFromAPI();
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.message,
                        });
                    } else {
                        setAddUpdateFolderLoader(false);
                        setAddUpdateFolderModal(true);
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

    // template for action body main
    const actionBodyMainTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <div className="tb-actions">
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-square p-btn-default"
                        onClick={() => updateFolderNameModalHandleChange(rowData.id, rowData.folder_name)}
                    />
                    <Button
                        icon="pi pi-trash"
                        className="p-button-square p-btn-default"
                        onClick={() => deleteFolderModalHandleChange(rowData.id)}
                    />
                </div>
            </>
        )
    };

    // Update folder name handle change
    const updateFolderNameModalHandleChange = (id: any, folder_name: any) => {
        setFolderEditId(id);
        setAddUpdateFolderModal(true);
        setFolderName(folder_name);
    };

    // Delete Folder Modal Handle Change
    const deleteFolderModalHandleChange = (id: any) => {
        setDeleteFolderId(id);
        setDeleteFolderModal(true);
    };

    // Hide delete folder modal
    const hideDeleteFolderModal = () => {
        setDeleteFolderId(null);
        setDeleteFolderModal(false);
    };

    // Delete Folder
    const deleteFolderApiCall = () => {
        setDeleteLoader(true);

        // call api
        pageService.trashOrRevertFolderOrFile(deleteFolderId, "folder", "trash").then((response) => {
            // Get response
            if (response) {
                setDeleteLoader(false);
                setDeleteFolderModal(false);
                setDeleteFolderId(null);
                setExpandedRows(null);
                getFoldersListFromAPI();
                getInvestmentMaterialDataFromAPI();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
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

    // page template
    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"> Investment Material</div>
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
                        <Button className="p-button" icon="pi pi-check-circle" label="Approvals" onClick={() => navigate('/invt-material-approvals')} />
                        <Button className="p-button" label="New Folder" onClick={() => addFolderModalHandleChange()} />
                        <Button className="p-button mr-2" label="Add New Investment Material" onClick={() => addModalHandleChange()} />
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
                                        className='datatable-responsive'
                                        dataKey="id"
                                        value={investmentMaterialList}
                                        globalFilter={globalFilter}
                                        expandedRows={expandedRows}
                                        onRowToggle={(e) => setExpandedRows(e.data)}
                                        rowExpansionTemplate={rowExpansionTemplate}
                                        emptyMessage="No Investment Material Found"
                                    >
                                        <Column expander={allowExpansion} style={{ width: '5rem' }} />
                                        <Column field="folder_name" header="Name" sortable />
                                        <Column field="total_files" header="Files" body={totalFilesTemplate} />
                                        <Column field="actions" header="" body={actionBodyMainTemplate} />
                                    </DataTable>
                                </>
                            ) : (
                                <>
                                    <DataTable value={Skeletonitems}>
                                        {InvestmentMaterialFolderColumns.map((col, i) => (
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

            {/* Add Dialog */}
            <Dialog
                visible={addModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Add New Investment Material (PDF File Only)"
                modal
                footer={
                    <>
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addUpdateInvestmentMaterial()}
                            loading={submitLoading}
                            // disabled={Object.keys(materialData).length > 0 ? false : true}
                            disabled={materialAddButtonDisable}
                        />
                    </>
                }
                onHide={hideAddModal}
            >
                <div className="formgrid grid">
                    <div className="field col-12">
                        <label htmlFor="name">Drive File URL</label>
                        <InputText
                            value={materialUrl}
                            name="material_url"
                            autoComplete="off"
                            placeholder="Enter URL"
                            onChange={(e) => onMaterialUrlChange(e.target.value)}
                            className={errors['material_url'] && 'p-invalid'}
                            disabled={editId === null && manualFile !== "" ? true : false}
                        />
                        <small className="p-invalid-txt">{errors['material_url']}</small>
                    </div>

                    <div className="field col-6">
                        <label htmlFor="manual_file">Drag and Drop Or Upload File </label>
                        <FileUpload
                            ref={fileUploadRef}
                            accept="application/pdf"
                            name="manual_file[]"
                            className="imageupload"
                            chooseOptions={chooseOptions}
                            emptyTemplate={emptyTemplate}
                            headerTemplate={headerTemplate}
                            itemTemplate={itemManualFileTemplate}
                            disabled={editId === null && materialUrl !== "" ? true : false}
                        ></FileUpload>
                        <small className="p-invalid-txt">{errors['manual_file']}</small>
                    </div>
                    {editId != null && (
                        <>
                            {
                                !window.cn(materialData) && materialData !== undefined && materialData?.uploaded_from == "manual" ?
                                    <div className="field col-12 md:col-4 editImage cursor-pointer">
                                        {typeof (manualFile) === 'string' ? (
                                            <>
                                                <label htmlFor="photo">Old File</label>
                                                <img src="/assets/images/pdf-1.png"
                                                    onClick={() => window.open(manualFile, '_blank')} width={50} height={50}>
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

                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">File Name <span className="required">*</span></label>
                        <InputText
                            value={fileName}
                            name="file_name"
                            autoComplete="off"
                            placeholder="Enter File Name"
                            onChange={(e) => setFileName(e.target.value)}
                            className={errors['file_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['file_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="folder">Folder <span className="required">*</span></label>
                        <Dropdown
                            filter
                            value={selectedFolder}
                            onChange={(e) => setSelectedFolder(e.value)}
                            options={foldersList}
                            optionLabel="name"
                            name="folder"
                            placeholder="Select Folder"
                            className={errors['folder'] && 'p-invalid'}
                        ></Dropdown>
                        <small className="p-invalid-txt">{errors['folder']}</small>
                    </div>


                    {
                        !window.cn(materialData) && manualFile === "" && (Object.keys(materialData).length > 0 || manualFile != "") ?
                            <>
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <p><b>Name : </b><u><a href={materialData?.url} target="_blank" rel="noopener noreferrer" style={{ color: "black" }}>{materialData?.name}</a></u></p>
                                    </div>
                                </div>
                            </>
                            :
                            <></>
                    }
                    <div className="field col-12 mt-3">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="is_confidential"
                                name="is_confidential"
                                value="Yes"
                                onChange={e => setIsConfidential(e.checked)}
                                checked={isConfidential}
                            />
                            <label htmlFor="is_confidential" className="ml-2">Is this file is confidential to share? If you select this then whenever this file is shared to the potential investor that will require approval.</label>
                        </div>
                    </div>
                    <div className="field col-12 mt-3">
                        <div className="flex align-items-center">
                            <Checkbox
                                inputId="is_flipbook"
                                name="is_flipbook"
                                value="Yes"
                                onChange={e => setIsFlipBook(e.checked)}
                                checked={isFlipBook}
                            />
                            <label htmlFor="is_flipbook" className="ml-2">Show it as a flip book</label>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Delete File Dialog */}
            <Dialog
                visible={deleteModal}
                style={{ width: '450px' }}
                header="Trash Investment Material"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideDeleteModal}
                        />
                        <Button
                            label="Trash"
                            className="p-button-danger"
                            onClick={deleteInvestmentMaterialApiCall}
                            loading={deleteLoader}
                        />
                    </>
                }
                onHide={hideDeleteModal}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: If you move this file to trash then any investor who has access to this file and will be revoked.
                        {/* Note: If you delete this investment material then whichever investor has the access to it that would be removed from them and all the data accociated with this will be removed. */}
                    </span>
                </div>
            </Dialog>

            {/* Add Update Folder */}
            <Dialog
                visible={addUpdateFolderModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={folderEditId !== null ? "Update Folder Name" : "Add New Folder"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideAddUpdateFolderModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addUpdateFolderNameApiCall()}
                            loading={addUpdateFolderLoader}
                        />
                    </>
                }
                onHide={hideAddUpdateFolderModal}
            >
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="name">Name <span style={{ color: "red" }}>*</span></label>
                        <InputText
                            value={folderName}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Folder Name"
                            onChange={(e) => setFolderName(e.target.value)}
                            className={errors['folder_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['folder_name']}</small>
                    </div>
                </div>
            </Dialog>

            {/* Delete Folder Dialog */}
            <Dialog
                visible={deleteFolderModal}
                style={{ width: '450px' }}
                header="Trash Folder"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideDeleteFolderModal}
                        />
                        <Button
                            label="Trash"
                            className="p-button-danger"
                            onClick={deleteFolderApiCall}
                            loading={deleteLoader}
                        />
                    </>
                }
                onHide={hideDeleteFolderModal}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: If you move this folder to trash then all the files in the folder will be trashed and any investor who has access to this folder and any of it's files will be revoked.
                        {/* Note: If you delete this folder then all the files in the folder will be deleted and all the data accociated with this will be removed. */}
                    </span>
                </div>
            </Dialog>

            {/* Investment material view modal */}
            <Dialog
                visible={viewModal}
                style={{ width: '450px' }}
                className="investor-pdf-viewer p-fluid p-dialog-maximized"
                header={viewName}
                modal
                onHide={hideViewModal}
            >
                {
                    viewId !== null ?
                        <iframe
                            src={isFlipBookURL}
                            title="webview"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                        :
                        <></>
                }

            </Dialog>
        </>
    );
};
