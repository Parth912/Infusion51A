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
import { CareersColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
    careerStatus,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { Link } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';

export const CareersList = () => {
    document.title = "Careers | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Careers</span>
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
    const [careersList, setCareersList] = useState<any>([]);
    const [statusChangePageLoad, setStatusChangePageLoad] = useState(false);
    const [jobCompanies, setJobCompanies] = useState<any>([]);
    const [selectedCompany, setSelectedCompany] = useState<any>({ name: "All", code: "All" });

    // use effect method
    useEffect(() => {
        getCareerDataFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        getJobCompaniesFromAPI();
    }, [dates, status, selectedCompany]);

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

    // Get Career Data from API
    const getCareerDataFromAPI = async () => {

        // Api call
        pageService
            .getCareerJobs(status.code, selectedCompany.code)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setCareersList([]);
                    } else {
                        setCareersList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setCareersList([]);
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
                {
                    localStorage.getItem('user_type') == "admin" ?
                        <Dropdown
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.value)}
                            options={jobCompanies}
                            optionLabel="name"
                            placeholder="Company"
                        ></Dropdown>
                        :
                        <></>
                }


                <Dropdown
                    value={status}
                    onChange={(e) => setStatus(e.value)}
                    options={careerStatus}
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
                {rowData.status == "Published" ? <><Badge value="Published" severity="success"></Badge></> : rowData.status == "Inactive" ? <><Badge value="Inactive" severity="warning"></Badge></> : <><Badge value="Not Published" severity="danger"></Badge></>}
            </>
        )
    };

    const companyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/career/details" state={{ career_id: rowData.id }}>{rowData?.company?.company_logo != null && rowData?.company?.company_logo != "null" && rowData?.company?.company_logo != "" ?
                    <Avatar className="tb-avatar-img" image={rowData?.company?.company_logo} shape="circle" /> : <Avatar className='tb-avatar-img user-list-avatar' label={rowData?.company?.company_name.charAt(0).toUpperCase()} shape="circle" />}<div className="tb-avatar-info"><div className="tb-avatar-name">{rowData.company?.company_name}</div></div>
                </Link>
            </>
        )
    };

    const roleTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData.job_role?.name}
            </>
        )
    };

    const salaryTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {!window.cn(rowData.salary_from) && !window.cn(rowData.salary_to) ? rowData?.currency + " " + rowData.salary_from + " - " + rowData.salary_to : rowData?.currency + " " + rowData.salary_from}
            </>
        )
    };

    const experienceTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData.experience_from + " - " + rowData.experience_to + " Years"}
            </>
        )
    };

    // for column action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                <InputSwitch className="mr-2" checked={rowData.status == "Published" ? true : false} onChange={(e) => changeJobPostStatus(e.value, rowData.id)} />
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    onClick={() => navigate('/career/publish', { state: { career_id: rowData.id } })}
                />
            </div>
        );
    };
    const changeJobPostStatus = (value: any, id: any) => {
        try {
            setStatusChangePageLoad(true);
            // request data
            let formData = new FormData();
            formData.append('id', id);
            formData.append('status', value);

            // call api
            pageService.changeCareerJobPostStatus(formData).then((response) => {
                // Get response
                if (response) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    setTimeout(() => {
                        setStatusChangePageLoad(false);
                        getCareerDataFromAPI();
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

    // page template
    return (
        <>
        <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Careers</div>
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
                        <Button className="p-button mr-2" label="Add New Job" onClick={() => navigate('/career/publish')} />
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
                                    value={careersList}
                                    paginator={careersList.length > 0 && true}
                                    globalFilter={globalFilter}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage="No Careers Found"
                                >
                                    {CareersColumns.map((col, i) => {
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
                                        } else if (col.field === 'job_company') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={companyTemplate}
                                                />
                                            );
                                        } else if (col.field === 'job_role') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={roleTemplate}
                                                />
                                            );
                                        } else if (col.field === 'salary') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={salaryTemplate}
                                                />
                                            );
                                        } else if (col.field === 'experience') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={experienceTemplate}
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
                                    {CareersColumns.map((col, i) => (
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
