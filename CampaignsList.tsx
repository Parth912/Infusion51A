import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

//Prime React Component Inbuilt
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';

// Column
import { CampaignsColumns } from '../../../appconfig/DatatableSetting';

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
import { Avatar } from 'primereact/avatar';

export const CampaignsList = () => {
    document.title = "Campaigns | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Campaigns</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const hasFetchedData = useRef(false);

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [campaignsList, setCampaignsList] = useState<any>([]);

    // Page service
    const pageService = new PageService();

    // useEffect
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getInstantlyCampaignsFromAPI();
    }, []);

    // Get instantly campaigns
    const getInstantlyCampaignsFromAPI = () => {
        // Api call
        pageService
            .getInstantlyCampaigns()
            .then((response) => {
                // Get response
                if (response) {
                    setCampaignsList(response);
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
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

    // Status body template
    const statusBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {/* <Badge value="Pending" severity="warning"></Badge> */}
            </>
        );
    };

    // Name body template
    const nameBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/campaign-details" state={{ campaign_id: rowData.id }}>
                    {<Avatar className='tb-avatar-img user-list-avatar' label={rowData?.name.charAt(0).toUpperCase()} shape="circle" />}
                    <div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.name}</div></div>
                </Link>
            </>
        );
    };

    return (
        <>
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"> Email Campaigns</div>
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
                                        value={campaignsList}
                                        paginator={campaignsList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Campaigns Found"
                                    >
                                        {CampaignsColumns.map((col, i) => {
                                            if (col.field === 'name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={nameBodyTemplate}
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
                                            } else if (col.field === 'status') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={statusBodyTemplate}
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
                            )
                                :
                                (
                                    <>
                                        {/* Skeleton Data table */}
                                        <DataTable value={Skeletonitems}>
                                            {CampaignsColumns.map((col, i) => (
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
        </>
    );
}