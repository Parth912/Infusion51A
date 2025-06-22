import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { FileUpload } from 'primereact/fileupload';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

// Column
import { InvestorConvertingDocsUploadColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultRowOptions,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

import { chooseOptions, emptyTemplate, headerTemplate } from '../../../components/ImageUploadComponent/ImageUploadSetting';

//Services
import PageService from '../../../service/PageService';
import { APP_BASE_URL } from '../../../appconfig/Settings';
import { addInvestorAttorneyValidate, uploadInvestorDocsValidate } from '../../../config/Validate';

export const BecomeAnInvestor = () => {
    document.title = 'Become An Investor | Venture Studio';

    // Page Service
    const pageService = new PageService();

    //Navigate Another Route
    const navigate = useNavigate();

    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [uploadedDocs, setUploadedDocs] = useState<any>([]);
    const [convertingDocsList, setConvertingDocsList] = useState<any>([]);
    const [docEditModal, setDocEditModal] = useState<boolean>(false);
    const [docEditUrl, setDocEditUrl] = useState("");
    const [docEditId, setDocEditId] = useState("");
    const [docEditUserId, setDocEditUserId] = useState("");
    const [docUploadModal, setDocUploadModal] = useState<boolean>(false);
    const [docUploadLoader, setDocUploadLoader] = useState<boolean>(false);
    const [docUploadId, setDocUploadId] = useState<any>("");
    const [docUploadName, setDocUploadName] = useState<any>("");
    const [uploadedFile, setUploadedFile] = useState<any>("");
    const [errors, setErrors] = useState<any>({});
    const [addInvestorAttorneyModal, setAddInvestorAttorneyModal] = useState<boolean>(false);
    const [addInvestorAttorneyLoader, setAddInvestorAttorneyLoader] = useState<boolean>(false);
    const [investorAttorneyData, setInvestorAttorneyData] = useState<any>({});
    const [phonecode, setPhoneCode] = useState<any>("");
    const [countriesList, setCountriesList] = useState<any>([]);

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getAllConvertingDocsListFromAPI();
        getInvestorUploadedDocsFromAPI();
        getCountriesFromAPi();
        getInvestorAttorneyFromAPI();
    }, []);

    // Get countires
    const getCountriesFromAPi = () => {
        // Api call
        pageService
            .getCountries()
            .then((response) => {
                // Get response
                if (response) {
                    setCountriesList(response);
                } else {
                    setCountriesList([]);
                }
            });
    };

    // Get investor uploaded docs from api
    const getInvestorUploadedDocsFromAPI = () => {
        // Api call
        pageService
            .getInvestorUploadedDocs(localStorage.getItem("id"))
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

    // Get investor attorney from api
    const getInvestorAttorneyFromAPI = () => {
        // Api call
        pageService
            .getInvestorAttorney(localStorage.getItem("id"))
            .then((response) => {
                // Get response
                if (response) {
                    setInvestorAttorneyData({
                        "id": response?.id,
                        "investor_id": response?.investor_id,
                        "full_name": response?.full_name,
                        "mobile": response?.mobile,
                        "country": { code: response?.country?.iso, name: response?.country?.name, id: response?.country?.id, phonecode: response?.country?.phonecode }
                    });             
                    setPhoneCode("+" + response?.country?.phonecode);   
                }
            });
    };

    // Get all converting doc list from api
    const getAllConvertingDocsListFromAPI = () => {
        console.log("hello");
        // Api call
        pageService
            .getAllConvertInvestorDoc("")
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
        getInvestorUploadedDocsFromAPI();
        setDocEditUrl("");
        setDocEditId("");
        setDocEditUserId("");
        setDocEditModal(false);
    };

    // Open doc upload modal
    const openDocUploadModal = (rowData: any) => {
        setDocUploadId(rowData?.id);
        setDocUploadName(rowData?.name);
        setDocUploadModal(true);
    };

    // Close doc upload modal
    const closeDocUploadModal = () => {
        setDocUploadId("");
        setDocUploadName("");
        setUploadedFile("");
        setErrors({});
        setDocUploadLoader(false);
        setDocUploadModal(false);
    };

    // for remove converting file
    const onTemplateRemoveConvertingFile = (callback: any) => {
        setUploadedFile("");
        callback();
    };

    // for upload converting doc
    const itemConvertingDocTemplate = (file: any, props: any) => {
        setUploadedFile(file);
        removeFile.current = props.onRemove;
        return (
            <>
                <div className="flex align-items-center flex-wrap">
                    <div className="flex align-items-center" style={{ width: '40%' }}>
                        <img
                            alt={file.name}
                            role="presentation"
                            src="/assets/images/pdf-1.png"
                            width={100}
                        />
                        <div className="flex" style={{ alignItems: "center" }}>
                            <span className="mr-3">{file.name}</span>
                            <Button
                                style={{ width: "65px" }}
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={() => onTemplateRemoveConvertingFile(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Save uploaded file
    const saveUploadedFile = () => {
        const { errors, isError } = uploadInvestorDocsValidate(uploadedFile);
        setErrors(errors);
        if (!isError) {
            setDocUploadLoader(true);

            // request data
            let formData: any = new FormData();
            formData.append("convert_doc_id", docUploadId);
            formData.append("user_id", localStorage.getItem("id"));
            formData.append("doc_file", uploadedFile);

            // call api
            pageService.uploadInvestorDoc(formData).then((response) => {
                // Get response
                if (response) {
                    setDocUploadId("");
                    setDocUploadName("");
                    setUploadedFile("");
                    setErrors({});
                    setDocUploadLoader(false);
                    setDocUploadModal(false);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getAllConvertingDocsListFromAPI();
                    getInvestorUploadedDocsFromAPI();
                } else {
                    setDocUploadLoader(false);
                    setDocUploadModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setDocUploadLoader(false);
                setDocUploadModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    // Template for actions
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        let uploadedDoc = uploadedDocs.filter((item: any) => item.convert_doc_id === rowData.id);
        let docUrl = rowData.doc_url;
        if(uploadedDoc.length > 0){
            docUrl = uploadedDoc[0].file_url;
        }
        return (
            <>
                <div className="tb-actions">
                    {
                        rowData?.type === "Direct" ? 
                            <Button
                                icon="pi pi-upload"
                                className="p-button-square p-btn-default"
                                tooltip="Upload"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => openDocUploadModal(rowData)}
                            />
                        :
                            <Button
                                icon="pi pi-file-edit"
                                className="p-button-square p-btn-default"
                                tooltip="sign"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => openDocEditModal(rowData.id, localStorage.getItem("id"), docUrl)}
                            />
                    }
                    
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

    // Template for status
    const statusBodyTemplate = (rowData: any, rowIndex: any) => {
        let uploadedDoc = uploadedDocs.filter((item: any) => item.convert_doc_id === rowData.id);
        return (
            <>
                {uploadedDoc.length > 0 ? <Badge severity='success' value="Uploaded"></Badge> : <Badge severity='warning' value="Pending"></Badge>}
            </>
        )
    };

    // Template for advocate sign
    const advocateSignBodyTemplate = (rowData: any, rowIndex: any) => {
        let uploadedDoc = uploadedDocs.filter((item: any) => item.convert_doc_id === rowData.id);
        let hasAdvocateSigned = 0;
        if(uploadedDoc.length > 0){
            if (uploadedDoc[0].advocate_sign === 1){
                hasAdvocateSigned = 1;
            }
        }
        return (
            <>
                {rowData?.advocate_sign === "Yes" && hasAdvocateSigned === 0 ? <Badge severity='warning' value="Pending"></Badge> : rowData?.advocate_sign === "Yes" && hasAdvocateSigned === 1 ? <Badge severity='success' value="Signed"></Badge> : <Badge severity='danger' value="Not Required"></Badge>}
            </>
        )
    };

    // Open add investor attorney modal
    const openAddInvestorAttorneyModal = () => {
        setAddInvestorAttorneyModal(true);
    };

    // Close add investor attorney modal
    const closeAddInvestorAttorneyModal = () => {
        setErrors({});
        setAddInvestorAttorneyLoader(false);
        setAddInvestorAttorneyModal(false);
    };

    const selectedCountryTemplate = (option: any, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <img alt={option.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const countryOptionTemplate = (option: any) => {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                <div>{option.name}</div>
            </div>
        );
    };

    //On Input Change
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == "country") {
            val = e;
            setPhoneCode("+" + e.phonecode);
        } else {
            val = (e.target && e.target.value) || '';
        }
        setInvestorAttorneyData({ ...investorAttorneyData, [name]: val });
    };

    // Add investor attorney api call
    const addInvestorAttorneyApiCall = () => {
        const { errors, isError } = addInvestorAttorneyValidate(investorAttorneyData);
        setErrors(errors);
        if (!isError) {
            setAddInvestorAttorneyLoader(true);

            // request data
            let formData: any = new FormData();
            if(!window.cn(investorAttorneyData.id)){
                formData.append("id", investorAttorneyData.id);
            }

            formData.append("investor_id", localStorage.getItem("id"));
            formData.append("full_name", investorAttorneyData.full_name);
            formData.append("mobile", investorAttorneyData.mobile);
            formData.append('country_id', investorAttorneyData.country.id);

            // call api
            pageService.addInvestorAttorney(formData).then((response) => {
                // Get response
                if (response) {
                    setAddInvestorAttorneyLoader(false);
                    setAddInvestorAttorneyModal(false);
                    setPhoneCode("");
                    setErrors({});
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getInvestorAttorneyFromAPI();
                } else {
                    setAddInvestorAttorneyLoader(false);
                    setAddInvestorAttorneyModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setAddInvestorAttorneyLoader(false);
                setAddInvestorAttorneyModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    return(
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Become An Investors</div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        {
                            convertingDocsList.length > 0 && convertingDocsList.filter((item: any) => item.advocate_sign === "Yes") ?
                                <Button
                                    label="Add Attorney"
                                    className="p-button-primary"
                                    onClick={() => openAddInvestorAttorneyModal()}
                                />
                            :
                                <></>
                        }
                        
                    </div>
                </div>
            </div>
            <div className="card">
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
                                {InvestorConvertingDocsUploadColumns.map((col, i) => {
                                    if (col.field === 'action') {
                                        return (
                                            <Column
                                                key={col.field}
                                                field={col.field}
                                                header={col.header}
                                                body={actionBodyTemplate}
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
                                {InvestorConvertingDocsUploadColumns.map((col, i) => (
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

            {/* Doc upload modal */}
            <Dialog
                visible={docUploadModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={"Upload " + docUploadName}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeDocUploadModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => saveUploadedFile()}
                            loading={docUploadLoader}
                        />
                    </>
                }
                onHide={closeDocUploadModal}
            >
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="doc_url">Upload or Drag & Drop File <span className="required">*</span></label>
                        <FileUpload
                            ref={fileUploadRef}
                            accept="application/pdf"
                            name="doc_file[]"
                            className="imageupload"
                            chooseOptions={chooseOptions}
                            emptyTemplate={emptyTemplate}
                            headerTemplate={headerTemplate}
                            itemTemplate={itemConvertingDocTemplate}
                        ></FileUpload>
                        <small className="p-invalid-txt">{errors['doc_file']}</small>
                    </div>
                </div>
            </Dialog>

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
                    src={APP_BASE_URL + "/investor-pdf-edit?file=" + docEditUrl + "&id=" + docEditId + "&user_id=" + docEditUserId + "&type=investor"}
                    title="webview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />       
            </Dialog>

            {/* Add investor attorney modal */}
            <Dialog
                visible={addInvestorAttorneyModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Add Attorney"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeAddInvestorAttorneyModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addInvestorAttorneyApiCall()}
                            loading={addInvestorAttorneyLoader}
                        />
                    </>
                }
                onHide={closeAddInvestorAttorneyModal}
            >
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="doc_url">Full Name <span className="required">*</span></label>
                        <InputText
                            value={investorAttorneyData?.full_name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Full Name"
                            onChange={(e) => onInputChange(e, "full_name")}
                            className={errors['full_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['full_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Country <span style={{ color: "red" }}>*</span></label>
                        <Dropdown
                            value={investorAttorneyData?.country}
                            name="name"
                            options={countriesList}
                            filter
                            optionLabel="name"
                            placeholder="Select Country"
                            onChange={(e) => onInputChange(e.value, "country")}
                            valueTemplate={selectedCountryTemplate}
                            itemTemplate={countryOptionTemplate}
                            className={errors['country'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['country']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="doc_url">Mobile No. <span className="required">*</span></label>
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                {phonecode !== "" ? phonecode : "+0"}
                            </span>
                            <InputText
                                value={investorAttorneyData?.mobile}
                                keyfilter="int"
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Mobile Number"
                                onChange={(e) => onInputChange(e, "mobile")}
                                className={errors['mobile'] && 'p-invalid'}
                            />
                        </div>
                        <small className="p-invalid-txt">{errors['mobile']}</small>
                    </div>
                </div>
            </Dialog>
        </>
    )
}