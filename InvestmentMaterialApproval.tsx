import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Badge } from 'primereact/badge';
import { BreadCrumb } from 'primereact/breadcrumb';

import moment from "moment/moment";

// Column
import { InvestmentMaterialApprovalColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
    investmentMaterialApprovalStatus,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { Avatar } from 'primereact/avatar';

export const InvestmentMaterialApproval = () => {
    document.title = "Investment Material Approvals | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investment Material</span>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investment Material Approvals</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    // Date Object
    let today = new Date();
    const [dates, setDates] = useState<string | Date | Date[] | any | null>([new Date(today.setDate(today.getDate() - 31)), new Date()]);

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);

    // Page service
    const pageService = new PageService();

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [status, setStatus] = useState<any>({ name: 'Pending', code: 0 });
    const [approvalsList, setApprovalsList] = useState<any>([]);
    const [statusChangePageLoad, setStatusChangePageLoad] = useState(false);
    const [investorList, setInvestorList] = useState<any>([]);
    const [selectedInvestor, setSelectedInvestor] = useState<any>({ name: "All", code: "All" });
    const [brokerList, setBrokerList] = useState<any>([]);
    const [selectedBroker, setSelectedBroker] = useState<any>({ name: "All", code: "All" });

    // use effect method
    useEffect(() => {
        getApprovalsDataFromAPI();
        getBrokerInvtFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dates, status, selectedBroker, selectedInvestor]);

    // Get job companies from dropdown
    const getBrokerInvtFromAPI = () => {
        // Api call
        pageService
            .getBrokerInvestorListDropdown()
            .then((response) => {
                // Get response
                if (response) {
                    let tempInvtArr = [{ name: "All", code: "All" }];
                    response["investor_list"].map((item: any, index: number) => {
                        tempInvtArr.push(item);
                    });

                    let tempBrokerArr = [{ name: "All", code: "All" }];
                    response["broker_list"].map((item: any, index: number) => {
                        tempBrokerArr.push(item);
                    });

                    setInvestorList(tempInvtArr);
                    setBrokerList(tempBrokerArr);
                } else {
                    setInvestorList([]);
                    setBrokerList([]);
                }
            });
    };

    // Get Approvals Data from API
    const getApprovalsDataFromAPI = async () => {

        // Api call
        pageService
            .getAllInvestmentApprovalMaterial(status.code, selectedBroker.code, selectedInvestor.code)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setApprovalsList([]);
                    } else {
                        setApprovalsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setApprovalsList([]);
                }
            });
    };

    // On Date Change
    const onDateChange = (e: any) => {
        setDates(e.value);
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
                    value={selectedBroker}
                    onChange={(e) => setSelectedBroker(e.value)}
                    options={brokerList}
                    optionLabel="name"
                ></Dropdown>
                <Dropdown
                    value={selectedInvestor}
                    onChange={(e) => setSelectedInvestor(e.value)}
                    options={investorList}
                    optionLabel="name"
                ></Dropdown>
                <Dropdown
                    value={status}
                    onChange={(e) => setStatus(e.value)}
                    options={investmentMaterialApprovalStatus}
                    optionLabel="name"
                ></Dropdown>

                {/* <div style={{ marginLeft: '15px' }}></div>
                <Calendar
                    value={dates}
                    dateFormat="dd/mm/yy"
                    onChange={(e) => onDateChange(e)}
                    selectionMode="range"
                    showIcon
                /> */}
            </>
        );
    };


    // Column templates
    const dateFormatCreatedAtTemplate = (rowData: any, rowIndex: any) => {

        return (
            <>
                {rowData.created_at === rowData[rowIndex.field] && rowData.created_at !== null ? moment.utc(rowData.created_at).format('MMM DD, YYYY') : '-'}
            </>
        );
    };

    const statusTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData.status == 1 ? <Badge value="Approved" severity="success"></Badge> : <Badge value="Pending" severity="warning"></Badge>}
            </>
        )
    };

    // for column action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                <InputSwitch className="mr-2" checked={rowData?.status == 1 || rowData?.status == 2 ? true : false} onChange={(e) => onApprovalStatusChange(e.value, rowData?.id)} disabled={rowData?.status == 1 || rowData.status == 2 ? true : false} />
                <Button
                    icon="pi pi-times"
                    className="p-button-square p-button-outlined mr-3"
                    onClick={() => onApprovalStatusChange("Rejected", rowData.id)}
                    tooltip="Reject Request" tooltipOptions={{ position: 'top' }}
                    disabled={rowData.status == 1 || rowData.status == 2 ? true : false}
                />
                <Button
                    icon="pi pi-eye"
                    className="p-button-square p-btn-default"
                    onClick={() => window.open(rowData?.material_url, "_blank")}
                />
            </div>
        );
    };

    // Full name template

    const brokerNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <span className="tb-avatar-box">
                    {rowData?.profile_img != null && rowData?.profile_img != "null" && rowData?.profile_img != "" ?
                        <Avatar className="tb-avatar-img" image={rowData?.profile_img} shape="circle" /> : <Avatar className='tb-avatar-img user-list-avatar' label={rowData?.broker_name.charAt(0).toUpperCase()} shape="circle" />}<div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.broker_name}</div></div>
                </span>
            </>
        )
    }

    // on approval status change
    const onApprovalStatusChange = (val: any, id: any) => {
        try {
            setStatusChangePageLoad(true);
            // request data
            let formData = new FormData();
            formData.append('id', id);
            formData.append('status', val);

            // call api
            pageService.approveInvestmentMaterialAccess(formData).then((response) => {
                // Get response
                if (response) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    setTimeout(() => {
                        setStatusChangePageLoad(false);
                        getApprovalsDataFromAPI();
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

    // Reject Approval Request
    const rejectApprovalRequest = () => {

    };

    // page template
    return (
        <>
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Investment Material Approvals</div>
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
                                        value={approvalsList}
                                        paginator={approvalsList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Data Found"
                                    >
                                        {InvestmentMaterialApprovalColumns.map((col, i) => {
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
                                                    />
                                                );
                                            } else if (col.field === 'broker_name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={brokerNameTemplate}
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
                                        {InvestmentMaterialApprovalColumns.map((col, i) => (
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
            {/* Loader Start */}
            {
                statusChangePageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    );
};
