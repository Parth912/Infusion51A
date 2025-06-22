import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

//Prime React Component Inbuilt
import { BreadCrumb } from 'primereact/breadcrumb';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

// Column From DataTable
import { InterviewColumns } from '../../../appconfig/DatatableSetting';


// This is my main function
export const Interview = () => {

    document.title = "Interview | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Interview</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    // Static Data For Data Table
    const InterviewData = [
        { sr_no: 1, full_name: 'xyz', job_role: 'Software Engineer', mobile: '123-456-7890' },
        { sr_no: 2, full_name: 'abc', job_role: 'Dev Ops', mobile: '9999999999' },
        { sr_no: 3, full_name: 'pqr', job_role: 'Data Engineer', mobile: '7854368247' },
    ];

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(true);
    const [InterviewList, setInterviewList] = useState(InterviewData);

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);

    // Full Name template for DataTable column
    const fullNameTemplate = (rowData: any) => (

        <Link className="tb-avatar-box" to="/interview/interviewdetails" state={{ sr_no: rowData.sr_no }}>
            <div className="tb-avatar-info">
                <div className="tb-avatar-name">{rowData.full_name}</div>
            </div>
        </Link>
    );

    // Mobile template for DataTable column
    const mobileTemplate = (rowData: any) => (
        <div>{rowData.mobile}</div>
    );

    // Job Role template for DataTable column
    const jobRoleTemplate = (rowData: any) => (
        <div>{rowData.job_role}</div>
    );


    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-header-info">
                    <div className="page-title">Interviews - Test Employee</div>
                    <div className="main-content-breadcrumb">
                        <BreadCrumb model={items} home={home} />
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            {/* Datatable Start */}
                            {pageLoad ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive" stripedRows
                                        value={InterviewList}
                                        paginator={InterviewList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Interview Found"
                                    >
                                        {InterviewColumns.map((col, i) => {
                                            if (col.field === 'sr_no') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={(_, { rowIndex }) => rowIndex + 1}
                                                    />
                                                );
                                            } else if (col.field === 'mobile') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={mobileTemplate}
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
                                            } else if (col.field === 'job_role') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={jobRoleTemplate}
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
                                    {/* Skeleton Data table */}
                                    <DataTable value={Skeletonitems}>
                                        {InterviewColumns.map((col, i) => (
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