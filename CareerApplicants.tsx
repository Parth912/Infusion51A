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
import { Badge } from 'primereact/badge';
import { BreadCrumb } from 'primereact/breadcrumb';

import moment from "moment/moment";

// Column
import { ApplicantsColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
    applicantStatus,
    applicantStatusChange,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';

export const CareerApplicants = () => {
    document.title = "Applicants | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Applicants</span>
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
    const [status, setStatus] = useState<any>({ name: 'All', code: "All" });
    const [applicantsList, setApplicantsList] = useState<any>([]);
    const [statusChangePageLoad, setStatusChangePageLoad] = useState(false);
    const [jobCompanies, setJobCompanies] = useState<any>([]);
    const [selectedCompany, setSelectedCompany] = useState<any>({ name: "All", code: "All" });
    const [jobRoles, setJobRoles] = useState<any>([]);
    const [selectedJobRole, setSelectedJobRole] = useState<any>({ name: "All", code: "All" });

    // use effect method
    useEffect(() => {
        getApplicantsDataFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        getJobCompaniesFromAPI();
        getJobRolesFromAPI();
    }, [status, selectedCompany, selectedJobRole]);

    // Get job roles for dropdown
    const getJobRolesFromAPI = () => {
        // Api call
        pageService
            .getJobRolesListForDropdown()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setJobRoles([]);
                    } else {
                        let tempJobRoleArr = [{ name: "All", code: "All" }];
                        DataList.map((item: any, index: number) => {
                            tempJobRoleArr.push(item);
                        });
                        setJobRoles(tempJobRoleArr);
                    }
                } else {
                    setJobRoles([]);
                }
            });
    };

    // Get job companies from dropdown
    const getJobCompaniesFromAPI = () => {
        // Api call
        pageService
            .getJobCompaniesListForDropdown()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setJobCompanies([]);
                    } else {
                        let tempCompArr = [{ name: "All", code: "All" }];
                        DataList.map((item: any, index: number) => {
                            tempCompArr.push(item);
                        });
                        setJobCompanies(tempCompArr);
                    }
                } else {
                    setJobCompanies([]);
                }
            });
    };

    // Get Applicants Data from API
    const getApplicantsDataFromAPI = async () => {

        // Api call
        pageService
            .getApplicantsList(status.code, selectedCompany.code, selectedJobRole.code)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setApplicantsList([]);
                    } else {
                        setApplicantsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setApplicantsList([]);
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
                    value={selectedJobRole}
                    onChange={(e) => setSelectedJobRole(e.value)}
                    options={jobRoles}
                    optionLabel="name"
                    placeholder="Job Role"
                ></Dropdown>

                <Dropdown
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.value)}
                    options={jobCompanies}
                    optionLabel="name"
                    placeholder="Company"
                ></Dropdown>

                <Dropdown
                    value={status}
                    onChange={(e) => setStatus(e.value)}
                    options={applicantStatus}
                    optionLabel="name"
                    placeholder="Approval Status"
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
                <Dropdown
                    value={{ name: rowData.status, code: rowData.status }}
                    onChange={(e) => onApplicantStatusChange(e, rowData.id)}
                    options={applicantStatusChange}
                    optionLabel="name"
                ></Dropdown>
            </>
        )
    };

    // on applicant status change
    const onApplicantStatusChange = (e: any, applicantId: any) => {
        try {
            setStatusChangePageLoad(true);
            // request data
            let formData = new FormData();
            formData.append('id', applicantId);
            formData.append('status', e.value.code);

            // call api
            pageService.applicantStatusChange(formData).then((response) => {
                // Get response
                if (response) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    setTimeout(() => {
                        setStatusChangePageLoad(false);
                        getApplicantsDataFromAPI();
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

    // for column action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                <Button
                    icon="pi pi-eye"
                    className="p-button-square p-button-secondary ml-2"
                    onClick={() => window.open('/applicant/details/' + rowData.id, "_blank")}
                />
            </div>
        );
    };

    // for column task file
    const taskFileTemplate = (rowData: any) => {
        return (
            <>{rowData?.give_task == "Yes" ? (rowData.task_file !== "" && rowData.task_file !== null && rowData.task_file !== "null" ? <><Badge value="Uploaded"></Badge></> : <Badge value="Pending" severity="warning"></Badge>) : <><Badge value="NotRequired" severity="danger"></Badge></>}</>
        );
    };

    // Full name body template
    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
            <a className="tb-avatar-box" href={rowData?.resume} target="_blank">{rowData?.profile_img != null && rowData?.profile_img != "null" && rowData?.profile_img != "" ?
                <Avatar className="tb-avatar-img" image={rowData?.profile_img} shape="circle" /> : <Avatar className='tb-avatar-img user-list-avatar' label={rowData?.full_name.charAt(0).toUpperCase()} shape="circle" />}<div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.full_name}</div><div className="tb-avatar-text">{rowData?.email}</div></div>
            </a>
            </>
        )
    };

    // page template
    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Applicants</div>
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
                                        value={applicantsList}
                                        paginator={applicantsList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Applicants Found"
                                    >
                                        {ApplicantsColumns.map((col, i) => {
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
                                            } else if (col.field === 'created_at') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={dateFormatCreatedAtTemplate}
                                                        filter
                                                        sortable
                                                    />
                                                );
                                            } else if (col.field === 'task_file') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={taskFileTemplate}
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
                                            } else if (col.field === 'full_name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={fullNameTemplate}
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
                                        {ApplicantsColumns.map((col, i) => (
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
