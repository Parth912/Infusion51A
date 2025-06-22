import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

//Prime React Component Inbuilt
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { Chips } from "primereact/chips";
import { BreadCrumb } from 'primereact/breadcrumb';

//Services
import PageService from '../../../service/PageService';
import { ceEngagementStatusDropDown } from '../../../appconfig/Settings';
import { Loader } from '../../../components/Loader/Loader';
import { chooseOptions, emptyTemplate, headerTemplate } from '../../../components/ImageUploadComponent/ImageUploadSetting';
import { addLeadsExcelValidate, addLeadsValidate } from '../../../config/Validate';

export const AddLeads = () => {
    document.title = "Add Leads | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/personal-broker-leads">Lead Generators</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Add Leads</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    const hasFetchedData = useRef(false);
    const toast = useRef<any>(null);

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    // Page service
    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [leadGen, setLeadGen] = useState<any>([]);
    const [broker, setBroker] = useState<any>([]);
    const [leadData, setLeadData] = useState<any>({});
    const [errors, setErrors] = useState<any>({});
    const [humanCapital, setHumanCapital] = useState<boolean>(false);
    const [investmentOpportunity, setInvestmentOpportunity] = useState<boolean>(false);
    const [vendor, setVendor] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [standardTitle, setStandardTitle] = useState<any>([]);
    const [industry, setIndustry] = useState<any>([]);
    const [rating, setRating] = useState<any>([]);
    const [priority, setPriority] = useState<any>([]);
    const [leadSource, setLeadSource] = useState<any>([]);
    const [leadStage, setLeadStage] = useState<any>([]);
    const [leadStatus, setLeadStatus] = useState<any>([]);
    const [phoneValidator, setPhoneValidator] = useState<any>([]);
    const [callStage, setCallStage] = useState<any>([]);
    const [callType, setCallType] = useState<any>([]);
    const [lastCallDisposition, setLastCallDisposition] = useState<any>([]);
    const [uploadModal, setUploadModal] = useState<boolean>(false);
    const [uploadLoader, setUploadLoader] = useState<boolean>(false);
    const [leadFile, setLeadFile] = useState<any>("");
    const [tags, setTags] = useState<any>([]);
    const [companies, setCompanies] = useState<any>([]);

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getAssignedUserFromApi("leadgen", localStorage.getItem("id"));
        getFiedDropDownValuesFromAPI();
    }, []);

    // Get assigned user from api
    const getAssignedUserFromApi = (type: any, id: any) => {

        // Api call
        pageService
            .getAssignedUsers(type, id)
            .then((response) => {
                // Get response
                if (response) {
                    let tempResponseArr: any = [];
                    if (response.type == "leadgen") {
                        response.data.map((item: any, index: any) => {
                            tempResponseArr.push({
                                "code": item.leadgen.id,
                                "name": item.leadgen.first_name + " " + item.leadgen.last_name
                            });
                        });
                        setLeadGen(tempResponseArr);
                    } else if (response.type == "broker") {
                        response.data.map((item: any, index: any) => {
                            tempResponseArr.push({
                                "code": item.broker.id,
                                "name": item.broker.first_name + " " + item.broker.last_name
                            });
                        });
                        setBroker(tempResponseArr);
                    }
                }
            });
    };

    // Get field dropdown values
    const getFiedDropDownValuesFromAPI = () => {
        setPageLoad(true);
        // Api call
        pageService
            .getZohoFormFields()
            .then((response) => {
                // Get response
                if (response) {
                    setStandardTitle(response?.Standard_Title);
                    setIndustry(response?.Industry);
                    setRating(response?.Rating);
                    setPriority(response?.Priority);
                    setLeadSource(response?.Lead_Source);
                    if (localStorage.getItem('user_type') == "datascrapper") {
                        setLeadData({ ...leadData, Lead_Source: { code: "Data Scrapping", name: "Data Scrapping" } });
                    }
                    setLeadStage(response?.Lead_Stage);
                    setLeadStatus(response?.Lead_Status);
                    setCallStage(response?.Call_Stage);
                    setCallType(response?.Call_Type);
                    setLastCallDisposition(response?.Last_Call_Disposition);
                    setPhoneValidator(response?.Phone_Validator_Pick);
                    setCompanies(response?.Company);
                    setPageLoad(false);
                } else {
                    setStandardTitle([]);
                    setIndustry([]);
                    setPageLoad(false);
                }
            });
    };

    // Get company details
    const getCompanyDetails = (id: any, val: any) => {
        setPageLoad(true);

        // Api call
        pageService
            .getSingleLead(id, "company")
            .then((response) => {
                // Get response
                if (response) {
                    let tempLeadData = leadData;
                    tempLeadData["Company"] = val;
                    tempLeadData["Annual_Revenue"] = response["Annual_Revenue"];
                    tempLeadData["No_of_Employees"] = response["No_of_Employees"];
                    tempLeadData["Website"] = response["Website"];
                    tempLeadData["Country"] = response["Country"];
                    tempLeadData["State"] = response["State"];
                    tempLeadData["City"] = response["City"];
                    tempLeadData["Address"] = response["Address"];
                    tempLeadData["Address_2"] = response["Address_2"];
                    tempLeadData["Zip_Code"] = response["Zip_Code"];
                    tempLeadData["Facebook"] = response["Facebook"];
                    tempLeadData["Instagram"] = response["Instagram"];
                    tempLeadData["LinkedIn"] = response["LinkedIn"];
                    tempLeadData["Twitter_URL"] = response["Twitter_URL"];
                    tempLeadData["Tik_Tok"] = response["Tik_Tok"];
                    setLeadData(tempLeadData);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                }
            });
    };

    //On Change Job Post Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name === "CE_Engagement_Status" || name === "Standard_Title" || name === "Industry" || name === "Rating" || name === "Priority" || name === "Lead_Source" || name === "Lead_Stage" || name === "Lead_Status" || name === "Review_Information" || name === "Information_Status" || name === "Call_Stage" || name === "Call_Type" || name === "Last_Call_Disposition" || name === "leadgen_id" || name === "broker_id" || name === "Phone_Validator_Pick" || name === "leadgen_id_modal" || name === "broker_id_modal" || name === "Company") {
            val = e;
            // If lead generator selected then get broker list for dropdown
            if (name == "leadgen_id" || name == "leadgen_id_modal") {
                getAssignedUserFromApi("broker", val.code);
            }

            // If company selected then get that company details
            if (name == "Company" && val.code !== "Other") {
                getCompanyDetails(val.code, val);
            }
        } else {
            val = (e.target && e.target.value) || '';
        }
        setLeadData({ ...leadData, [name]: val });
    };

    // On submit api call
    const onSubmitApiCall = () => {
        const { errors, isError } = addLeadsValidate(leadData);
        setErrors(errors);
        if (!isError) {
            setSubmitLoading(true);

            // request data
            let formData = new FormData();
            if (humanCapital == true) {
                formData.append('Human_Capital', "Yes");
            }

            if (investmentOpportunity == true) {
                formData.append('Investment_Opportunity', "Yes");
            }

            if (vendor == true) {
                formData.append('Vendor', "Yes");
            }

            // Set tags as comma saperated string
            if (tags.length > 0) {
                formData.append("tags", tags.toString());
            }

            // Set user_type
            let userType: any = localStorage.getItem('user_type');
            formData.append("type", userType);

            // Set other data depending on the dropdown and text field
            Object.keys(leadData).forEach((item) => {
                if (item === "CE_Engagement_Status" || item === "Standard_Title" || item === "Industry" || item === "Rating" || item === "Priority" || item === "Lead_Source" || item === "Lead_Stage" || item === "Lead_Status" || item === "Review_Information" || item === "Information_Status" || item === "Call_Stage" || item === "Call_Type" || item === "Last_Call_Disposition" || item === "leadgen_id" || item === "broker_id" || item === "Phone_Validator_Pick" || item === "leadgen_id_modal" || item === "broker_id_modal" || item === "Company") {
                    if (item === "Company") {
                        formData.append(item, leadData[item]?.name);
                    } else {
                        formData.append(item, leadData[item]?.code);
                    }
                } else {
                    if (leadData[item] !== "" && leadData[item] !== null && leadData[item] !== undefined){
                        formData.append(item, leadData[item]);
                    }
                }
            });

            // call api
            pageService.addLead(formData).then((response) => {
                // Get response
                if (response) {
                    setSubmitLoading(false);
                    setLeadData({});
                    setHumanCapital(false);
                    setInvestmentOpportunity(false);
                    setVendor(false);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    if (localStorage.getItem("user_type") == "broker") {
                        setTimeout(() => {
                            navigate('/personal-broker-leads');
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            navigate('/leads');
                        }, 1000);
                    }
                } else {
                    setSubmitLoading(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setSubmitLoading(false);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.message,
                });
            });
        }
    };

    // Upload modal handle change
    const uploadModalHandleChange = () => {
        setUploadModal(true);
    };

    // Hide upload modal
    const hideUploadModal = () => {
        setLeadFile("");
        setLeadData({});
        setUploadModal(false);
        setUploadLoader(false);
    };

    // for remove lead file
    const onTemplateRemoveLeadFileo = (callback: any) => {
        setLeadFile({});
        callback();
    };

    // for upload lead file
    const itemLeadFileTemplate = (file: any, props: any) => {
        setLeadFile(file);
        removeFile.current = props.onRemove;
        return (
            <>
                <div className="flex align-items-center flex-wrap">
                    <div className="flex align-items-center" style={{ width: '100%' }}>
                        {/* <img
                            alt={file.name}
                            role="presentation"
                            src={file.objectURL}
                            width={100}
                        /> */}
                        <div className="flex" style={{ alignItems: "center" }}>
                            <span className="mr-3">{file.name}</span>
                            <Button
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={() => onTemplateRemoveLeadFileo(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Upload excel data
    const uploadExcelData = () => {
        const { errors, isError } = addLeadsExcelValidate(leadData, leadFile);
        setErrors(errors);
        if (!isError) {
            setUploadLoader(true);

            // request data
            let formData = new FormData();

            if (localStorage.getItem('user_type') == "datascrapper") {
                formData.append("type", "datascrapper");
            }

            formData.append("file", leadFile);

            // call api
            pageService.addLeadsByExcel(formData).then((response) => {
                // Get response
                if (response) {
                    setLeadFile("");
                    setLeadData({});
                    setUploadLoader(false);
                    setUploadModal(false);
                    setHumanCapital(false);
                    setInvestmentOpportunity(false);
                    setVendor(false);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    setUploadLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setUploadLoader(false);
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
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Add Lead</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            {/* <Button label="Upload Excel / CSV" className="p-button" onClick={() => uploadModalHandleChange()} /> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="card-title-box">
                        <h3 className="card-title">Select Lead Geneartor and Broker To Add Data Under</h3>
                    </div>
                </div>
                <div className="card-body">
                    <div className="p-fluid formgrid grid">
                        {
                            localStorage.getItem("user_type") == "datascrapper" ?
                                <>
                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="name">Lead Generator <span style={{ color: "red" }}>*</span></label>
                                        <Dropdown
                                            value={leadData?.leadgen_id}
                                            name="name"
                                            options={leadGen}
                                            filter
                                            optionLabel="name"
                                            placeholder="Select Lead Generator"
                                            onChange={(e) => onInputChange(e.value, "leadgen_id")}
                                            className={errors['leadgen_id'] && 'p-invalid'}
                                        />
                                        <small className="p-invalid-txt">{errors['leadgen_id']}</small>
                                    </div>

                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="name">Broker <span style={{ color: "red" }}>*</span></label>
                                        <Dropdown
                                            value={leadData?.broker_id}
                                            name="name"
                                            options={broker}
                                            filter
                                            optionLabel="name"
                                            placeholder="Select Broker"
                                            onChange={(e) => onInputChange(e.value, "broker_id")}
                                            className={errors['broker_id'] && 'p-invalid'}
                                        />
                                        <small className="p-invalid-txt">{errors['broker_id']}</small>
                                    </div>
                                </>
                                :
                                <></>
                        }

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">List Name <span style={{ color: "red" }}>*</span></label>
                            <InputText
                                value={leadData?.List_Name}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter List Name"
                                onChange={(e) => onInputChange(e, "List_Name")}
                                className={errors['List_Name'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['List_Name']}</small>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="card-body">
                    <h5>Modules and Engagement Status</h5><br />
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">CE Engagement Status <span style={{ color: "red" }}>*</span></label>
                            <Dropdown
                                value={leadData?.CE_Engagement_Status}
                                name="name"
                                options={ceEngagementStatusDropDown}
                                filter
                                optionLabel="name"
                                placeholder="Select Engagement Status"
                                onChange={(e) => onInputChange(e.value, "CE_Engagement_Status")}
                                className={errors['CE_Engagement_Status'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['CE_Engagement_Status']}</small>
                        </div>
                    </div>
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="Human_Capital"
                            name="Human_Capital"
                            value="Yes"
                            onChange={e => setHumanCapital(e.checked)}
                            checked={humanCapital}
                        />
                        <label htmlFor="Human_Capital" className="ml-2">Human Capital</label>
                    </div>
                    <div className="flex align-items-center mt-2">
                        <Checkbox
                            inputId="Investment_Opportunity"
                            name="Investment_Opportunity"
                            value="Yes"
                            onChange={e => setInvestmentOpportunity(e.checked)}
                            checked={investmentOpportunity}
                        />
                        <label htmlFor="Investment_Opportunity" className="ml-2">Investment Opportunity</label>
                    </div>
                    <div className="flex align-items-center mt-2">
                        <Checkbox
                            inputId="Vendor"
                            name="Vendor"
                            value="Yes"
                            onChange={e => setVendor(e.checked)}
                            checked={vendor}
                        />
                        <label htmlFor="Vendor" className="ml-2">Vendor</label>
                    </div>
                </div>
                <hr />
                <div className="card-body">
                    <h5>Lead Information</h5><br />
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Tags <span style={{ color: "red" }}>*</span></label>
                            <Chips
                                value={tags}
                                onChange={(e) => setTags(e.value)}
                            />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">First Name <span style={{ color: "red" }}>*</span></label>
                            <InputText
                                value={leadData?.First_Name}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter First Name"
                                onChange={(e) => onInputChange(e, "First_Name")}
                                className={errors['First_Name'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['First_Name']}</small>
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Last Name <span style={{ color: "red" }}>*</span></label>
                            <InputText
                                value={leadData?.Last_Name}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Last Name"
                                onChange={(e) => onInputChange(e, "Last_Name")}
                                className={errors['Last_Name'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['Last_Name']}</small>
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Select Company <span style={{ color: "red" }}>*</span></label>
                            <Dropdown
                                value={leadData?.Company}
                                name="name"
                                options={companies}
                                filter
                                optionLabel="name"
                                placeholder="Select Company"
                                onChange={(e) => onInputChange(e.value, "Company")}
                            />
                            <small className="p-invalid-txt">{errors['Company']}</small>
                        </div>

                        {
                            leadData?.Company?.code === "Other" ?
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Company Name <span style={{ color: "red" }}>*</span></label>
                                    <InputText
                                        value={leadData?.Company_Other}
                                        name="name"
                                        autoComplete="off"
                                        placeholder="Enter Company Name"
                                        onChange={(e) => onInputChange(e, "Company_Other")}
                                    />
                                </div>
                                :
                                <></>
                        }

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Email</label>
                            <InputText
                                value={leadData?.Email}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Email"
                                onChange={(e) => onInputChange(e, "Email")}
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Secondary Email</label>
                            <InputText
                                value={leadData?.Secondary_Email}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Secondary Email"
                                onChange={(e) => onInputChange(e, "Secondary_Email")}
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Email (Work)</label>
                            <InputText
                                value={leadData?.Email_Work}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Work Email"
                                onChange={(e) => onInputChange(e, "Email_Work")}
                            />
                        </div>

                        {
                            localStorage.getItem("user_type") == "broker" ?
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Standard Title</label>
                                    <Dropdown
                                        value={leadData?.Standard_Title}
                                        name="name"
                                        options={standardTitle}
                                        filter
                                        optionLabel="name"
                                        placeholder="Select Standard Title"
                                        onChange={(e) => onInputChange(e.value, "Standard_Title")}
                                    />
                                </div>
                                :
                                <></>
                        }


                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Title</label>
                            <InputText
                                value={leadData?.Title}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Title"
                                onChange={(e) => onInputChange(e, "Title")}
                            />
                        </div>

                        {
                            localStorage.getItem("user_type") == "broker" ?
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Phone Validator</label>
                                    <Dropdown
                                        value={leadData?.Phone_Validator_Pick}
                                        name="name"
                                        options={phoneValidator}
                                        filter
                                        optionLabel="name"
                                        placeholder="Select Phone Validator"
                                        onChange={(e) => onInputChange(e.value, "Phone_Validator_Pick")}
                                    />
                                </div>
                                :
                                <></>
                        }

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Cell Phone</label>
                            <InputText
                                value={leadData?.Phone}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Phone No."
                                onChange={(e) => onInputChange(e, "Phone")}
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Direct Phone</label>
                            <InputText
                                value={leadData?.Phone_Home}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Home Phone No."
                                onChange={(e) => onInputChange(e, "Phone_Home")}
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Phone (Work)</label>
                            <InputText
                                value={leadData?.Phone_Work}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Work Phone No."
                                onChange={(e) => onInputChange(e, "Phone_Work")}
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Salary</label>
                            <InputText
                                value={leadData?.Salary}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Salary"
                                onChange={(e) => onInputChange(e, "Salary")}
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Industry</label>
                            <Dropdown
                                value={leadData?.Industry}
                                name="name"
                                options={industry}
                                filter
                                optionLabel="name"
                                placeholder="Select Industry"
                                onChange={(e) => onInputChange(e.value, "Industry")}
                            />
                        </div>

                        {
                            leadData?.Industry?.code === "Other" ?
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Industry (Other)</label>
                                    <InputText
                                        value={leadData?.Industry_Other}
                                        name="name"
                                        autoComplete="off"
                                        placeholder="Enter Industry (Other)"
                                        onChange={(e) => onInputChange(e, "Industry_Other")}
                                    />
                                </div>
                                :
                                <></>
                        }

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Annual Revenue</label>
                            <InputText
                                value={leadData?.Annual_Revenue}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Annual Revenue"
                                onChange={(e) => onInputChange(e, "Annual_Revenue")}
                            />
                        </div>

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">No. Of Employees</label>
                            <InputText
                                type='number'
                                value={leadData?.No_of_Employees}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter No. Of Employees"
                                onChange={(e) => onInputChange(e, "No_of_Employees")}
                            />
                        </div>

                        {
                            localStorage.getItem("user_type") == "broker" ?
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Net Worth</label>
                                    <InputText
                                        value={leadData?.Net_Worth}
                                        name="name"
                                        autoComplete="off"
                                        placeholder="Enter Net Worth"
                                        onChange={(e) => onInputChange(e, "Net_Worth")}
                                    />
                                </div>
                                :
                                <></>
                        }

                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Website</label>
                            <InputText
                                value={leadData?.Website}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Website"
                                onChange={(e) => onInputChange(e, "Website")}
                            />
                        </div>

                        {
                            localStorage.getItem("user_type") == "broker" ?
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Birth Date</label>
                                    <Calendar
                                        placeholder='Select Birth Date'
                                        value={leadData?.Birthdate}
                                        onChange={(e) => onInputChange(e.value, "Birthdate")}
                                        dateFormat="yy-mm-dd"
                                    />
                                </div>
                                :
                                <></>
                        }
                    </div>
                </div>
                {
                    localStorage.getItem("user_type") == "broker" || localStorage.getItem("user_type") == "leadgen" ?
                        <>
                            <hr />
                            <div className="card-body">
                            <h5>Lead Conversion Status</h5><br />
                            <div className="p-fluid formgrid grid">
                                {
                                    localStorage.getItem("user_type") == "broker" || localStorage.getItem("user_type") == "leadgen" ?
                                        <>
                                            <div className="field col-12 md:col-4">
                                                <label htmlFor="name">Priority</label>
                                                <Dropdown
                                                    value={leadData?.Priority}
                                                    name="name"
                                                    options={priority}
                                                    filter
                                                    optionLabel="name"
                                                    placeholder="Select Priority"
                                                    onChange={(e) => onInputChange(e.value, "Priority")}
                                                />
                                            </div>

                                            <div className="field col-12 md:col-4">
                                                <label htmlFor="name">Lead Source</label>
                                                <Dropdown
                                                    value={leadData?.Lead_Source}
                                                    name="name"
                                                    options={leadSource}
                                                    filter
                                                    optionLabel="name"
                                                    placeholder="Select Lead Source"
                                                    onChange={(e) => onInputChange(e.value, "Lead_Source")}
                                                    disabled={localStorage.getItem("user_type") == "datascrapper" ? true : false}
                                                />
                                            </div>

                                            <div className="field col-12 md:col-4">
                                                <label htmlFor="name">Lead Stage</label>
                                                <Dropdown
                                                    value={leadData?.Lead_Stage}
                                                    name="name"
                                                    options={leadStage}
                                                    filter
                                                    optionLabel="name"
                                                    placeholder="Select Lead Stage"
                                                    onChange={(e) => onInputChange(e.value, "Lead_Stage")}
                                                />
                                            </div>

                                            <div className="field col-12 md:col-4">
                                                <label htmlFor="name">Lead Status</label>
                                                <Dropdown
                                                    value={leadData?.Lead_Status}
                                                    name="name"
                                                    options={leadStatus}
                                                    filter
                                                    optionLabel="name"
                                                    placeholder="Select Lead Status"
                                                    onChange={(e) => onInputChange(e.value, "Lead_Status")}
                                                />
                                            </div>
                                        </>
                                        :
                                        <></>
                                }

                                {
                                    localStorage.getItem("user_type") == "broker" ?
                                        <>
                                            <div className="field col-12 md:col-4">
                                                <label htmlFor="name">Rating</label>
                                                <Dropdown
                                                    value={leadData?.Rating}
                                                    name="name"
                                                    options={rating}
                                                    filter
                                                    optionLabel="name"
                                                    placeholder="Select Rating"
                                                    onChange={(e) => onInputChange(e.value, "Rating")}
                                                />
                                            </div>

                                            <div className="field col-12 md:col-4">
                                                <label htmlFor="name">Potential Investment Amount</label>
                                                <InputText
                                                    value={leadData?.Investment_Amount}
                                                    name="name"
                                                    autoComplete="off"
                                                    placeholder="Enter Potential Investment Amount"
                                                    onChange={(e) => onInputChange(e, "Investment_Amount")}
                                                />
                                            </div>

                                            <div className="field col-12 md:col-4">
                                                <label htmlFor="name">Conversion Strategy</label>
                                                <InputText
                                                    value={leadData?.Conversion_Strategy}
                                                    name="name"
                                                    autoComplete="off"
                                                    placeholder="Enter Conversion Strategy"
                                                    onChange={(e) => onInputChange(e, "Conversion_Strategy")}
                                                />
                                            </div>
                                        </>
                                        :
                                        <></>
                                }
                            </div>
                            </div>
                        </>
                        :
                        <></>
                }

                <hr />

                {
                    localStorage.getItem("user_type") == "broker" ?
                        <>
                        <div className="card-body">
                            <h5>Last Call Status</h5><br />
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Call Stage</label>
                                    <Dropdown
                                        value={leadData?.Call_Stage}
                                        name="name"
                                        options={callStage}
                                        filter
                                        optionLabel="name"
                                        placeholder="Select Call Stage"
                                        onChange={(e) => onInputChange(e.value, "Call_Stage")}
                                    />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Call Type</label>
                                    <Dropdown
                                        value={leadData?.Call_Type}
                                        name="name"
                                        options={callType}
                                        filter
                                        optionLabel="name"
                                        placeholder="Select Call Type"
                                        onChange={(e) => onInputChange(e.value, "Call_Type")}
                                    />
                                </div>

                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Last Call Disposition</label>
                                    <Dropdown
                                        value={leadData?.Last_Call_Disposition}
                                        name="name"
                                        options={lastCallDisposition}
                                        filter
                                        optionLabel="name"
                                        placeholder="Select Last Call Disposition"
                                        onChange={(e) => onInputChange(e.value, "Last_Call_Disposition")}
                                    />
                                </div>
                            </div>
                            </div>
                            <hr />
                        </>
                        :
                        <></>
                }
<div className="card-body">
                <h5>Company Address Information</h5><br />
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Country</label>
                        <InputText
                            value={leadData?.Country}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Country"
                            onChange={(e) => onInputChange(e, "Country")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">State</label>
                        <InputText
                            value={leadData?.State}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter State"
                            onChange={(e) => onInputChange(e, "State")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">City</label>
                        <InputText
                            value={leadData?.City}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter City"
                            onChange={(e) => onInputChange(e, "City")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Address 1</label>
                        <InputText
                            value={leadData?.Address}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Address 1"
                            onChange={(e) => onInputChange(e, "Address")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Address 2</label>
                        <InputText
                            value={leadData?.Address_2}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Address 2"
                            onChange={(e) => onInputChange(e, "Address_2")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Zip Code</label>
                        <InputText
                            value={leadData?.Zip_Code}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Zip Code"
                            onChange={(e) => onInputChange(e, "Zip_Code")}
                        />
                    </div>
                </div>
</div>
                <hr />
                <div className="card-body">
                <h5>Personal Address Information</h5><br />
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Country</label>
                        <InputText
                            value={leadData?.Country_Personal}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Country"
                            onChange={(e) => onInputChange(e, "Country_Personal")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">State</label>
                        <InputText
                            value={leadData?.State_Personal}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter State"
                            onChange={(e) => onInputChange(e, "State_Personal")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">City</label>
                        <InputText
                            value={leadData?.City_Personal}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter City"
                            onChange={(e) => onInputChange(e, "City_Personal")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Address 1</label>
                        <InputText
                            value={leadData?.Address_Personal}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Address 1"
                            onChange={(e) => onInputChange(e, "Address_Personal")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Address 2</label>
                        <InputText
                            value={leadData?.Address_2_Personal}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Address 2"
                            onChange={(e) => onInputChange(e, "Address_2_Personal")}
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="name">Zip Code</label>
                        <InputText
                            value={leadData?.Zip_Code_Personal}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Zip Code"
                            onChange={(e) => onInputChange(e, "Zip_Code_Personal")}
                        />
                    </div>
                </div>
</div>
                <hr />
                <div className="card-body">
                <h5>Company Social Media</h5><br />
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-facebook"></i>
                            </span>
                            <InputText
                                value={leadData?.Facebook}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Facebook Link"
                                onChange={(e) => onInputChange(e, "Facebook")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-instagram"></i>
                            </span>
                            <InputText
                                value={leadData?.Instagram}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Instagram Link"
                                onChange={(e) => onInputChange(e, "Instagram")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-linkedin"></i>
                            </span>
                            <InputText
                                value={leadData?.LinkedIn}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter LinkedIn Link"
                                onChange={(e) => onInputChange(e, "LinkedIn")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-hashtag"></i>
                            </span>
                            <InputText
                                value={leadData?.Tik_Tok}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Tik Tok Link"
                                onChange={(e) => onInputChange(e, "Tik_Tok")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-twitter"></i>
                            </span>
                            <InputText
                                value={leadData?.Twitter_URL}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Twitter Link"
                                onChange={(e) => onInputChange(e, "Twitter_URL")}
                            />
                        </div>
                    </div>
                </div>
</div>
                <hr />
                <div className="card-body">
                <h5>Personal Social Media</h5><br />
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-facebook"></i>
                            </span>
                            <InputText
                                value={leadData?.Facebook_Personal}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Facebook Link"
                                onChange={(e) => onInputChange(e, "Facebook_Personal")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-instagram"></i>
                            </span>
                            <InputText
                                value={leadData?.Instagram_Personal}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Instagram Link"
                                onChange={(e) => onInputChange(e, "Instagram_Personal")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-linkedin"></i>
                            </span>
                            <InputText
                                value={leadData?.LinkedIn_Personal}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter LinkedIn Link"
                                onChange={(e) => onInputChange(e, "LinkedIn_Personal")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-hashtag"></i>
                            </span>
                            <InputText
                                value={leadData?.Tik_Tok_Personal}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Tik Tok Link"
                                onChange={(e) => onInputChange(e, "Tik_Tok_Personal")}
                            />
                        </div>
                    </div>

                    <div className="field col-12 md:col-6">
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                <i className="pi pi-twitter"></i>
                            </span>
                            <InputText
                                value={leadData?.Twitter_Personal}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Twitter Link"
                                onChange={(e) => onInputChange(e, "Twitter_Personal")}
                            />
                        </div>
                    </div>
                </div>
</div>
                <div className="card-footer">
                    <div className="button-group">
                        <Button label="Save" loading={submitLoading} onClick={onSubmitApiCall} />
                    </div>
                </div>
            </div>

            {/* Upload Excel / CSV Dialog */}
            <Dialog
                visible={uploadModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Upload Excel / CSV File"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideUploadModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => uploadExcelData()}
                            loading={uploadLoader}
                        />
                    </>
                }
                onHide={hideUploadModal}
            >
                <div className="formgrid grid">
                    <h5>Select Lead Geneartor and Broker To Add Data Under</h5><br />
                    <div className="field col-6">
                        <label htmlFor="name">Lead Generator <span className="required">*</span></label>
                        <Dropdown
                            value={leadData?.leadgen_id_modal}
                            name="name"
                            options={leadGen}
                            filter
                            optionLabel="name"
                            placeholder="Select Lead Generator"
                            onChange={(e) => onInputChange(e.value, "leadgen_id_modal")}
                            className={errors['leadgen_id_modal'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['leadgen_id_modal']}</small>
                    </div>

                    <div className="field col-6">
                        <label htmlFor="name">Broker <span className="required">*</span></label>
                        <Dropdown
                            value={leadData?.broker_id_modal}
                            name="name"
                            options={broker}
                            filter
                            optionLabel="name"
                            placeholder="Select Broker"
                            onChange={(e) => onInputChange(e.value, "broker_id_modal")}
                            className={errors['broker_id_modal'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['broker_id_modal']}</small>
                    </div>

                    <div className="field col-12">
                        <label htmlFor="file">Upload File <span className="required">*</span></label>
                        <FileUpload
                            ref={fileUploadRef}
                            accept=".csv, .xlsx"
                            name="file[]"
                            className="imageupload"
                            chooseOptions={chooseOptions}
                            emptyTemplate={emptyTemplate}
                            headerTemplate={headerTemplate}
                            itemTemplate={itemLeadFileTemplate}
                        ></FileUpload>
                        <small className="p-invalid-txt">{errors['file']}</small>
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