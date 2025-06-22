import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import parse from 'html-react-parser';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { BreadCrumb } from 'primereact/breadcrumb';

//Services
import PageService from '../../../service/PageService';

import { Loader } from '../../../components/Loader/Loader';
import { Link } from 'react-router-dom';

export const CareerJobDetailsView = () => {
    document.title = "Job Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/careers">Careers List</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Job Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [careerId, setCareerId] = useState<any>({});
    const [careerData, setCareerData] = useState<any>({});

    useEffect(() => {
        if (location.state) {
            const state = location.state;
            setCareerId(state);
            getSingleCareerDataFromAPI(state);
        }
    }, []);

    // Get single career data
    const getSingleCareerDataFromAPI = (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleCareerJob(state.career_id)
            .then((response) => {
                // Get response
                if (response) {
                    setCareerData(response);
                    setPageLoad(false);
                } else {
                    setCareerData({});
                    setPageLoad(false);
                }
            });
    };

    return (
        <>
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Job Details {!window.cn(careerData) && careerData["status"] == "Published" ? <><Badge value="Published" severity="success"></Badge></> : <><Badge value="Inactive" severity="warning"></Badge></>}</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search"></div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="field col">
                        <div className="grid">
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Job Title</div>
                                    <div className="viewcard-text">{!window.cn(careerData) ? careerData?.job_title : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Company Name</div>
                                    <div className="viewcard-text">{!window.cn(careerData) ? careerData?.company?.company_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Job Role</div>
                                    <div className="viewcard-text">{!window.cn(careerData) ? careerData?.job_role?.name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Location</div>
                                    <div className="viewcard-text">{!window.cn(careerData) ? careerData?.job_location : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Location</div>
                                    <div className="viewcard-text">{!window.cn(careerData) ? careerData?.job_location : ""}</div>
                                </div>
                            </div>

                            {!window.cn(careerData) && !window.cn(careerData?.salary_from) ?
                                <div className="field col-4 flex flex-column">
                                    <div className="viewcard-box">
                                        <div className="viewcard-title">Salary</div>
                                        <div className="viewcard-text">{!window.cn(careerData) ? careerData?.currency + " " + careerData?.salary_from + " - " + careerData?.salary_to : ""}</div>
                                    </div>
                                </div>
                                :
                                <></>
                            }

                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Experience</div>
                                    <div className="viewcard-text">{!window.cn(careerData) ? careerData?.experience_from + " - " + careerData?.experience_to : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Work Type</div>
                                    <div className="viewcard-text">{!window.cn(careerData) ? careerData?.work_type : ""}</div>
                                </div>
                            </div>
                            <div className="field col-12 flex flex-column">
                                <div className="viewcard-box text-left">
                                    <div className="viewcard-title">Description</div>
                                    <div className="viewcard-text">{!window.cn(careerData) && careerData?.job_description != undefined ? parse(careerData?.job_description) : ""}</div>
                                </div>
                            </div>
                            {
                                !window.cn(careerData) && careerData?.give_task == "Yes" ?
                                    <>
                                        <div className="field col-12 flex flex-column">
                                            <div className="viewcard-box text-left">
                                                <div className="viewcard-title">Task Description</div>
                                                <div className="viewcard-text">{!window.cn(careerData) && careerData?.task_description != undefined ? parse(careerData?.task_description) : ""}</div>
                                            </div>
                                        </div>
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                </div>
            </div>
            {
                pageLoad && <Loader />
            }
        </>
    )
}