import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Badge } from 'primereact/badge';

import moment from 'moment';

// Column
import { SMSCampaignMessageRecipientsColumn, SMSCampaignsColumns } from '../../../appconfig/DatatableSetting';

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

export const SMSCampaignMessageRecipients = () => {
    document.title = "Message Recipients | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Message Recipients</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();
    const hasFetchedData = useRef(false);

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);

    // Page service
    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState(false);
    const [messageId, setMessageId] = useState<any>({});
    const [messageRecipients, setMessageRecipients] = useState<any>([]);

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setMessageId(state);
            getMessageRecipientsFromAPI(state);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Get message recipients api call
    const getMessageRecipientsFromAPI = (state: any) => {
        // Api call
        pageService
            .getMessageRecipient(state.message_id)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setMessageRecipients([]);
                    } else {
                        setMessageRecipients(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setMessageRecipients([]);
                }
            });
    };

    // Template for full name
    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.recipient_details?.first_name !== undefined ? rowData?.recipient_details?.first_name + " " + rowData?.recipient_details?.last_name : JSON.parse(rowData?.extra_people_detail)["first_name"] + " " + JSON.parse(rowData?.extra_people_detail)["last_name"]}
            </>
        );
    };

    // Template for full name
    const statusTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                {rowData?.status === "Pending" || rowData?.status === "queued" ? <Badge severity='warning' value={rowData?.status}></Badge> : rowData?.status === "delivered" ? <Badge severity='success' value="Delivered"></Badge> : <Badge severity='info' value={rowData?.status}></Badge>}
            </>
        )
    };

    return (
        <>
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate("/sms-campaign-details", { state: { campaign_id: messageId.campaign_id, a2p_status: messageId.a2p_status } })} /> Message Recipients</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                        </div>
                    </div>
                </div>
            </div>

            <div className='card'>
                {pageLoad ? (
                    <>
                        <DataTable
                            className="datatable-responsive"
                            value={messageRecipients}
                            paginator={messageRecipients.length > 0 && true}
                            rows={defaultRowOptions}
                            rowsPerPageOptions={defaultPageRowOptions}
                            paginatorTemplate={paginatorLinks}
                            currentPageReportTemplate={showingEntries}
                            emptyMessage={"No Recipients Found"}
                        >
                            {SMSCampaignMessageRecipientsColumn.map((col, i) => {
                                if (col.field === 'full_name') {
                                    return (
                                        <Column
                                            key={col.field}
                                            field={col.field}
                                            header={col.header}
                                            body={fullNameTemplate}
                                        />
                                    );
                                } else if (col.field === 'status') {
                                    return (
                                        <Column
                                            key={col.field}
                                            field={col.field}
                                            header={col.header}
                                            body={statusTemplate}
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
                                        />
                                    );
                                }
                            })}
                        </DataTable>
                    </>
                ) : (
                    <>
                        <DataTable value={Skeletonitems}
                            className="datatable-responsive" stripedRows
                        >
                            {SMSCampaignMessageRecipientsColumn.map((col, i) => (
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
        </>
    )
};