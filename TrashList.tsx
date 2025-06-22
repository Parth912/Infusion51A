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

// Column
import { TrashFileColumns, TrashFolderColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';

export const TrashList = () => {
    document.title = "Trash Lists | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Trash Lists</span>
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

    const [pageLoad, setPageLoad] = useState(false);
    const [investmentMaterialList, setInvestmentMaterialList] = useState<any>([]);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<any>(false);
    const [deleteLoader, setDeleteLoader] = useState<boolean>(false);
    const [deleteFolderId, setDeleteFolderId] = useState<any>(null);
    const [deleteFolderModal, setDeleteFolderModal] = useState<any>(false);
    const [revertId, setRevertId] = useState<any>(null);
    const [revertModal, setRevertModal] = useState<boolean>(false);
    const [revertType, setRevertType] = useState<any>("");
    const [revertLoader, setRevertLoader] = useState<boolean>(false);
    const [emptyTrashModal, setEmptyTrashModal] = useState<boolean>(false);
    const [emptyTrashLoader, setEmptyTrashLoader] = useState<boolean>(false);

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getInvestmentMaterialDataFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Get investment material from API
    const getInvestmentMaterialDataFromAPI = async () => {
        // Api call
        pageService
            .getTrashedFolderOrFile()
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

    // Delete modal handle change
    const deleteModalHandleChange = (id: any) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    // Action Column template
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="actions">
                <Button
                    icon="pi pi-eye"
                    className="p-button-square p-button-secondary"
                    onClick={() => window.open(rowData?.material_url, "_blank")}
                />
                <Button
                    icon="pi pi-undo"
                    className="p-button-square p-button-secondary ml-2"
                    onClick={() => revertModalHandleChange(rowData.id, "file")}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-square p-button-secondary ml-2"
                    onClick={() => deleteModalHandleChange(rowData.id)}
                />
            </div>
        );
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

    // Hide delete modal
    const hideDeleteModal = () => {
        setDeleteId(null);
        setDeleteModal(false);
    };

    // Delete investment material
    const deleteInvestmentMaterialApiCall = () => {
        setDeleteLoader(true);

        // call api
        pageService.deleteInvestmentMaterial(deleteId).then((response) => {
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
        return rowData?.file_deleted;
    };

    // Row expansion template
    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="p-3">
                <DataTable
                    className="datatable-responsive invt-material-table"
                    value={data.materials}
                    paginator={data.materials.length > 0 && true}
                    rows={10}
                    emptyMessage="No Files Found"
                >
                    {TrashFileColumns.map((col, i) => {
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

    // template for action body main
    const actionBodyMainTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {
                    rowData?.file_deleted == false ?
                        <>
                            <Button
                                icon="pi pi-undo"
                                className="p-button-square p-button-secondary ml-2"
                                onClick={() => revertModalHandleChange(rowData.id, "folder")}
                            />
                            <Button
                                icon="pi pi-trash"
                                className="p-button-square p-button-secondary ml-2"
                                onClick={() => deleteFolderModalHandleChange(rowData.id)}
                            />
                        </>
                        :
                        <></>
                }
            </>
        )
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
        pageService.deleteFolder(deleteFolderId).then((response) => {
            // Get response
            if (response) {
                setDeleteLoader(false);
                setDeleteFolderModal(false);
                setDeleteFolderId(null);
                setExpandedRows(null);
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

    // Revert Folder Modal Handle Change
    const revertModalHandleChange = (id: any, type: any) => {
        setRevertId(id);
        setRevertType(type);
        setRevertModal(true);
    };

    // Hide revert modal
    const hideRevertModal = () => {
        setRevertId(null);
        setRevertType("");
        setRevertModal(false);
    };

    // Restore material api call
    const restoreMaterialApiCall = () => {
        setRevertLoader(true);

        // call api
        pageService.trashOrRevertFolderOrFile(revertId, revertType, "revert").then((response) => {
            // Get response
            if (response) {
                setRevertLoader(false);
                setRevertModal(false);
                setExpandedRows(null);
                setRevertId(null);
                getInvestmentMaterialDataFromAPI();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
            } else {
                setRevertLoader(false);
                setRevertModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong, Please try again.',
                });
            }
        });
    };

    // Empty trash modal handle change
    const emptyTrashHandleChange = () => {
        setEmptyTrashModal(true);
    };

    // Hide empty trash modal
    const hideEmptyTrashModal = () => {
        setEmptyTrashModal(false);
        setEmptyTrashLoader(false);
    };

    // Empty trash on submit
    const emptyTrashOnSubmit = () => {
        setEmptyTrashLoader(true);

        // call api
        pageService.emptyTrash().then((response) => {
            // Get response
            if (response) {
                setEmptyTrashLoader(false);
                setEmptyTrashModal(false);
                setExpandedRows(null);
                getInvestmentMaterialDataFromAPI();
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
            } else {
                setEmptyTrashLoader(false);
                setEmptyTrashModal(true);
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
                        <div className="page-title">Trash Lists</div>
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
                        <Button className="p-button mr-2" label="Empty Trash" onClick={() => emptyTrashHandleChange()} />
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
                                        className='datatable-responsive' stripedRows
                                        dataKey="id"
                                        value={investmentMaterialList}
                                        globalFilter={globalFilter}
                                        expandedRows={expandedRows}
                                        onRowToggle={(e) => setExpandedRows(e.data)}
                                        rowExpansionTemplate={rowExpansionTemplate}
                                        emptyMessage="Trash Is Empty"
                                    >
                                        <Column expander={allowExpansion} style={{ width: '5rem' }} />
                                        <Column field="folder_name" header="Name" sortable />
                                        <Column field="actions" header="" body={actionBodyMainTemplate} />
                                    </DataTable>
                                </>
                            ) : (
                                <>
                                    <DataTable value={Skeletonitems}>
                                        {TrashFolderColumns.map((col, i) => (
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

            {/* Delete File Dialog */}
            <Dialog
                visible={deleteModal}
                style={{ width: '450px' }}
                header="Delete File Permanently"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={hideDeleteModal}
                        />
                        <Button
                            label="Permanently Delete"
                            icon="pi pi-check"
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
                        Note: If you delete this investment material then whichever investor has the access to it that would be removed from them and all the data accociated with this will be removed.
                    </span>
                </div>
            </Dialog>

            {/* Delete Folder Dialog */}
            <Dialog
                visible={deleteFolderModal}
                style={{ width: '450px' }}
                header="Delete Folder Permanently"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={hideDeleteFolderModal}
                        />
                        <Button
                            label="Permanently Delete"
                            icon="pi pi-check"
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
                        Note: If you delete this folder then all the files in the folder will be deleted and all the data accociated with this will be removed.
                    </span>
                </div>
            </Dialog>

            {/* Revert File/Folder Dialog */}
            <Dialog
                visible={revertModal}
                style={{ width: '450px' }}
                header={revertType == "File" ? "Restore File" : "Restore Folder"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={hideRevertModal}
                        />
                        <Button
                            label="Restore"
                            icon="pi pi-check"
                            className="p-button-success"
                            onClick={restoreMaterialApiCall}
                            loading={revertLoader}
                        />
                    </>
                }
                onHide={hideRevertModal}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-undo mr-3 approve-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="approve-dailog-note">
                        Note: If you delete this folder then all the files in the folder will be deleted and all the data accociated with this will be removed.
                    </span>
                </div>
            </Dialog>

            {/* Empty Trash Dialog */}
            <Dialog
                visible={emptyTrashModal}
                style={{ width: '450px' }}
                header="Empty Trash"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideEmptyTrashModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-danger"
                            onClick={emptyTrashOnSubmit}
                            loading={emptyTrashLoader}
                        />
                    </>
                }
                onHide={hideEmptyTrashModal}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: If you empty trash all the material will be removed permanently which are in trash.
                    </span>
                </div>
            </Dialog>
        </>
    );
};
