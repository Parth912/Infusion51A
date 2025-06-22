import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';

import moment from 'moment';

// Column
import { SMSCampaignsColumns } from '../../../appconfig/DatatableSetting';

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
import { addCampaignStartDateTimeValidate } from '../../../config/Validate';
import { Link } from 'react-router-dom';

export const SMSCampaignList = () => {
    document.title = "SMS Campaigns | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">SMS Campaign</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [campaigns, setCampaigns] = useState<any>([]);
    const [startModal, setStartModal] = useState<boolean>(false);
    const [startLoader, setStartLoader] = useState<boolean>(false);
    const [editId, setEditId] = useState<any>(null);
    const [startDateTime, setStartDateTime] = useState<any>("");
    const [errors, setErrors] = useState<any>({});
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const [deleteLoader, setDeleteLoader] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<any>(null);
    const [A2PErrorData, setA2PErrorData] = useState<any>([]);
    const [A2PErrorModal, setA2PErrorModal] = useState<boolean>(false);

    // Page service
    const pageService = new PageService();

    // use effect method
    useEffect(() => {
        getSMSCampaignsDataFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Get SMS Camapaigns
    const getSMSCampaignsDataFromAPI = async () => {
        // Api call
        pageService
            .getSMSCampaigns()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setCampaigns([]);
                    } else {
                        setCampaigns(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setCampaigns([]);
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

    // On open start modal
    const onOpenStartModal = (id: any) => {
        setStartModal(true);
        setEditId(id);
    };

    // On close start modal
    const onCloseStartModal = () => {
        setStartModal(false);
        setStartLoader(false);
        setStartDateTime("");
        setEditId(null);
        setErrors({});
    };

    // On open delete modal
    const onOpenDeleteModal = (id: any) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    // On close delete modal
    const onCloseDeleteModal = () => {
        setDeleteModal(false);
        setDeleteLoader(false);
        setDeleteId(null);
    };

    // Template for action body
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                <div className="flex flex-wrap gap-2">
                    {/* <Button
                        type="button"
                        icon="pi pi-clock"
                        className='p-button-secondary p-button-square'
                        tooltip='Set Start Date & Time'
                        onClick={() => onOpenStartModal(rowData?.id)}
                        disabled={rowData?.a2p_status === "VERIFIED" ? false : true }
                    /> */}
                    <Button
                        type="button"
                        icon="pi pi-pencil"
                        className='p-button-secondary p-button-square'
                        tooltip='Edit'
                        onClick={() => navigate('/add-update-campaign', { state: { campaign_id: rowData.id } })}
                    />
                    <Button
                        type="button"
                        icon="pi pi-trash"
                        className='p-button-secondary p-button-square'
                        tooltip='Delete'
                        onClick={() => onOpenDeleteModal(rowData.id)}
                    />
                </div>
            </>
        );
    };

    // Template for campaign name
    const campaignNameBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link to="/sms-campaign-details" state={{ campaign_id: rowData.id, a2p_status: rowData?.a2p_status }} style={{color: "black"}}>
                    {rowData?.campaign_name}
                </Link>
            </>
        );
    };

    // Template for a2p_status body template
    const a2pStatusBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.a2p_status === "PENDING" ? <Badge value="PENDING" severity="warning" /> : rowData?.a2p_status === "IN_PROGRESS" ? <Badge value="IN_PROGRESS" severity="info" /> : rowData?.a2p_status === "FAILED" ? <><Badge value="FAILED" severity="danger" />&nbsp;
                {
                    rowData?.a2p_errors !== undefined && rowData?.a2p_errors.length > 0 ?
                        <>
                            <Tooltip target=".a2p-errors" />
                            <a className='a2p-errors' data-pr-tooltip="A2P Registration Issue" onClick={() => onOpenA2PErrorModal(rowData?.a2p_errors)} style={{ cursor: "pointer" }}>
                                <i className="pi pi-exclamation-circle" style={{ color: 'red' }}></i>
                            </a>
                        </>
                        :
                        <></>
                }</> : <Badge value="VERIFIED" severity="success" />}
            </>
        );
    };

    // On open a2p error modal
    const onOpenA2PErrorModal = (errorData: any) => {
        setA2PErrorData(errorData);
        setA2PErrorModal(true);
    };

    // On close a2p error modal
    const onCloseA2PErrorModal = () => {
        setA2PErrorData([]);
        setA2PErrorModal(false);
    };

    // On click of add campaign start date time
    const addCampaignStartDateTime = () => {
        const { errors, isError } = addCampaignStartDateTimeValidate(startDateTime);
        setErrors(errors);
        if (!isError) {
            setStartLoader(true);

            let formData = new FormData();

            formData.append('id', editId);
            // Convert date format
            const formattedDate = moment(startDateTime).format('MM/DD/YY hh:mm A');
            formData.append('start_datetime', formattedDate);

            // call api
            pageService.addUpdateSMSCampaign(formData).then((response) => {
                // Get response
                if (response) {
                    setStartLoader(false);
                    setStartDateTime("");
                    setEditId(null);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    setTimeout(() => {
                        getSMSCampaignsDataFromAPI();
                    }, 1000);
                } else {
                    setStartLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setStartLoader(false);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    // Delete SMS Campaign API Call
    const deleteSMSCampaignAPICall = () => {
        setDeleteLoader(true);

        // call api
        pageService.deleteSMSCampaign(deleteId).then((response) => {
            // Get response
            if (response) {
                setDeleteLoader(false);
                setDeleteModal(false);
                setDeleteId(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                getSMSCampaignsDataFromAPI();
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
                        <div className="page-title">SMS Campaigns</div>
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
                        <Button className="p-button mr-2" label="Add New Campaign" onClick={() => navigate('/add-update-campaign')} />
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
                                            value={campaigns}
                                            paginator={campaigns.length > 0 && true}
                                            globalFilter={globalFilter}
                                            rows={defaultRowOptions}
                                            rowsPerPageOptions={defaultPageRowOptions}
                                            paginatorTemplate={paginatorLinks}
                                            currentPageReportTemplate={showingEntries}
                                            emptyMessage="No Campaigns Found"
                                        >
                                            {SMSCampaignsColumns.map((col, i) => {
                                                if (col.field === 'action') {
                                                    return (
                                                        <Column
                                                            key={col.field}
                                                            field={col.field}
                                                            header={col.header}
                                                            body={actionBodyTemplate}
                                                        />
                                                    );
                                                } else if (col.field === 'campaign_name') {
                                                    return (
                                                        <Column
                                                            key={col.field}
                                                            field={col.field}
                                                            header={col.header}
                                                            body={campaignNameBodyTemplate}
                                                            sortable
                                                        />
                                                    );
                                                } else if (col.field === 'a2p_status') {
                                                    return (
                                                        <Column
                                                            key={col.field}
                                                            field={col.field}
                                                            header={col.header}
                                                            body={a2pStatusBodyTemplate}
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
                                                        />
                                                    );
                                                }
                                            })}
                                        </DataTable>
                                    </>
                                )
                            : (
                                <>
                                    {/* Skeleton Data table */}
                                    <DataTable value={Skeletonitems}>
                                        {SMSCampaignsColumns.map((col, i) => (
                                            <Column
                                                key={col.field}
                                                field={col.field}
                                                header={col.header}
                                                body={SkeletonbodyTemplate}
                                            />
                                        ))}
                                    </DataTable>
                                </>
                            ) }
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Campaign Start Date & Time Modal */}
            <Dialog
                visible={startModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Add Campaign Start Date & Time"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={onCloseStartModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addCampaignStartDateTime()}
                            loading={startLoader}
                        />
                    </>
                }
                onHide={onCloseStartModal}
            >
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="name">Select Date & Time <span style={{ color: "red" }}>*</span></label>
                        <Calendar
                            id="calendar-12h"
                            value={startDateTime}
                            onChange={(e) => setStartDateTime(e.target.value)}
                            showIcon
                            showTime
                            hourFormat="12"
                            minDate={new Date()}
                            className={errors['start_datetime'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['start_datetime']}</small>
                    </div>
                </div>
            </Dialog>

            {/* Delete Campaign Modal */}
            <Dialog
                visible={deleteModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Delete Campaign"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={onCloseDeleteModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => deleteSMSCampaignAPICall()}
                            loading={deleteLoader}
                        />
                    </>
                }
                onHide={onCloseDeleteModal}
            >
                <div className="formgrid grid">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: If you delete this campaign then if the campaign is running then it will stop sending sms and it will be removed from the twilio.
                    </span>
                </div>
            </Dialog>

            {/* A2P Error Modal */}
            <Dialog
                visible={A2PErrorModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="A2P Registration Issue"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={onCloseA2PErrorModal}
                        />
                    </>
                }
                onHide={onCloseA2PErrorModal}
            >
                <div className="formgrid grid">
                    {
                        A2PErrorData.map((item: any, index: any) => {
                            return(
                                <>
                                    <p><b>Issue Field: </b>{item.fields.toString(",")}</p>
                                    <p><b>Description: </b>{item.description}</p>
                                    <u><b><a href={item.url} target='_blank'>View Doc</a></b></u>
                                </>
                            )
                        })
                    }
                </div>
            </Dialog>
        </>
    )
}