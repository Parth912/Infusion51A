import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';

import moment from "moment/moment";

// Column
import { LoginAnalysisColumns } from '../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../appconfig/Settings';

//Services
import PageService from '../../service/PageService';

export const UserAllNotificationsList = () => {
    document.title = "Notifications | Venture Studio"

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

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
    const [notificationsList, setNotificationsList] = useState<any>([]);
    const [stateData, setStateData] = useState<any>({});

    // use effect method
    useEffect(() => {
        if (location.state) {
            const state = location.state;
            setStateData(state);
            getUserAllNotificationsFromAPI(state);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [dates]);

    // Get Clients Data from API
    const getUserAllNotificationsFromAPI = async (state: any) => {
        setPageLoad(false);
        // Api call
        pageService
            .getUserAllNotifications(state.user_id)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setNotificationsList([]);
                    } else {
                        setNotificationsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setNotificationsList([]);
                }
            });
    };

    // On Date Change
    const onDateChange = (e: any) => {
        setDates(e.value);
    };

    const dateFormatCreatedAtTemplate = (rowData: any, rowIndex: any) => {

        return (
            <>
                {rowData.created_at === rowData[rowIndex.field] && rowData.created_at !== null ? moment.utc(rowData.created_at).format('MMM DD, YYYY') : '-'}
            </>
        );
    };

    // page template
    return (
        <>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <div className='main-header'>
                            <h3><Button
                                icon="pi pi-arrow-left"
                                className="p-button-secondary mr-2"
                                onClick={() => navigate(-1)}
                            />    {!window.cn(stateData) ? stateData?.full_name + "'s Login Analysis" : "Login Analysis"}</h3>
                        </div>
                        <Toast ref={toast} />

                        {/* Datatable Start */}
                        {pageLoad ? (
                            <>
                                <DataTable
                                    className="datatable-responsive"
                                    value={notificationsList}
                                    paginator={notificationsList.length > 0 && true}
                                    globalFilter={globalFilter}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage={"No Data Found"}
                                >
                                    {LoginAnalysisColumns.map((col, i) => {
                                        if (col.field === 'created_at') {
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
                                    {LoginAnalysisColumns.map((col, i) => (
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
        </>
    );
};
