import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import parse from 'html-react-parser';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Toast } from 'primereact/toast';
import { Rating } from 'primereact/rating';

//Services
import PageService from '../../../service/PageService';

import {
    applicantStatusChange,
} from '../../../appconfig/Settings';

import { Loader } from '../../../components/Loader/Loader';
import { Link } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';

export const CareerApplicantsDetail = () => {
    document.title = "Applicant Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/applicants">Applicant List</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Applicant Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useRef<any>(null);
    const { id } = useParams<any>();

    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [applicantId, setApplicantId] = useState<any>({});
    const [applicantData, setApplicantData] = useState<any>({});
    const [statusChangePageLoad, setStatusChangePageLoad] = useState(false);
    const [starValue, setStarValue] = useState<any>(null);

    useEffect(() => {
        setApplicantId(id);
        getSingleApplicantDataFromAPI(id);
    }, []);

    // Get single applicant data
    const getSingleApplicantDataFromAPI = (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleApplicantDetails(state)
            .then((response) => {
                // Get response
                if (response) {
                    setApplicantData(response);
                    setPageLoad(false);
                } else {
                    setApplicantData({});
                    setPageLoad(false);
                }
            });
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
                        getSingleApplicantDataFromAPI(id);
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

    return (
        <>
            {/* <Rating value={starValue} onChange={(e) => setStarValue(e.value)} cancel={false} /> */}
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Applicant Details</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <div className="p-toolbar page-header-search-area">
                                <Dropdown
                                    value={{ name: applicantData?.status, code: applicantData?.status }}
                                    onChange={(e) => onApplicantStatusChange(e, id)}
                                    options={applicantStatusChange}
                                    optionLabel="name"
                                ></Dropdown>
                            </div>
                        </div>
                        <Button
                            label='Resume'
                            className="p-button-danger"
                            onClick={() => window.open(applicantData?.resume, "_blank")}
                        />
                        {
                            !window.cn(applicantData) && applicantData?.job_post?.give_task == "Yes" ?
                                <>
                                    <Button
                                        label='Task File'
                                        className="p-button-info"
                                        onClick={() => window.open(applicantData?.task_file, "_blank")}
                                        disabled={applicantData?.task_file !== null && applicantData?.task_file !== "null" && applicantData?.task_file !== "" ? false : true}
                                    />
                                </>
                                :
                                <></>
                        }
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="field col">
                        <div className="grid">
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Applicant Name</div>
                                    <div className="viewcard-text">{!window.cn(applicantData) ? applicantData?.first_name + " " + applicantData?.last_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Email</div>
                                    <div className="viewcard-text">{!window.cn(applicantData) ? applicantData?.email : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Mobile Number</div>
                                    <div className="viewcard-text">{!window.cn(applicantData) ? applicantData?.mobile : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Job Title</div>
                                    <div className="viewcard-text">{!window.cn(applicantData) ? applicantData?.job_post?.job_title : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Company Name</div>
                                    <div className="viewcard-text">{!window.cn(applicantData) ? applicantData?.company?.company_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Job Role</div>
                                    <div className="viewcard-text">{!window.cn(applicantData) ? applicantData?.job_post?.job_role?.name : ""}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {
                applicantData?.resume !== undefined ? 
                    <div className="card">
                        <div className="card-body">
                            <iframe
                                src={applicantData?.resume}
                                title="webview"
                                style={{ width: '100%', height: '700px', border: 'none' }}
                            />
                        </div>
                    </div>
                :
                    <></>
            }
            
            {
                pageLoad && <Loader />
            }
        </>
    )
}