import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';
import { TabMenu } from 'primereact/tabmenu';
import { Calendar } from 'primereact/calendar';
import { Toolbar } from 'primereact/toolbar';
import { InputSwitch } from 'primereact/inputswitch';

import moment from "moment/moment";

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { SkeletonbodyTemplate, Skeletonitems } from '../../../appconfig/Settings';
import { InvestmentMaterialSelectionBrokerColumns, InvestmentMaterialSelectionAdminColumns, LoginAnalysisColumns, InvtMaterialOpenTimeBrokerColumns, InvtMaterialOpenTimeAdminColumns, InvestmentMaterialFolderColumns } from '../../../appconfig/DatatableSetting';
import PDFViewer from '../../../components/PDFViewer';
import { Link } from 'react-router-dom';

export const CurrentInvestorDetails = () => {
    document.title = "Investor Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/investors">Current Investors</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investor Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' };

    const tabitems = [
        { label: 'Overview' },
        { label: 'Address Information' },
        { label: 'Social Media' },
    ];

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
    const [currentTab, setCurrentTab] = useState<any>({ index: 0, value: "Overview" });
    const [editingFieldName, setEditingFieldName] = useState<any>("");
    const [editingFieldValue, setEditingFieldValue] = useState<any>("");

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setInvestorId(state);
            getInvestorDetailsFromAPI(state);
            // getUserAllNotificationsFromAPI(state);
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
                    if (responseData?.user_type == "currentinvestor") {
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

    // On change tab
    const changeCurrentTab = (tab: any) => {
        setCurrentTab({ index: tab?.index, value: tab?.value?.label });
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

        // api call for upload brochure
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

    // Template for access
    const accessTemplate = (rowData: any) => {
        let isAlreadySelected = selectedInvestmentFiles.filter((file: any) => file.file_id === rowData.id);
        let isSelected = false;
        if (isAlreadySelected.length > 0) {
            isSelected = true;
        }

        return (
            <>
                <InputSwitch className="mr-2" checked={isSelected} onChange={(e) => onSelectMaterial(e.value, rowData)} tooltip={isSelected ? 'Revoke Access' : 'Give Access'} />
            </>
        );
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

    // On editing field
    const onEditingField = (name: any, val: any) => {
        setEditingFieldName(name);
        setEditingFieldValue(val);
    };

    // On close editing field
    const onCloseEditingField = () => {
        setEditingFieldName("");
        setEditingFieldName("");
    };

    // On save editing field
    const onSaveEditingField = (name: any) => {
        try {
            setPageLoad(true);
            let formData = new FormData();
            formData.append("user_id", investorId.investor_id);
            if(name === "Birthdate"){
                const formattedDate = moment(editingFieldValue).format('YYYY-MM-DD');
                formData.append(name, formattedDate);
            }else{
                formData.append(name, editingFieldValue);
            }

            // call api
            pageService.addUserExtraDetails(formData).then((response) => {
                // Get response
                if (response) {
                    setPageLoad(false);
                    setEditingFieldName("");
                    setEditingFieldValue("");
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getInvestorDetailsFromAPI({ investor_id: investorId.investor_id });
                } else {
                    setPageLoad(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            });
        } catch (error: any) {
            setPageLoad(false);
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
                    <div className="userprofile-menu">
                        <div className="userprofile-menulist">
                            <TabMenu model={tabitems} activeIndex={currentTab?.index} onTabChange={(e) => changeCurrentTab(e)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid">
                <div className="col-8">
                    {currentTab?.value === "Overview" ? <div className="tab-panel">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title-box">
                                    <h3 className="card-title mb-2">General Information</h3>
                                    <p style={{ color: "gray", fontSize: "12px" }}>Double click on the text to edit it.</p>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="userprofile-ullist">
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Birthdate</div>
                                        {
                                            editingFieldName === "Birthdate" ?
                                                <>
                                                    <Calendar
                                                        className="p-inputtext-sm"
                                                        placeholder='Select Birth Date'
                                                        value={editingFieldValue}
                                                        onChange={(e) => setEditingFieldValue(e.value)}
                                                        dateFormat="yy-mm-dd"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Birthdate")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Birthdate", investorData?.extra_details?.Birthdate)}>{!window.cn(investorData?.extra_details?.Birthdate) && investorData?.extra_details?.Birthdate !== null && investorData?.extra_details?.Birthdate !== undefined ? investorData?.extra_details?.Birthdate : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Title</div>
                                        {
                                            editingFieldName === "Title" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Title"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Title")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Title", investorData?.extra_details?.Title)}>{!window.cn(investorData?.extra_details?.Title) && investorData?.extra_details?.Title !== null && investorData?.extra_details?.Title !== undefined ? investorData?.extra_details?.Title : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Company</div>
                                        {
                                            editingFieldName === "Company" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Company"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Company")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Company", investorData?.extra_details?.Company)}>{!window.cn(investorData?.extra_details?.Company) && investorData?.extra_details?.Company !== null && investorData?.extra_details?.Company !== undefined ? investorData?.extra_details?.Company : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Secondary Email</div>
                                        {
                                            editingFieldName === "Secondary_Email" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Secondary Email"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Secondary_Email")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Secondary_Email", investorData?.extra_details?.Secondary_Email)}> {!window.cn(investorData?.extra_details?.Secondary_Email) && investorData?.extra_details?.Secondary_Email !== null && investorData?.extra_details?.Secondary_Email !== undefined ? investorData?.extra_details?.Secondary_Email : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Email (Work)</div>
                                        {
                                            editingFieldName === "Email_Work" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Work Email"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Email_Work")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Email_Work", investorData?.extra_details?.Email_Work)}> {!window.cn(investorData?.extra_details?.Email_Work) && investorData?.extra_details?.Email_Work !== null && investorData?.extra_details?.Email_Work !== undefined ? investorData?.extra_details?.Email_Work : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Direct Phone Number</div>
                                        {
                                            editingFieldName === "Phone_Home" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Home Phone"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Phone_Home")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Phone_Home", investorData?.extra_details?.Phone_Home)}> {!window.cn(investorData?.extra_details?.Phone_Home) && investorData?.extra_details?.Phone_Home !== null && investorData?.extra_details?.Phone_Home !== undefined ? investorData?.extra_details?.Phone_Home : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Work Phone Number</div>
                                        {
                                            editingFieldName === "Phone_Work" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Work Phone"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Phone_Work")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Phone_Work", investorData?.extra_details?.Phone_Work)}> {!window.cn(investorData?.extra_details?.Phone_Work) && investorData?.extra_details?.Phone_Work !== null && investorData?.extra_details?.Phone_Work !== undefined ? investorData?.extra_details?.Phone_Work : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Salary</div>
                                        {
                                            editingFieldName === "Salary" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Salary"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Salary")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Salary", investorData?.extra_details?.Salary)}> {!window.cn(investorData?.extra_details?.Salary) && investorData?.extra_details?.Salary !== null && investorData?.extra_details?.Salary !== undefined ? "$" + investorData?.extra_details?.Salary : "-"} </div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Industry</div>
                                        {
                                            editingFieldName === "Industry" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Industry"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Industry")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Industry", investorData?.extra_details?.Industry)}> {!window.cn(investorData?.extra_details?.Industry) && investorData?.extra_details?.Industry !== null && investorData?.extra_details?.Industry !== undefined ? investorData?.extra_details?.Industry : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Annual Revenue</div>
                                        {
                                            editingFieldName === "Annual_Revenue" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Annual Revenue"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Annual_Revenue")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Annual_Revenue", investorData?.extra_details?.Annual_Revenue)}> {!window.cn(investorData?.extra_details?.Annual_Revenue) && investorData?.extra_details?.Annual_Revenue !== null && investorData?.extra_details?.Annual_Revenue !== undefined ? "$" + investorData?.extra_details?.Annual_Revenue : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Number of Employee</div>
                                        {
                                            editingFieldName === "No_of_Employees" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter No of Employees"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("No_of_Employees")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("No_of_Employees", investorData?.extra_details?.No_of_Employees)}> {!window.cn(investorData?.extra_details?.No_of_Employees) && investorData?.extra_details?.No_of_Employees !== null && investorData?.extra_details?.No_of_Employees !== undefined ? investorData?.extra_details?.No_of_Employees : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Website</div>
                                        {
                                            editingFieldName === "Website" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Website Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Website")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Website", investorData?.extra_details?.Website)}> {!window.cn(investorData?.extra_details?.Website) && investorData?.extra_details?.Website !== null && investorData?.extra_details?.Website !== undefined ? <>{investorData?.extra_details?.Website} <a className="ml-2" href={investorData?.extra_details?.Website} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : currentTab?.value === "Address Information" ? <div className="tab-panel">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title-box">
                                    <h3 className="card-title mb-2">Company Address</h3>
                                    <p style={{ color: "gray", fontSize: "12px" }}>Double click on the text to edit it.</p>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="userprofile-ullist">
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Address 1</div>
                                        {
                                            editingFieldName === "Address" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Address"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Address")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Address", investorData?.extra_details?.Address)}> {!window.cn(investorData?.extra_details?.Address) && investorData?.extra_details?.Address !== null && investorData?.extra_details?.Address !== undefined ? investorData?.extra_details?.Address : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Address 2</div>
                                        {
                                            editingFieldName === "Address_2" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Address Line 2"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Address_2")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Address_2", investorData?.extra_details?.Address_2)}> {!window.cn(investorData?.extra_details?.Address_2) && investorData?.extra_details?.Address_2 !== null && investorData?.extra_details?.Address_2 !== undefined ? investorData?.extra_details?.Address_2 : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Country</div>
                                        {
                                            editingFieldName === "Country" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Country"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Country")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Country", investorData?.extra_details?.Country)}> {!window.cn(investorData?.extra_details?.Country) && investorData?.extra_details?.Country !== null && investorData?.extra_details?.Country !== undefined ? investorData?.extra_details?.Country : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">State</div>
                                        {
                                            editingFieldName === "State" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter State"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("State")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("State", investorData?.extra_details?.State)}> {!window.cn(investorData?.extra_details?.State) && investorData?.extra_details?.State !== null && investorData?.extra_details?.State !== undefined ? investorData?.extra_details?.State : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">City</div>
                                        {
                                            editingFieldName === "City" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter City"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("City")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("City", investorData?.extra_details?.City)}> {!window.cn(investorData?.extra_details?.City) && investorData?.extra_details?.City !== null && investorData?.extra_details?.City !== undefined ? investorData?.extra_details?.City : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Zip Code</div>
                                        {
                                            editingFieldName === "Zip_Code" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Zip Code"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Zip_Code")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Zip_Code", investorData?.extra_details?.Zip_Code)}> {!window.cn(investorData?.extra_details?.Zip_Code) && investorData?.extra_details?.Zip_Code !== null && investorData?.extra_details?.Zip_Code !== undefined ? investorData?.extra_details?.Zip_Code : "-"}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title-box">
                                    <h3 className="card-title mb-2">Personal Address</h3>
                                    <p style={{ color: "gray", fontSize: "12px" }}>Double click on the text to edit it.</p>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="userprofile-ullist">
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Address 1</div>
                                        {
                                            editingFieldName === "Address_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Personal Address"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Address_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Address_Personal", investorData?.extra_details?.Address_Personal)}> {!window.cn(investorData?.extra_details?.Address_Personal) && investorData?.extra_details?.Address_Personal !== null && investorData?.extra_details?.Address_Personal !== undefined ? investorData?.extra_details?.Address_Personal : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Address 2</div>
                                        {
                                            editingFieldName === "Address_2_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Personal Address Line 2"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Address_2_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Address_2_Personal", investorData?.extra_details?.Address_2_Personal)}> {!window.cn(investorData?.extra_details?.Address_2_Personal) && investorData?.extra_details?.Address_2_Personal !== null && investorData?.extra_details?.Address_2_Personal !== undefined ? investorData?.extra_details?.Address_2_Personal : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Country</div>
                                        {
                                            editingFieldName === "Country_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Country"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Country_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Country_Personal", investorData?.extra_details?.Country_Personal)}> {!window.cn(investorData?.extra_details?.Country_Personal) && investorData?.extra_details?.Country_Personal !== null && investorData?.extra_details?.Country_Personal !== undefined ? investorData?.extra_details?.Country_Personal : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">State</div>
                                        {
                                            editingFieldName === "State_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter State"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("State_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("State_Personal", investorData?.extra_details?.State_Personal)}> {!window.cn(investorData?.extra_details?.State_Personal) && investorData?.extra_details?.State_Personal !== null && investorData?.extra_details?.State_Personal !== undefined ? investorData?.extra_details?.State_Personal : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">City</div>
                                        {
                                            editingFieldName === "City_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter City"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("City_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("City_Personal", investorData?.extra_details?.City_Personal)}> {!window.cn(investorData?.extra_details?.City_Personal) && investorData?.extra_details?.City_Personal !== null && investorData?.extra_details?.City_Personal !== undefined ? investorData?.extra_details?.City_Personal : "-"}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Zip Code</div>
                                        {
                                            editingFieldName === "Zip_Code_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Zip Code"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Zip_Code_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Zip_Code_Personal", investorData?.extra_details?.Zip_Code_Personal)}> {!window.cn(investorData?.extra_details?.Zip_Code_Personal) && investorData?.extra_details?.Zip_Code_Personal !== null && investorData?.extra_details?.Zip_Code_Personal !== undefined ? investorData?.extra_details?.Zip_Code_Personal : "-"}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : currentTab?.value === "Social Media" ? <div className="tab-panel">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title-box">
                                    <h3 className="card-title">Company Social Media</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="userprofile-ullist">
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Facebook</div>
                                        {
                                            editingFieldName === "Facebook" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Facebook Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Facebook")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Facebook", investorData?.extra_details?.Facebook)}> {!window.cn(investorData?.extra_details?.Facebook) && investorData?.extra_details?.Facebook !== null && investorData?.extra_details?.Facebook !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Facebook} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Instagram</div>
                                        {
                                            editingFieldName === "Instagram" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Instagram Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Instagram")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Instagram", investorData?.extra_details?.Instagram)}> {!window.cn(investorData?.extra_details?.Instagram) && investorData?.extra_details?.Instagram !== null && investorData?.extra_details?.Instagram !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Instagram} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Linked In</div>
                                        {
                                            editingFieldName === "LinkedIn" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter LinkedIn Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("LinkedIn")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("LinkedIn", investorData?.extra_details?.LinkedIn)}>  {!window.cn(investorData?.extra_details?.LinkedIn) && investorData?.extra_details?.LinkedIn !== null && investorData?.extra_details?.LinkedIn !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.LinkedIn} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Tik Tok</div>
                                        {
                                            editingFieldName === "Tik_Tok" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Tik_Tok Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Tik_Tok")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Tik_Tok", investorData?.extra_details?.Tik_Tok)}>  {!window.cn(investorData?.extra_details?.Tik_Tok) && investorData?.extra_details?.Tik_Tok !== null && investorData?.extra_details?.Tik_Tok !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Tik_Tok} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Twitter</div>
                                        {
                                            editingFieldName === "Twitter_URL" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Twitter Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Twitter_URL")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Twitter_URL", investorData?.extra_details?.Twitter_URL)}>  {!window.cn(investorData?.extra_details?.Twitter_URL) && investorData?.extra_details?.Twitter_URL !== null && investorData?.extra_details?.Twitter_URL !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Twitter_URL} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title-box">
                                    <h3 className="card-title">Personal Social Media</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="userprofile-ullist">
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Facebook</div>
                                        {
                                            editingFieldName === "Facebook_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Facebook Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Facebook_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Facebook_Personal", investorData?.extra_details?.Facebook_Personal)}>  {!window.cn(investorData?.extra_details?.Facebook_Personal) && investorData?.extra_details?.Facebook_Personal !== null && investorData?.extra_details?.Facebook_Personal !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Facebook_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Instagram</div>
                                        {
                                            editingFieldName === "Instagram_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Instagram Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Instagram_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Instagram_Personal", investorData?.extra_details?.Instagram_Personal)}>  {!window.cn(investorData?.extra_details?.Instagram_Personal) && investorData?.extra_details?.Instagram_Personal !== null && investorData?.extra_details?.Instagram_Personal !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Instagram_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Linked In</div>
                                        {
                                            editingFieldName === "LinkedIn_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Linked In Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("LinkedIn_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("LinkedIn_Personal", investorData?.extra_details?.LinkedIn_Personal)}>  {!window.cn(investorData?.extra_details?.LinkedIn_Personal) && investorData?.extra_details?.LinkedIn_Personal !== null && investorData?.extra_details?.LinkedIn_Personal !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.LinkedIn_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Tik Tok</div>
                                        {
                                            editingFieldName === "Tik_Tok_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Tik Tok Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Tik_Tok_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Tik_Tok_Personal", investorData?.extra_details?.Tik_Tok_Personal)}>  {!window.cn(investorData?.extra_details?.Tik_Tok_Personal) && investorData?.extra_details?.Tik_Tok_Personal !== null && investorData?.extra_details?.Tik_Tok_Personal !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Tik_Tok_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                    <div className="userprofile-list">
                                        <div className="userprofile-label">Twitter</div>
                                        {
                                            editingFieldName === "Twitter_Personal" ?
                                                <>
                                                    <InputText
                                                        value={editingFieldValue}
                                                        name="name"
                                                        autoComplete="off"
                                                        placeholder="Enter Twitter Link"
                                                        onChange={(e) => setEditingFieldValue(e.target.value)}
                                                        className="p-inputtext-sm"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                        onClick={() => onCloseEditingField()}
                                                        icon="pi pi-times"
                                                    />
                                                    <Button
                                                        className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                        onClick={() => onSaveEditingField("Twitter_Personal")}
                                                        icon="pi pi-check"
                                                    />
                                                </>
                                                :
                                                <div className="userprofile-value" onDoubleClick={() => onEditingField("Twitter_Personal", investorData?.extra_details?.Twitter_Personal)}>  {!window.cn(investorData?.extra_details?.Twitter_Personal) && investorData?.extra_details?.Twitter_Personal !== null && investorData?.extra_details?.Twitter_Personal !== undefined ? <>View <a className="ml-2" href={investorData?.extra_details?.Twitter_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : ""}
                </div>
            </div>

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