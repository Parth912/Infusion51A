import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';

import moment from "moment/moment";

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { SkeletonbodyTemplate, Skeletonitems } from '../../../appconfig/Settings';
import { InvestmentMaterialSelectionBrokerColumns, InvestmentMaterialSelectionAdminColumns, LoginAnalysisColumns, InvtMaterialOpenTimeBrokerColumns, InvtMaterialOpenTimeAdminColumns, InvestmentMaterialFolderColumns, DocumentRequestColumns } from '../../../appconfig/DatatableSetting';
import { InputSwitch } from 'primereact/inputswitch';
import PDFViewer from '../../../components/PDFViewer';
import { Link } from 'react-router-dom';

export const InvestorsDetails = () => {
    document.title = "Investor Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/investors">Investors</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investor Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    const [globalFilter, setGlobalFilter] = useState<any>(null);

    const pageService = new PageService();
    const location = useLocation();
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    const [pageLoad, setPageLoad] = useState(false);
    const [tablePageLoad, setTablePageLoad] = useState(false);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [investorId, setInvestorId] = useState<any>();
    const [investorData, setInvestorData] = useState<any>({});
    const [selectedInvestmentFiles, setSelectedInvestmentFiles] = useState<any>([]);
    const [selectionMaterial, setSelectionMaterial] = useState<any>([]);
    const [pendingApprovalInvestmentMaterial, setPendingApprovalInvestmentMaterial] = useState<any>([]);
    const [notificationsList, setNotificationsList] = useState<any>([]);
    const [notificationLoad, setNotificationLoad] = useState<boolean>(false);
    const [invtMaterialOpenTimeList, setInvtMaterialOpenTimeList] = useState<any>([]);
    const [viewModal, setViewModal] = useState<boolean>(false);
    const [viewId, setViewId] = useState<any>(null);
    const [viewName, setViewName] = useState<any>(null);
    const [isFlipBook, setIsFlipBook] = useState<boolean>(false);
    const [isFlipBookURL, setIsFlipBookURL] = useState<any>("");

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setInvestorId(state);
            getInvestorDetailsFromAPI(state);
            getUserAllNotificationsFromAPI(state);
            getInvestmentMaterialDataFromAPI();
        }
    }, []);

    // Get investment material from API
    const getInvestmentMaterialDataFromAPI = async () => {
        setTablePageLoad(false);
        // Api call
        pageService
            .getAllInvestmentMaterial("selection")
            .then((response) => {
                // Get response
                if (response) {
                    setSelectionMaterial(response.data);
                    setTablePageLoad(true);
                } else {
                    setTablePageLoad(true);
                    setSelectionMaterial([]);
                }
            });
    };

    // Get Investor Details
    const getInvestorDetailsFromAPI = async (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleClientDetails(state.investor_id)
            .then((response) => {
                // Get response
                if (response) {
                    const responseData = response;
                    setInvestorData(responseData);
                    if (responseData?.user_type == "investor") {
                        setSelectedInvestmentFiles(responseData?.invt_material_access);
                        setPendingApprovalInvestmentMaterial(responseData?.pending_investment_material);
                    }
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                    setInvestorData({});
                }
            });
    };

    // Get Investors analysis
    const getUserAllNotificationsFromAPI = async (state: any) => {
        setNotificationLoad(false);
        // Api call
        pageService
            .getUserAllNotifications(state.investor_id)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    setNotificationsList(DataList?.login_notification);
                    setInvtMaterialOpenTimeList(DataList?.invt_material_open_time);
                    setNotificationLoad(true);
                } else {
                    setNotificationLoad(false);
                    setNotificationsList([]);
                }
            });
    };

    // Investment material access
    const onSelectMaterial = (val: any, rowData: any) => {
        // Check if giving access of new material or removing access from existing one
        let accessStatus: any = false;
        if (val) {
            accessStatus = true;
        }

        //Request object
        let formRequestData = new FormData();
        formRequestData.append('user_id', investorId.investor_id);
        formRequestData.append('file_id', rowData?.id);
        formRequestData.append('folder_id', rowData?.folder_id);
        formRequestData.append('status', accessStatus);
        formRequestData.append('is_confidential', rowData?.is_confidential);

        pageService.investmentMaterialAccess(formRequestData).then((result: any) => {
            toast.current?.show({ severity: 'success', summary: 'Success', detail: result?.message });
            setTimeout(() => {
                getInvestorDetailsFromAPI({ investor_id: investorId.investor_id });
                getInvestmentMaterialDataFromAPI();
            }, 1000);
        }).catch(error => {
            if (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response.data.error });
            }
        });
    };

    // On allow revoke download file
    const onAllowRevokeDownload = (val: any, rowData: any) => {
        // Check if giving download access or removing download access
        let downloadStatus: any = false;
        if (val) {
            downloadStatus = true;
        }

        //Request object
        let formRequestData = new FormData();
        formRequestData.append('user_id', investorId.investor_id);
        formRequestData.append('file_id', rowData?.id);
        formRequestData.append('folder_id', rowData?.folder_id);
        formRequestData.append('is_download', downloadStatus);

        pageService.allowRevokeDownloadFile(formRequestData).then((result: any) => {
            toast.current?.show({ severity: 'success', summary: 'Success', detail: result?.message });
            setTimeout(() => {
                getInvestorDetailsFromAPI({ investor_id: investorId.investor_id });
                getInvestmentMaterialDataFromAPI();
            }, 1000);
        }).catch(error => {
            if (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response.data.error });
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

    // for column confidential body template
    const isConfidentialBodyTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.is_confidential == 1 ? <Badge value="Confidential" severity="danger"></Badge> : <Badge value="Normal" severity="warning"></Badge>}
            </>
        )
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

    // for column action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                <Button
                    icon="pi pi-eye"
                    className="p-button-square p-btn-default"
                    onClick={() => viewInvestmentMaterialApiCall(rowData)}
                />
            </div>
        );
    };

    // Template for access
    const accessTemplate = (rowData: any) => {
        let isAlreadySelected = selectedInvestmentFiles.filter((file: any) => file.file_id === rowData.id);
        let isSelected = false;
        if (isAlreadySelected.length > 0) {
            isSelected = true;
        }

        return(
            <>
                <InputSwitch className="mr-2" checked={isSelected} onChange={(e) => onSelectMaterial(e.value, rowData)} tooltip={isSelected ? 'Revoke Access' : 'Give Access'} />
            </>
        );
    };

    // Template for download
    const downloadTemplate = (rowData: any) => {
        let isAlreadySelected = selectedInvestmentFiles.filter((file: any) => file.file_id === rowData.id);
        let isSelected = false;
        if (isAlreadySelected.length > 0) {
            isSelected = true;
        }
        
        let isDownload = false;
        if (isAlreadySelected.length > 0 && isAlreadySelected[0].is_download == 1) {
            isDownload = true;
        }

        return (
            <>
                <InputSwitch className="mr-2" checked={isDownload} onChange={(e) => onAllowRevokeDownload(e.value, rowData)} tooltip={isDownload ? 'Revoke Download Access' : 'Allow Download'} disabled={isSelected ? false : true} />
            </>
        );
    };

    const dateFormatCreatedAtTemplate = (rowData: any, rowIndex: any) => {

        return (
            <>
                {rowData.created_at === rowData[rowIndex.field] && rowData.created_at !== null ? moment.utc(rowData.created_at).format('MMM DD, YYYY hh:mm A') : '-'}
            </>
        );
    };

    // Material name template
    const materialNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.invt_material?.material_name}
            </>
        );
    };

    // File name template
    const fileNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.invt_material?.file_name}
            </>
        );
    };

    // Material opened template
    const materialOpenTemplate = (rowData: any, rowIndex: any) => {

        return (
            <>
                {rowData?.material_open_count} Times
            </>
        );
    };

    // Total files template
    const totalFilesTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.invt_material.length}
            </>
        )
    }

    // Check if any data is there for row expansion
    const allowExpansion = (rowData: any) => {
        return rowData?.invt_material?.length > 0;
    };

    // Row expansion template
    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="p-3">
                <DataTable
                    className="datatable-responsive"
                    value={data.invt_material}
                    paginator={data.invt_material.length > 0 && true}
                    rows={10}
                    emptyMessage="No Files Found"
                >
                    {localStorage.getItem("user_type") == "broker" ? InvestmentMaterialSelectionBrokerColumns.map((col, i) => {
                        if (col.field === 'is_confidential') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={isConfidentialBodyTemplate}
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
                        } else if (col.field === 'access') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={accessTemplate}
                                />
                            );
                        } else if (col.field === 'download') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={downloadTemplate}
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
                    })
                        :
                        InvestmentMaterialSelectionAdminColumns.map((col, i) => {
                            if (col.field === 'is_confidential') {
                                return (
                                    <Column
                                        key={col.field}
                                        field={col.field}
                                        header={col.header}
                                        body={isConfidentialBodyTemplate}
                                        filter
                                        sortable
                                    />
                                );
                            } else if (col.field === 'access') {
                                return (
                                    <Column
                                        key={col.field}
                                        field={col.field}
                                        header={col.header}
                                        body={accessTemplate}
                                    />
                                );
                            } else if (col.field === 'download') {
                                return (
                                    <Column
                                        key={col.field}
                                        field={col.field}
                                        header={col.header}
                                        body={downloadTemplate}
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
                        })
                    }
                </DataTable>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Investor Details {!window.cn(investorData) && investorData?.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : investorData?.status == 1 ? <><Badge value="Active" severity="success"></Badge></> : <><Badge value="Access Revoked" severity="danger"></Badge></>}</div>
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
                                    <div className="viewcard-text">{!window.cn(investorData) ? investorData?.first_name + " " + investorData?.last_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Email</div>
                                    <div className="viewcard-text">{!window.cn(investorData) ? investorData?.email : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Mobile No.</div>
                                    <div className="viewcard-text">{!window.cn(investorData) ? "+" + investorData?.country?.phonecode + " " + investorData?.mobile : ""}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Investor Section */}
            <div className='grid'>
                <div className="col-12 md:col-9">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title-box">
                                <h3 className="card-title">Choose Investment Material</h3>
                            </div>
                            <div className="card-toolbar">
                                <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>
                            </div>
                        </div>
                        <div className="card-body">
                            {/* Datatable Start */}
                            {tablePageLoad ? (
                                <>
                                    <DataTable
                                        className='datatable-responsive' stripedRows
                                        value={selectionMaterial}
                                        globalFilter={globalFilter}
                                        expandedRows={expandedRows}
                                        onRowToggle={(e) => setExpandedRows(e.data)}
                                        rowExpansionTemplate={rowExpansionTemplate}
                                        dataKey="id"
                                    >
                                        <Column expander={allowExpansion} style={{ width: '5rem' }} />
                                        <Column field="folder_name" header="Name" sortable />
                                        <Column field="total_files" header="Files" body={totalFilesTemplate} />
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

                            {
                                pendingApprovalInvestmentMaterial.length > 0 ?
                                    <>
                                        <hr />
                                        <h6 style={{ color: "red" }}><b>Pending Approvals</b></h6>
                                        {
                                            pendingApprovalInvestmentMaterial.map((item: any, index: any) => {
                                                return (
                                                    <>
                                                        <p style={{ color: "red", lineHeight: "12px" }}>{index + 1}. {item?.material_data?.file_name}</p>
                                                    </>
                                                )
                                            })
                                        }
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                </div>

                <div className="col-12 md:col-3">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title-box">
                                <h3 className="card-title">Login Analysis</h3>
                            </div>
                            <div className="card-toolbar"></div>
                        </div>
                        <div className="card-body">
                            {notificationLoad ? (
                                <>
                                    <DataTable
                                        className='datatable-responsive' stripedRows
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
                                    <DataTable value={Skeletonitems}>
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

                <div className="col-12 md:col-9">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title-box">
                                <h3 className="card-title">Document Requests</h3>
                            </div>
                        </div>
                        <div className="card-body">
                            {/* Datatable Start */}
                            {tablePageLoad ? (
                                <>
                                    <DataTable
                                        className='datatable-responsive' stripedRows
                                        value={investorData?.doc_request}
                                        paginator={investorData?.doc_request.length > 0 && true}
                                        rows={5}
                                        emptyMessage={"No Requests Found"}
                                    >
                                        {DocumentRequestColumns.map((col, i) => {
                                            if (col.field === 'sr_no') {
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
                                                    />
                                                );
                                            }
                                        })}
                                    </DataTable>
                                </>
                            ) : (
                                <>
                                    <DataTable value={Skeletonitems}>
                                        {DocumentRequestColumns.map((col, i) => (
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

                            {
                                pendingApprovalInvestmentMaterial.length > 0 ?
                                    <>
                                        <hr />
                                        <h6 style={{ color: "red" }}><b>Pending Approvals</b></h6>
                                        {
                                            pendingApprovalInvestmentMaterial.map((item: any, index: any) => {
                                                return (
                                                    <>
                                                        <p style={{ color: "red", lineHeight: "12px" }}>{index + 1}. {item?.material_data?.file_name}</p>
                                                    </>
                                                )
                                            })
                                        }
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                </div>
           

            <div className="col-12 md:col-9">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title-box">
                            <h3 className="card-title">Investment Material Read Time Logs</h3>
                        </div>
                        <div className="card-toolbar"></div>
                    </div>
                    <div className="card-body">
                        {notificationLoad ? (
                            <>
                                <DataTable
                                    className='datatable-responsive' stripedRows
                                    value={invtMaterialOpenTimeList}
                                    paginator={invtMaterialOpenTimeList.length > 0 && true}
                                    rows={8}
                                    emptyMessage={"No Data Found"}
                                >
                                    {localStorage.getItem("user_type") == "broker" ? InvtMaterialOpenTimeBrokerColumns.map((col, i) => {
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
                                        } else if (col.field === 'material_name') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={fileNameTemplate}
                                                    sortable
                                                />
                                            );
                                        } else if (col.field === 'material_open_count') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={materialOpenTemplate}
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
                                                />
                                            );
                                        }
                                    }) :
                                        InvtMaterialOpenTimeAdminColumns.map((col, i) => {
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
                                            } else if (col.field === 'material_name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={materialNameTemplate}
                                                        sortable
                                                    />
                                                );
                                            } else if (col.field === 'file_name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={fileNameTemplate}
                                                        sortable
                                                    />
                                                );
                                            } else if (col.field === 'material_open_count') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={materialOpenTemplate}
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
                                                    />
                                                );
                                            }
                                        })
                                    }
                                </DataTable>
                            </>
                        ) : (
                            <>
                                {/* Skeleton Data table */}
                                <DataTable value={Skeletonitems}>
                                    {InvtMaterialOpenTimeBrokerColumns.map((col, i) => (
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
                        <>
                            {
                                isFlipBook ?
                                    <iframe
                                        src={isFlipBookURL}
                                        title="webview"
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                    />
                                    :
                                    <PDFViewer fileId={viewId} />
                            }
                        </>

                        :
                        <></>
                }

            </Dialog>

            {/* Loader Start */}
            {
                pageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    )
}