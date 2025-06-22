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
import { Accordion, AccordionTab } from 'primereact/accordion';

// Column
import { LeadsListColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    ceEngagementStatusDropDown,
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';

export const LeadsList = () => {
    document.title = "Opportunities | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Leads</span>
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
    const [selectedLeadGen, setSelectedLeadGen] = useState<any>({ code: "All", name: "All" });
    const [selectedBroker, setSelectedBroker] = useState<any>({ code: "All", name: "All" });
    const [leadGen, setLeadGen] = useState<any>([]);
    const [broker, setBroker] = useState<any>([]);
    const [userId, setUserId] = useState<any>({});
    const [instantlyCampaignsList, setInstantlyCampaignsList] = useState<any>([]);
    const [campaignsModal, setCampaignsModal] = useState<boolean>(false);
    const [addLeadsToCampaignLoading, setAddLeadsToCampaignLoading] = useState<boolean>(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>({});
    const [selectedLeads, setSelectedLeads] = useState(null);

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setUserId(state);
            getLeadsFromAPI(state);
            getLeadsListFilterFromAPI(state);
        } else {
            getLeadsFromAPI(null);
            getLeadsListFilterFromAPI(null);
        }
        getInstantlyCampaignsFromAPI();
    }, []);

    useEffect(() => {
        if (location.state) {
            const state = location.state;
            getLeadsFromAPI(state);
        } else {
            getLeadsFromAPI(null);
        }
    }, [selectedLeadGen, selectedBroker]);

    // Get instantly campaigns
    const getInstantlyCampaignsFromAPI = () => {
        // Api call
        pageService
            .getInstantlyCampaigns()
            .then((response) => {
                // Get response
                if (response) {
                    let tempCampaignsArr: any = [];
                    response.map((item: any, index: any) => {
                        tempCampaignsArr.push({
                            code: item.id,
                            name: item.name
                        });
                    });
                    setInstantlyCampaignsList(tempCampaignsArr);
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                }
            });
    };

    // Get leads list filters form api
    const getLeadsListFilterFromAPI = (state: any) => {
        // Api call
        pageService
            .getLeadsListFilter(state?.datascrapper_id)
            .then((response) => {
                // Get response
                if (response) {
                    setLeadGen(response?.leadgen);
                    setBroker(response?.brokers);
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                }
            });
    };

    // Get leads from api
    const getLeadsFromAPI = (state: any) => {
        let leadGenCode: any = selectedLeadGen?.code;
        let brokerCode: any = selectedBroker?.code;
        let dataScrapperCode: any = null;

        if (state?.leadgen_id !== undefined && state?.leadgen_id !== "" && state?.leadgen_id) {
            leadGenCode = state?.leadgen_id;
        }

        if (state?.broker_id && state?.broker_id !== "" && state?.broker_id) {
            brokerCode = state?.broker_id;
        }

        if (state?.datascrapper_id && state?.datascrapper_id !== "" && state?.datascrapper_id) {
            dataScrapperCode = state?.datascrapper_id;
        }

        // Api call
        pageService
            .getLeads(leadGenCode, brokerCode, dataScrapperCode)
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

    // On click of add leads to campaign modal
    const addLeadsToCampaignModal = () => {
        setCampaignsModal(true);
    };

    // Hide add leads to campaign modal
    const hideAddLeadsToCampaign = () => {
        setCampaignsModal(false);
        setSelectedCampaign({});
    };

    // Add leads to campaign
    const addLeadsToCampaignApiCall = () => {

    };

    // left part of toolbar
    const leftToolbarTemplate = () => {
        return (
            <>
                {/* <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                        placeholder="Search..."
                    />
                </span> */}
            </>
        );
    };

    // right part of toolbar
    const rightToolbarTemplate = () => {
        return (
            <>
                {
                    localStorage.getItem("user_type") == "datascrapper" || localStorage.getItem("user_type") == "admin" || localStorage.getItem("user_type") == "teamleader" ?
                        <>
                            {/* <Dropdown
                                value={selectedLeadGen}
                                name="name"
                                options={leadGen}
                                filter
                                optionLabel="name"
                                onChange={(e) => setSelectedLeadGen(e.value)}
                            />
                            <Dropdown
                                value={selectedBroker}
                                name="name"
                                options={broker}
                                filter
                                optionLabel="name"
                                placeholder="Select Broker"
                                onChange={(e) => setSelectedBroker(e.value)}
                            /> */}
                        </>
                        : localStorage.getItem("user_type") == "leadgen" ?
                            <>
                                {/* <Dropdown
                                    value={selectedBroker}
                                    name="name"
                                    options={broker}
                                    filter
                                    optionLabel="name"
                                    placeholder="Select Broker"
                                    onChange={(e) => setSelectedBroker(e.value)}
                                /> */}
                            </>
                            :
                            <></>
                }

                {
                    localStorage.getItem("user_type") == "leadgen" ?
                        <Button
                            label="Add Leads To Campaign"
                            icon="pi pi-send"
                            className="p-button ml-2"
                            onClick={() => addLeadsToCampaignModal()}
                        />
                        :
                        <></>
                }

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

    // Action body template
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <div className="tb-actions">
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-square p-btn-default"
                        onClick={() => { }}
                    />
                </div>
            </>
        );
    };

    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/lead-details" state={{ lead_id: rowData.id }}>
                    <a className="tb-avatar-box" href={rowData?.resume} target="_blank">{rowData?.profile_img != null && rowData?.profile_img != "null" && rowData?.profile_img != "" ?
                        <Avatar className="tb-avatar-img" image={rowData?.profile_img} shape="circle" /> : <Avatar className='tb-avatar-img user-list-avatar' label={rowData?.First_Name.charAt(0).toUpperCase()} shape="circle" />}<div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.First_Name} {rowData?.Last_Name}</div><div className="tb-avatar-text">{rowData?.Email}</div></div>
                    </a>
                </Link>
            </>
        );
    };

    

    // Filters UI
    const [selectedTeamLeader, setSelectedTeamLeader] = useState<any>(null);
    const teamLeader = [
        { name: 'Jeff Stephenes', code: '1' },
    ];
    const [selectedBrokerNew, setSelectedBrokerNew] = useState<any>(null);
    const brokers = [
        { name: 'Ajay Solanki', code: '2' },
    ];
    const [selectedLeadGenNew, setSelectedLeadGenNew] = useState<any>(null);
    const leadGenNew = [
        { name: 'Pragnesh Prajapati', code: '3' },
    ];
    const [selectedDataScrapper, setSelectedDataScrapper] = useState<any>(null);
    const dataScrapper = [
        { name: 'Janmesh Panchal', code: '4' },
    ];
    const allFiltersUI = () => {
        return(
            <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="name">Select Team Leader</label>
                    <Dropdown 
                        value={selectedTeamLeader} 
                        onChange={(e) => setSelectedTeamLeader(e.value)} 
                        options={teamLeader} 
                        optionLabel="name" 
                        placeholder="Select Team Leader" 
                        filter 
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="name">Select Broker</label>
                    <Dropdown
                        value={selectedBrokerNew}
                        onChange={(e) => setSelectedBrokerNew(e.value)}
                        options={brokers}
                        optionLabel="name"
                        placeholder="Select Broker"
                        filter
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="name">Select Lead Generator</label>
                    <Dropdown
                        value={selectedLeadGenNew}
                        onChange={(e) => setSelectedLeadGenNew(e.value)}
                        options={leadGenNew}
                        optionLabel="name"
                        placeholder="Select Lead Generator"
                        filter
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="name">Select Data Scrapper</label>
                    <Dropdown
                        value={selectedDataScrapper}
                        onChange={(e) => setSelectedDataScrapper(e.value)}
                        options={dataScrapper}
                        optionLabel="name"
                        placeholder="Select Data Scrapper"
                        filter
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="name">List Name</label>
                    <Dropdown
                        value={selectedLeadGenNew}
                        onChange={(e) => setSelectedLeadGenNew(e.value)}
                        options={leadGenNew}
                        optionLabel="name"
                        placeholder="Select List Name"
                        filter
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="name">CE Engagement Status</label>
                    <Dropdown
                        value={selectedLeadGenNew}
                        onChange={(e) => setSelectedLeadGenNew(e.value)}
                        options={ceEngagementStatusDropDown}
                        optionLabel="name"
                        placeholder="Select CE Engagement Status"
                        filter
                    />
                </div>
            </div>
        )  
    };

    return (
        <>
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">{localStorage.getItem("user_type") !== "datascrapper" ? <Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> : <></>} Opportunities</div>
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
                        {
                            localStorage.getItem("user_type") == "admin" ?
                                <Button label="Kanban View" className="p-button" onClick={() => navigate('/kanban-view-leads')} />
                                :
                                <></>
                        }
                        {
                            localStorage.getItem("user_type") == "datascrapper" || localStorage.getItem("user_type") == "teamleader" || localStorage.getItem("user_type") == "admin" ? <Button label="New Lead" className="p-button mr-2" onClick={() => navigate('/add-update-leads')} />
                                :
                                <></>
                        }
                    </div>
                </div>
            </div>
            <div className="grid crud-demo">
                <div className="col-12">
                    <Accordion activeIndex={0} expandIcon={<span className='ti ti-adjustments-horizontal pr-2'></span>} collapseIcon={<span className='ti ti-adjustments-horizontal pr-2'></span>}>
                        <AccordionTab header="Advanced Filters">
                            {allFiltersUI()}
                        </AccordionTab>
                    </Accordion>
                </div>
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <span className="block mt-2 md:mt-0 p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    type="search"
                                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                                    placeholder="Search..."
                                />
                            </span>
                            <br/>
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
                                        selectionMode='checkbox'
                                        selection={selectedLeads}
                                        onSelectionChange={(e) => setSelectedLeads(e.value)}
                                        dataKey="id"
                                        emptyMessage="No Leads Found"
                                    >
                                        <Column
                                            selectionMode="multiple"
                                            headerStyle={{ width: '3rem' }}
                                        />
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

            {/* Add Update Dialog */}
            <Dialog
                visible={campaignsModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Add Leads To Campaigns"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideAddLeadsToCampaign}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addLeadsToCampaignApiCall()}
                            loading={addLeadsToCampaignLoading}
                        />
                    </>
                }
                onHide={hideAddLeadsToCampaign}
            >
                <Dropdown
                    value={selectedCampaign}
                    name="name"
                    options={instantlyCampaignsList}
                    filter
                    optionLabel="name"
                    placeholder="Select Campaign"
                    onChange={(e) => setSelectedCampaign(e.value)}
                />
            </Dialog>
        </>
    );
};