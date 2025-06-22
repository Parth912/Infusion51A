import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';

//Services
import PageService from '../../../service/PageService';
import { APP_BASE_URL, SkeletonbodyTemplate, Skeletonitems, defaultRowOptions } from '../../../appconfig/Settings';
import { InvestorConvertingDocsUploadAttorneyColumns } from '../../../appconfig/DatatableSetting';

export const AttorneyDocsList = () => {
    document.title = 'Attorney Documents | Venture Studio';

    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [attorneyData, setAttorneyData] = useState<any>({});
    const [uploadedDocs, setUploadedDocs] = useState<any>([]);
    const [convertingDocsList, setConvertingDocsList] = useState<any>([]);
    const [docEditModal, setDocEditModal] = useState<boolean>(false);
    const [docEditUrl, setDocEditUrl] = useState("");
    const [docEditId, setDocEditId] = useState("");
    const [docEditUserId, setDocEditUserId] = useState("");

    // useEffect
    useEffect(() => {
        if (localStorage.getItem("attorney_data") !== null || localStorage.getItem("attorney_data") !== undefined){
            let storedAttorney = localStorage.getItem("attorney_data");
            const attorney = storedAttorney ? JSON.parse(storedAttorney) : null;
            setAttorneyData(attorney);

            getAllConvertingDocsListFromAPI();
            getInvestorUploadedDocsFromAPI(attorney);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("attorney_data");
        window.location.href = "/attorney/login";
    };

    // Get investor uploaded docs from api
    const getInvestorUploadedDocsFromAPI = (attorney: any) => {
        // Api call
        pageService
            .getInvestorUploadedDocs(attorney?.investor_id)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setUploadedDocs([]);
                    } else {
                        setUploadedDocs(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setUploadedDocs([]);
                }
            });
    };

    // Get all converting doc list from api
    const getAllConvertingDocsListFromAPI = () => {
        // Api call
        pageService
            .getAllConvertInvestorDoc("attorney")
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setConvertingDocsList([]);
                    } else {
                        setConvertingDocsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setConvertingDocsList([]);
                }
            });
    };

    // Open doc edit modal
    const openDocEditModal = (id: any, user_id: any, doc_url: any) => {
        setDocEditId(id);
        setDocEditUserId(user_id);
        setDocEditUrl(doc_url);
        setDocEditModal(true);
    };

    // Close doc edit modal
    const closeDocEditModal = () => {
        getInvestorUploadedDocsFromAPI(attorneyData);
        setDocEditUrl("");
        setDocEditId("");
        setDocEditUserId("");
        setDocEditModal(false);
    };

    // Template for actions
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        let uploadedDoc = uploadedDocs.filter((item: any) => item.convert_doc_id === rowData.id);
        let docUrl = rowData.doc_url;
        if (uploadedDoc.length > 0) {
            docUrl = uploadedDoc[0].file_url;
        }
        return (
            <>
                <div className="tb-actions">
                    <Button
                        icon="pi pi-file-edit"
                        className="p-button-square p-btn-default"
                        tooltip="sign"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => openDocEditModal(rowData.id, localStorage.getItem("id"), docUrl)}
                    />

                    <Button
                        icon="pi pi-eye"
                        className="p-button-square p-btn-default"
                        tooltip="View"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => window.open(docUrl, "_blank")}
                        disabled={uploadedDoc.length > 0 ? false : true}
                    />
                </div>
            </>
        )
    };

    // Template for advocate sign
    const advocateSignBodyTemplate = (rowData: any, rowIndex: any) => {
        let uploadedDoc = uploadedDocs.filter((item: any) => item.convert_doc_id === rowData.id);
        let hasAdvocateSigned = 0;
        if (uploadedDoc.length > 0) {
            if (uploadedDoc[0].advocate_sign === 1) {
                hasAdvocateSigned = 1;
            }
        }
        return (
            <>
                {rowData?.advocate_sign === "Yes" && hasAdvocateSigned === 0 ? <Badge severity='warning' value="Pending"></Badge> : rowData?.advocate_sign === "Yes" && hasAdvocateSigned === 1 ? <Badge severity='success' value="Signed"></Badge> : <Badge severity='danger' value="Not Required"></Badge>}
            </>
        )
    };

    return(
        <>
            {/* <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">{!window.cn(attorneyData?.full_name) ? attorneyData?.full_name : ""}</div>
                    </div>
                </div>
            </div> */}
            <div className='layout-wrapper layout-sidebar layout-sidebar-static'>
                <div className='layout-main'>
                    <div className='layout-topbar' style={{ paddingLeft: "10px" }}>
                        <div className="layout-topbar-left">
                            <button className="topbar-menu-button p-link"></button>
                            <button className="logo p-link" style={{ display: "block" }}>
                                <img src="/assets/images/logo.png" className="logo-img" style={{ height: "2.5rem" }}/>
                            </button>
                        </div>
                        <div className="layout-topbar-right" style={{ paddingRight: "10px" }}>
                            <Button
                                label='Sign Out'
                                onClick={() => logout()}
                            />
                        </div>
                    </div>
                    <div className='layout-main-content-custom' style={{ marginLeft: "8px" }}>
                        <div className="layout-dashboard">
                            <div className="page-header">
                                <div className="page-leftheader">
                                    <div className="page-header-info">
                                        <div className="page-title">Welcome, {!window.cn(attorneyData?.full_name) && attorneyData?.full_name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card'>
                            <div className='card-body'>
                                {/* Datatable Start */}
                                {pageLoad ? (
                                    <>
                                        <DataTable
                                            className="datatable-responsive" stripedRows
                                            value={convertingDocsList}
                                            rows={defaultRowOptions}
                                            emptyMessage="No Documents Found"
                                        >
                                            {InvestorConvertingDocsUploadAttorneyColumns.map((col, i) => {
                                                if (col.field === 'action') {
                                                    return (
                                                        <Column
                                                            key={col.field}
                                                            field={col.field}
                                                            header={col.header}
                                                            body={actionBodyTemplate}
                                                        />
                                                    );
                                                } else if (col.field === 'advocate_sign') {
                                                    return (
                                                        <Column
                                                            key={col.field}
                                                            field={col.field}
                                                            header={col.header}
                                                            body={advocateSignBodyTemplate}
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
                                            {InvestorConvertingDocsUploadAttorneyColumns.map((col, i) => (
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
            </div>

            {/* Doc edit modal */}
            <Dialog
                visible={docEditModal}
                style={{ width: '450px' }}
                className="investor-pdf-viewer p-fluid p-dialog-maximized"
                header={"Test View"}
                modal
                onHide={closeDocEditModal}
            >
                <iframe
                    src={APP_BASE_URL + "/investor-pdf-edit?file=" + docEditUrl + "&id=" + docEditId + "&user_id=" + docEditUserId + "&type=attorney"}
                    title="webview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />
            </Dialog>
        </>
    )
};