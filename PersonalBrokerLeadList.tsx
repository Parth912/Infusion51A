import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';

// Column
import { LeadsListColumns } from '../../../appconfig/DatatableSetting';

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

export const PersonalBrokerLeadList = () => {
    document.title = "Personal Leads List  | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Personal Leads List</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    // Date Object
    let today = new Date();
    const [dates, setDates] = useState<string | Date | Date[] | any | null>([new Date(today.setDate(today.getDate() - 31)), new Date()]);

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    // Page service
    const pageService = new PageService();

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [leads, setLeads] = useState<any>({});

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getLeadsFromAPI();
    }, []);

    // Get leads from api
    const getLeadsFromAPI = () => {
        // Api call
        pageService
            .getPersonalLeads()
            .then((response) => {
                // Get response 
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setLeads([]);
                    } else {
                        setLeads(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setLeads([]);
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

    // right part of toolbar
    const rightToolbarTemplate = () => {
        return (
            <>
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

    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <div className="tb-actions">
            <>
                <Button
                    icon="pi pi-eye"
                    className="p-button-square p-btn-default"
                    onClick={() => { }}
                />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    onClick={() => { }}
                />
            </>
            </div>
        );
    };

    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>{rowData?.First_Name} {rowData?.Last_Name}</>
        );
    };

    return (
        <>
        <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Lead Generators</div>
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
                        <Button label="Kanban View" className="p-button" onClick={() => navigate('/kanban-view-leads')}/>
                        <Button label="New Lead" className="p-button" onClick={() => navigate('/add-update-leads')}/>
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
                                    value={leads}
                                    paginator={leads.length > 0 && true}
                                    globalFilter={globalFilter}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage="No Leads Found"
                                >
                                    {LeadsListColumns.map((col, i) => {
                                        if (col.field === 'full_name') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={fullNameTemplate}
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
                                    {LeadsListColumns.map((col, i) => (
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
};