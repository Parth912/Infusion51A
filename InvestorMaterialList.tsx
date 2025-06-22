import { useState, useEffect, useRef } from 'react';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Button } from 'primereact/button';
// import { TreeTable } from 'primereact/treetable';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

import axios from 'axios';

// Data table
import {
    APP_BASE_URL,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import 'primeicons/primeicons.css';
import PDFViewer from '../../../components/PDFViewer';
import { InvestorInvestmentMaterialColumns } from '../../../appconfig/DatatableSetting';
import { VIEW_INVESTMENT_MATERIAL } from '../../../config/ApiConstant';
import { requestForDocValidate } from '../../../config/Validate';

export const InvestorMaterialList = () => {
    document.title = 'Investment Material | Venture Studio';

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investment Material</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const pageService = new PageService();
    const hasFetchedData = useRef(false);
    const timerRef = useRef<any>(null);
    const toast = useRef<any>(null);

    //Loading/Page Loading
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [tableLoad, setTableLoad] = useState<boolean>(false);
    // const [nodes, setNodes] = useState([]);
    // const [treeData, setTreeData] = useState<any>([]);
    const [investmentMaterials, setInvestmentMaterials] = useState<any>([]);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [viewModal, setViewModal] = useState<boolean>(false);
    const [viewId, setViewId] = useState<any>(null);
    const [viewName, setViewName] = useState<any>(null);
    const [viewTime, setViewTime] = useState<any>(0); // time in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [isFlipBook, setIsFlipBook] = useState<boolean>(false);
    const [isFlipBookURL, setIsFlipBookURL] = useState<any>("");
    const [requestForDocModal, setRequestForDocModal] = useState<boolean>(false);
    const [requestForDocLoader, setRequestForDocLoader] = useState<boolean>(false);
    const [requestFoprDocMsg, setRequestForDocMsg] = useState<any>("");
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getInvestorMaterialFromApi();
    }, []);

    useEffect(() => {

    }, [investmentMaterials]);

    // Function to transform data into the required format for TreeTable
    const transformDataForTreeTable = (data: any, parentKey = '') => {
        return data.map((item: any, index: any) => {
            const key = parentKey ? `${parentKey}-${index}` : `${index}`;

            return {
                key: key,
                data: {
                    name: item.label,
                    type: item.type,
                    id: item.id
                },
                children: item.children ? transformDataForTreeTable(item.children, key) : []
            };
        });
    };

    // Get investor material from api
    const getInvestorMaterialFromApi = () => {
        setTableLoad(false);

        pageService
            .getInvestorMaterialData()
            .then((response) => {
                // Get response
                if (response) {
                    setTableLoad(true);
                    if (response.length == 0) {
                        setInvestmentMaterials([]);
                    } else {
                        setInvestmentMaterials(response);
                        let _expandedRows: any = {};
                        response.forEach((p: any) => (_expandedRows[`${p.folder_name}`] = true));
                        setExpandedRows(_expandedRows);
                    }
                } else {
                    setTableLoad(true);
                    setInvestmentMaterials([]);
                }
            });
    };

    // View Modal For Investment Material 
    const viewInvestmentMaterialApiCall = (rowData: any) => {
        setIsFlipBook(rowData?.material_data?.is_flipbook == 1 ? true : false);
        // Check if it's a flip book or not
        if (rowData?.material_data?.is_flipbook == 1) {
            pageService
                .viewFlipBook(rowData?.material_data?.id)
                .then((response) => {
                    // Get response
                    if (response) {
                        setIsFlipBookURL(response.url);
                    }
                });
        }
        setViewId(rowData?.material_data?.id);
        setViewName(rowData?.material_data?.file_name);
        setViewModal(true);
        // start timer when pdf is opened
        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setViewTime((prevTime: any) => prevTime + 1);
            }, 1000);
        }
    };

    // Download investment material file api call
    const downloadInvestmentMaterialApiCall = async (rowData: any) => {
        setPageLoad(true);
        if(rowData?.material_data?.uploaded_from == "manual"){
            const fileResponse = await fetch(rowData?.material_data?.material_url);
            const blob = await fileResponse.blob();

            let downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = rowData?.material_data?.file_name || "download";
            downloadLink.click();
            URL.revokeObjectURL(downloadLink.href);
            setPageLoad(false);
        } else if (rowData?.material_data?.uploaded_from == "drive"){
            const response = await axios({
                url: `${APP_BASE_URL + VIEW_INVESTMENT_MATERIAL}?file_id=${rowData?.material_data?.id}`,
                method: 'GET',
                responseType: 'blob',
                headers: {
                    Authorization: "Bearer " + localStorage.getItem('token')
                }
            });

            // Create a URL for the binary file
            const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            let downloadLink = document.createElement('a');
            downloadLink.href = fileURL;
            downloadLink.download = rowData?.material_data?.file_name;
            downloadLink.click();
            URL.revokeObjectURL(fileURL);
            setPageLoad(false);
        }
    };

    // Format time to min and sec 
    const formatTime = () => {
        const hours = Math.floor(viewTime / 3600);
        const minutes = Math.floor((viewTime % 3600) / 60);
        const seconds = viewTime % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Hide view modal
    const hideViewModal = () => {
        setPageLoad(true);
        // Stop timer and set to 0
        if (isRunning) {
            clearInterval(timerRef.current);
            setIsRunning(false);
        }

        let totalTime = formatTime();

        // Formdata
        let formData = new FormData();
        formData.append('time', totalTime);
        formData.append('investment_material_id', viewId);

        // call api
        pageService.addReadTimeOfInvtMaterial(formData).then((response) => {
            // Get response
            if (response) {
                setViewModal(false);
                setIsFlipBook(false);
                setIsFlipBookURL("");
                setViewId(null);
                setViewName(null);
                setViewTime(0);
                setPageLoad(false);
            }
        });
    };

    // Total files template
    const totalFilesTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.materials.length}
            </>
        )
    };

    // Template body for action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.material_data?.material_type == "File" ?
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            icon="pi pi-eye"
                            className='p-button-secondary p-button-square'
                            onClick={() => viewInvestmentMaterialApiCall(rowData)}
                            tooltip='View'
                        />
                        {
                            rowData?.is_download == 1 ?
                                <>
                                    <Button
                                        type="button"
                                        icon="pi pi-download"
                                        className='p-button-secondary p-button-square'
                                        onClick={() => downloadInvestmentMaterialApiCall(rowData)}
                                        tooltip='Download'
                                    />
                                </>
                            :
                                <></>
                        }
                    </div>
                    :
                    <></>
                }
            </>

        );
    };

    // Template body for file name
    const fileNameBodyTemplate = (rowData: any) => {
        return (
            <>
                {rowData?.material_data?.file_name}
            </>

        );
    };

    // Check if any data is there for row expansion
    const allowExpansion = (rowData: any) => {
        return rowData?.materials?.length > 0;
    };

    // Row expansion template
    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="p-3">
                <DataTable
                    className="datatable-responsive invt-material-table"
                    value={data.materials}
                    paginator={data.materials.length > 0 && true}
                    rows={10}
                    emptyMessage="No Data Found"
                >
                    {InvestorInvestmentMaterialColumns.map((col, i) => {
                        if (col.field === 'action') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={actionBodyTemplate}
                                />
                            );
                        } else if (col.field === 'file_name') {
                            return (
                                <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={fileNameBodyTemplate}
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
            </div>
        );
    };

    // Open request for doc modal
    const openRequestForDocModal = () => {
        setRequestForDocModal(true);
    };

    // Close request for doc modal
    const closeRequestForDocModal = () => {
        setRequestForDocMsg("");
        setErrors({});
        setRequestForDocLoader(false);
        setRequestForDocModal(false);
    };

    // Send request for doc api call
    const sendRequestforDoc = () => {
        const { errors, isError } = requestForDocValidate(requestFoprDocMsg);
        setErrors(errors);
        if (!isError) {
            setRequestForDocLoader(true);

            // request data
            let formData: any = new FormData();
            formData.append('user_id', localStorage.getItem("id"));
            formData.append('request', requestFoprDocMsg);

            // call api
            pageService.addRequestForDoc(formData).then((response) => {
                // Get response
                if (response) {
                    setRequestForDocLoader(false);
                    setRequestForDocModal(false);
                    setRequestForDocMsg("");
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    setRequestForDocLoader(false);
                    setRequestForDocModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setRequestForDocLoader(false);
                setRequestForDocModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Investment Materials</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <Button className="p-button-outlined p-button mr-2" label="Request For Document" onClick={() => openRequestForDocModal()} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    {tableLoad == true ? (
                        <>
                            <DataTable
                                className='datatable-responsive'
                                dataKey="folder_name"
                                value={investmentMaterials}
                                expandedRows={expandedRows}
                                globalFilter={globalFilter}
                                onRowToggle={(e) => setExpandedRows(e.data)}
                                rowExpansionTemplate={rowExpansionTemplate}
                                emptyMessage="No Investment Material Found"
                            >
                                <Column expander={allowExpansion} style={{ width: '5rem' }} />
                                <Column field="folder_name" header="Name" sortable />
                                <Column field="total_files" header="Files" body={totalFilesTemplate} />
                            </DataTable>
                        </>
                    ) : (
                        <>
                            <DataTable value={Skeletonitems}>
                                <Column
                                    key="folder_name"
                                    field="folder_name"
                                    header="Name"
                                    body={SkeletonbodyTemplate}
                                />
                            </DataTable>
                        </>
                    )}
                    {/* Datatable End */}
                </div>
            </div>

            {/* Investment material view modal */}
            <Dialog
                visible={viewModal}
                style={{ width: '450px' }}
                className="investor-pdf-viewer p-fluid p-dialog-maximized"
                header={viewName}
                modal
                onHide={hideViewModal}
            >
                {
                    viewId !== null ?
                        <>
                            {
                                isFlipBook ?
                                    <iframe
                                        src={isFlipBookURL}
                                        title="webview"
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                    />
                                    :
                                    <PDFViewer fileId={viewId} />
                            }
                        </>

                        :
                        <></>
                }

            </Dialog>

            {/* Request for doc dialog */}
            <Dialog
                visible={requestForDocModal}
                style={{ width: '450px' }}
                header="Request For Document"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeRequestForDocModal}
                        />
                        <Button
                            label="Save"
                            className="p-button-success"
                            onClick={sendRequestforDoc}
                            loading={requestForDocLoader}
                        />
                    </>
                }
                onHide={closeRequestForDocModal}
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-12">
                        <label htmlFor="name">Enter the document name or details you wish to request <span style={{ color: "red" }}>*</span></label>
                        <InputTextarea
                            value={requestFoprDocMsg}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Request"
                            onChange={(e) => setRequestForDocMsg(e.target.value)}
                            className={errors['request'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['request']}</small>
                    </div>
                </div>
            </Dialog>

            {/* Loader Start */}
            {
                pageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    );
};
