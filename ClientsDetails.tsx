import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';

//File Uplaod Components
import { chooseOptions, emptyTemplate, headerTemplate } from '../../../components/ImageUploadComponent/ImageUploadSetting';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { Link } from 'react-router-dom';

export const ClientsDetails = () => {
    document.title = "User Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/clients">Client Lists</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Client Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    const [globalFilter, setGlobalFilter] = useState<any>(null);

    const pageService = new PageService();
    const location = useLocation();
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    // Error object
    const [isError, setIsError] = useState<any>(false);
    const [errors, setErrors] = useState<any>({});

    const [pageLoad, setPageLoad] = useState(false);
    const [tablePageLoad, setTablePageLoad] = useState(false);
    const [clientId, setClientId] = useState<any>();
    const [clientData, setClientData] = useState<any>({});
    const [brochure, setBrochure] = useState<any>();
    const [brochureUploadModal, setBrochureUploadModal] = useState<boolean>(false);
    const [uploadButtonLoading, setUploadButtonLoading] = useState<boolean>(false);

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setClientId(state);
            getClientDetailsFromAPI(state);
        }
    }, []);

    // Get Client Details
    const getClientDetailsFromAPI = async (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleClientDetails(state.client_id)
            .then((response) => {
                // Get response
                if (response) {
                    const responseData = response;
                    setClientData(responseData);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                    setClientData({});
                }
            });
    };

    // for remove brochure
    const onTemplateRemoveBrochure = (callback: any) => {
        setBrochure({});
        callback();
    };

    // for upload brochure
    const itemBrochureTemplate = (file: any, props: any) => {
        setBrochure(file);
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
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={() => onTemplateRemoveBrochure(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // On hide brochure upload modal
    const hideBrochureUploadModal = () => {
        setBrochureUploadModal(false);
        setBrochure({});
    };

    // On upload brochure submit
    const onUploadBrochureSubmit = () => {
        setUploadButtonLoading(true);

        //Request object
        let formRequestData = new FormData();
        formRequestData.append('client_brochure', brochure);
        formRequestData.append('client_id', clientId.client_id);

        // api call for upload brochure
        pageService.uploadClientBrochure(formRequestData).then((result: any) => {
            setErrors(false);
            setBrochureUploadModal(false);
            getClientDetailsFromAPI(clientId.client_id);
            toast.current?.show({ severity: 'success', summary: 'Success', detail: result?.data?.message });
            setUploadButtonLoading(false);
        }).catch(error => {
            if (error) {
                setErrors(false);
                setUploadButtonLoading(false);
                toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response.data.error });
            }
        });
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Client Details {!window.cn(clientData) && clientData?.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : clientData?.status == 1 ? <><Badge value="Active" severity="success"></Badge></> : <><Badge value="Access Revoked" severity="danger"></Badge></>}</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            {/* <Button
                        label="Upload Brochure"
                        icon="pi pi-upload"
                        className="p-button-info mr-2"
                        onClick={() => setBrochureUploadModal(true)}
                    /> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="field col">
                        <div className="grid">
                            <div className="field col-12 flex flex-column">
                                <Image className="img-fluid" src={!window.cn(clientData) ? clientData?.company_logo : ""} alt="Image" width="250" />
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Full Name</div>
                                    <div className="viewcard-text">{!window.cn(clientData) ? clientData?.first_name + " " + clientData?.last_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Email</div>
                                    <div className="viewcard-text">{!window.cn(clientData) ? clientData?.email : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Mobile No.</div>
                                    <div className="viewcard-text">{!window.cn(clientData) ? "+" + clientData?.country?.phonecode + " " + clientData?.mobile : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Company Name</div>
                                    <div className="viewcard-text">{!window.cn(clientData) ? clientData?.company_name : ""}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Brochure Upload Dialog */}
            <Dialog
                visible={brochureUploadModal}
                style={{ width: '150px' }}
                header={"Upload Brochure"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={hideBrochureUploadModal}
                        />

                        <Button
                            label="Upload"
                            icon="pi pi-upload"
                            className="p-button-success"
                            onClick={() => onUploadBrochureSubmit()}
                            loading={uploadButtonLoading}
                        />
                    </>
                }
                onHide={hideBrochureUploadModal}
            >

                <div className="field col-6 md:col-6">
                    <label htmlFor="client_brochure">Brochure</label>
                    <FileUpload
                        ref={fileUploadRef}
                        accept="application/pdf"
                        name="client_brochure[]"
                        className="imageupload"
                        chooseOptions={chooseOptions}
                        emptyTemplate={emptyTemplate}
                        headerTemplate={headerTemplate}
                        itemTemplate={itemBrochureTemplate}
                    ></FileUpload>
                    <small className="p-invalid-txt">{errors['client_brochure']}</small>
                </div>
            </Dialog>

            {/* Loader Start */}
            {
                pageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    )
}