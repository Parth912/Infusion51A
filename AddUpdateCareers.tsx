import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Editor } from 'primereact/editor';
import { Checkbox } from 'primereact/checkbox';
import { BreadCrumb } from 'primereact/breadcrumb';

//Services
import PageService from '../../../service/PageService';

import { Loader } from '../../../components/Loader/Loader';
import { jobPostValidate } from '../../../config/Validate';
import { currencyDropDown, workTypeDropdown } from '../../../appconfig/Settings';
import { Link } from 'react-router-dom';

export const AddUpdateCareers = () => {
    document.title = "Job Post | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/careers">Careers List</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">{editId !== null ? "Edit Job Details" : "Add New Job"}</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    // Page service
    const pageService = new PageService();

    // Error object
    const [errors, setErrors] = useState<any>({});

    const toast = useRef<any>(null);
    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [editId, setEditId] = useState<any>(null);
    const [jobPostData, setJobPostData] = useState<any>({ "give_task": "" });
    const [jobRoles, setJobRoles] = useState<any>([]);
    const [jobCompanies, setJobCompanies] = useState<any>([]);
    const [jobDescription, setJobDescription] = useState<any>('');
    const [taskDescription, setTaskDescription] = useState<any>('');
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

    useEffect(() => {
        if (location.state) {
            const state = location.state;
            setEditId(state);
            getSingleCareerData(state);
        }
        getJobRolesFromAPI();
        if (localStorage.getItem('user_type') == "admin") {
            getJobCompaniesFromAPI();
        }
    }, []);

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
                        setJobRoles(DataList);
                    }
                } else {
                    setJobRoles([]);
                }
            });
    };

    // Get single career data
    const getSingleCareerData = (state: any) => {
        // Api call
        pageService
            .getSingleCareerJob(state.career_id)
            .then((response) => {
                // Get response
                if (response) {
                    setJobPostData({
                        "job_title": response?.job_title,
                        "job_company": { code: response?.company?.id, name: response?.company?.company_name },
                        "job_role": { code: response?.job_role?.id, name: response?.job_role?.name },
                        "job_location": response?.job_location,
                        "salary_from": response?.salary_from,
                        "salary_to": response?.salary_to,
                        "experience_from": response?.experience_from,
                        "experience_to": response?.experience_to,
                        "give_task": response?.give_task == "No" ? "" : "Yes",
                        "work_type": { code: response?.work_type, name: response?.work_type },
                        "currency": { code: response?.currency, name: response?.currency }
                    });

                    setJobDescription(response?.job_description);

                    if (response?.give_task == "Yes") {
                        setTaskDescription(response?.task_description);
                    }
                } else {
                    setJobPostData({});
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
                        setJobCompanies(DataList);
                    }
                } else {
                    setJobCompanies([]);
                }
            });
    };

    //On Change Job Post Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == 'job_role') {
            val = e.value || '';
        } else if (name == 'give_task') {
            if (e.checked) {
                val = e.value || '';
            } else {
                val = "";
            }
        } else {
            val = (e.target && e.target.value) || '';
        }
        setJobPostData({ ...jobPostData, [name]: val });
    };

    // On submit
    const onSubmit = () => {
        const { errors, isError } = jobPostValidate(jobPostData, jobDescription, taskDescription);
        setErrors(errors);
        try {
            if (!isError) {
                setSubmitLoading(true);

                let formData = new FormData();

                if (editId !== null) {
                    formData.append('id', editId.career_id);
                }

                formData.append('job_title', jobPostData?.job_title);
                if (localStorage.getItem("user_type") == "admin") {
                    formData.append('job_company', jobPostData?.job_company?.code);
                }
                formData.append('work_type', jobPostData?.work_type?.code);
                formData.append('job_role', jobPostData?.job_role?.code);
                formData.append('job_description', jobDescription);
                formData.append('job_location', jobPostData?.job_location);

                if (!window.cn(jobPostData?.salary_from)) {
                    formData.append('salary_from', jobPostData?.salary_from);
                }

                if (!window.cn(jobPostData?.salary_to)) {
                    formData.append('salary_to', jobPostData?.salary_to);
                }
                formData.append('currency', jobPostData?.currency?.code);

                formData.append('experience_from', jobPostData?.experience_from);
                formData.append('experience_to', jobPostData?.experience_to);
                formData.append('give_task', jobPostData?.give_task);

                if (jobPostData?.give_task != "") {
                    formData.append('task_description', taskDescription);
                } else {
                    formData.append('give_task', "No");
                }

                // call api
                pageService.addUpdateCareerJobs(formData).then((response) => {
                    // Get response
                    if (response) {
                        setSubmitLoading(false);
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.data.message,
                        });
                        setTimeout(() => {
                            navigate('/careers');
                        }, 1000);
                    } else {
                        setSubmitLoading(false);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Something went wrong, Please try again.',
                        });
                    }
                });
            }
        } catch (error: any) {
            setSubmitLoading(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.error,
            });
        }

    };

    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> {editId !== null ? "Edit Job Details" : " Add New Job"}</div>
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
                    <div className="p-fluid formgrid grid">
                        {
                            localStorage.getItem("user_type") == "admin" ?
                                <>
                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="job_company">Company <span className="required">*</span></label>
                                        <Dropdown
                                            filter
                                            value={jobPostData?.job_company}
                                            onChange={(e) => onInputChange(e, 'job_company')}
                                            options={jobCompanies}
                                            optionLabel="name"
                                            name="job_company"
                                            placeholder="Select Company"
                                            className={errors['job_company'] && 'p-invalid'}
                                        ></Dropdown>
                                        <small className="p-invalid-txt">{errors['job_company']}</small>
                                    </div>
                                </>
                                :
                                <></>
                        }

                        <div className="field col-12 md:col-4">
                            <label htmlFor="job_title">Job Title <span className="required">*</span></label>
                            <InputText
                                value={jobPostData?.job_title}
                                name="job_title"
                                placeholder='Enter Job Title'
                                autoComplete="off"
                                onChange={(e) => onInputChange(e, 'job_title')}
                                className={errors['job_title'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['job_title']}</small>
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="job_role">Job Role <span className="required">*</span></label>
                            <Dropdown
                                filter
                                value={jobPostData?.job_role}
                                onChange={(e) => onInputChange(e, 'job_role')}
                                options={jobRoles}
                                optionLabel="name"
                                name="job_role"
                                placeholder="Select Job Role"
                                className={errors['job_role'] && 'p-invalid'}
                            ></Dropdown>
                            <small className="p-invalid-txt">{errors['job_role']}</small>
                        </div>

                        <div className="field col-12 md:col-12">
                            <label htmlFor="job_description">Job Description <span className="required">*</span></label>
                            <Editor
                                value={jobDescription}
                                onTextChange={(e) => setJobDescription(e.htmlValue)}
                                style={{ height: '220px' }}
                            />
                            <small className="p-invalid-txt">{errors['job_description']}</small>
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="job_location">Job Location <span className="required">*</span></label>
                            <InputText
                                value={jobPostData?.job_location}
                                name="job_location"
                                placeholder='Enter Job Location'
                                autoComplete="off"
                                onChange={(e) => onInputChange(e, 'job_location')}
                                className={errors['job_location'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['job_location']}</small>
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="experience_range">Required Experience <span className="required">*</span></label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">From</span>
                                <InputText
                                    value={jobPostData?.experience_from}
                                    keyfilter="money"
                                    name="experience_from"
                                    autoComplete="off"
                                    onChange={(e) => onInputChange(e, 'experience_from')}
                                    className={errors['experience_from'] && 'p-invalid'}
                                />
                            </div>
                            <small className="p-invalid-txt">{errors['experience_from']}</small>
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="experience_range"></label>
                            <div className="p-inputgroup flex-1 mt-2">
                                <span className="p-inputgroup-addon">To</span>
                                <InputText
                                    value={jobPostData?.experience_to}
                                    keyfilter="money"
                                    name="experience_to"
                                    autoComplete="off"
                                    onChange={(e) => onInputChange(e, 'experience_to')}
                                    className={errors['experience_to'] && 'p-invalid'}
                                />
                            </div>
                            <small className="p-invalid-txt">{errors['experience_to']}</small>
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="salary_range">Salary Range</label>
                            <div className="p-inputgroup flex-1">
                                <span className="p-inputgroup-addon">From</span>
                                <InputText
                                    value={jobPostData?.salary_from}
                                    keyfilter="money"
                                    name="salary_from"
                                    autoComplete="off"
                                    onChange={(e) => onInputChange(e, 'salary_from')}
                                    className={errors['salary_from'] && 'p-invalid'}
                                />
                            </div>
                            <small className="p-invalid-txt">{errors['salary_from']}</small>
                        </div>

                        <div className="field col-12 md:col-2">
                            <label htmlFor="salary_range"></label>
                            <div className="p-inputgroup flex-1 mt-2">
                                <span className="p-inputgroup-addon">To</span>
                                <InputText
                                    value={jobPostData?.salary_to}
                                    keyfilter="money"
                                    name="salary_to"
                                    autoComplete="off"
                                    onChange={(e) => onInputChange(e, 'salary_to')}
                                    className={errors['salary_to'] && 'p-invalid'}
                                />
                            </div>
                            <small className="p-invalid-txt">{errors['salary_to']}</small>
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="currency">Currency <span className="required">*</span></label>
                            <Dropdown
                                filter
                                value={jobPostData?.currency}
                                onChange={(e) => onInputChange(e, 'currency')}
                                options={currencyDropDown}
                                optionLabel="name"
                                name="currency"
                                placeholder="Select Currency"
                                className={errors['currency'] && 'p-invalid'}
                            ></Dropdown>
                            <small className="p-invalid-txt">{errors['currency']}</small>
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="work_type">Work Type <span className="required">*</span></label>
                            <Dropdown
                                filter
                                value={jobPostData?.work_type}
                                onChange={(e) => onInputChange(e, 'work_type')}
                                options={workTypeDropdown}
                                optionLabel="name"
                                name="work_type"
                                placeholder="Select Work Type"
                                className={errors['work_type'] && 'p-invalid'}
                            ></Dropdown>
                            <small className="p-invalid-txt">{errors['work_type']}</small>
                        </div>

                        <div className="field col-12 md:col-12 mt-3">
                            <div className="flex align-items-center">
                                <Checkbox
                                    inputId="give_task"
                                    name="give_task"
                                    value="Yes"
                                    onChange={(e) => onInputChange(e, 'give_task')}
                                    checked={jobPostData?.give_task == "Yes" ? true : false}
                                />
                                <label htmlFor="give_task" className="ml-2">Want to give task task to the applicant while applying for this job?</label>
                            </div>
                            {
                                !window.cn(jobPostData) && jobPostData?.give_task == "Yes" ?
                                    <>
                                        <br />
                                        <label htmlFor="task_description">Task Description <span className="required">*</span></label>
                                        <Editor
                                            value={taskDescription}
                                            onTextChange={(e) => setTaskDescription(e.htmlValue)}
                                            style={{ height: '220px' }}
                                        />
                                        <small className="p-invalid-txt">{errors['task_description']}</small>
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <div className="button-group">
                        <Button label={editId !== null ? "Update" : "Save"} loading={submitLoading} onClick={onSubmit} />
                    </div>
                </div>
            </div>
            {
                pageLoad && <Loader />
            }
        </>
    );
}