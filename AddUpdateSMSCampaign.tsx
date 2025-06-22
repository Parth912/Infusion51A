import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';

// Data table
import {
    smsCampaignGroup,
    smsCampaignSubscriberSubGroup,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';

// Validation
import { addSMSCampaignValidate } from '../../../config/Validate';

import { Loader } from '../../../components/Loader/Loader';
import { Dropdown } from 'primereact/dropdown';

export const AddUpdateSMSCampaign = () => {
    document.title = "Add Update SMS Campaign | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Campaign</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    // Page service
    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [apiPageLoad, setApiPageLoad] = useState<boolean>(false);
    const [users, setUsers] = useState<any>([]);
    const [campaignData, setCampaignData] = useState<any>({});
    const [submitLoader, setSubmitLoader] = useState<boolean>(false);
    const [selectedUsers, setSelectedUsers] = useState<any>(null);
    const [twilioNumbers, setTwilioNumbers] = useState<any>([]);
    const [editId, setEditId] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [selectedSubGroup, setSelectedSubGroup] = useState<any>(null);
    const [extraArray, setExtraArray] = useState<any>([
        {
            country: '',
            phone_number: '',
            first_name: '',
            last_name: ''
        },
    ]);
    const [isExtraArrayUpdate, setIsExtraArrayUpdate] = useState(false);
    const [countriesList, setCountriesList] = useState<any>([]);
    const [extraChecked, setExtraChecked] = useState(false);
    const [resubmitChecked, setResubmitChecked] = useState(false);

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        // getInvestorsForCampaignFromAPI();
        getTwilioNumbersFromAPI();
        getCountriesFromAPi();

        if (location.state) {
            const state = location.state;
            setEditId(state);
            getEditCampaignDataFromAPI(state);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isExtraArrayUpdate) {
            setIsExtraArrayUpdate(false);
            getExtraArrayUI();
        }
    }, [isExtraArrayUpdate]);

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

    // Get edit campaign data
    const getEditCampaignDataFromAPI = (state: any) => {
        // Api call
        pageService
            .getEditCampaignData(state.campaign_id)
            .then((response) => {
                // Get response
                if (response) {
                    // Set extra people
                    let extraPeople = response.recipients.filter((item: any) => item.extra_people_detail !== null);
                    let tempExtraArr: any = [];
                    if (extraPeople !== null && extraPeople.length > 0){
                        extraPeople.map((item: any, index: any) => {
                            tempExtraArr.push({
                                id: item.id,
                                country: item.extra_people_detail.country,
                                phone_number: item.extra_people_detail.phone_number,
                                first_name: item.extra_people_detail.first_name,
                                last_name: item.extra_people_detail.last_name
                            });
                        });
                        setExtraArray(tempExtraArr);
                        setExtraChecked(true);
                    }
                    
                    // set group data
                    let selectedGrp: any = [];
                    response.selected_group.split(",").map((item: any, index: any) => {
                        selectedGrp.push({
                            "name": item,
                            "code": item
                        });
                    });
                    setSelectedGroup(selectedGrp);
                    if (response.selected_subgroup !== null){
                        let selectedSubGrp: any = [];
                        response.selected_subgroup.split(",").map((item: any, index: any) => {
                            selectedSubGrp.push({
                                "name": item,
                                "code": item
                            });
                        });
                        setSelectedSubGroup(selectedSubGrp);
                    }

                    // Set other form data
                    setCampaignData({
                        "campaign_name": response.campaign_name,
                        "twilio_number_id": response.twilio_number,
                        "campaign_description": response.campaign_description,
                        "message_flow": response.message_flow,
                        "message_body_1": response.message_body_1,
                        "message_body_2": response.message_body_2
                    });
                }
            });
    };

    // // Get investors list from api
    // const getInvestorsForCampaignFromAPI = () => {
    //     // Api call
    //     pageService
    //         .getInvestorsListForCampaign()
    //         .then((response) => {
    //             // Get response
    //             if (response) {
    //                 const DataList = response;
    //                 if (DataList.length == 0) {
    //                     setUsers([]);
    //                 } else {
    //                     setUsers(DataList);
    //                 }
    //                 setPageLoad(true);
    //             } else {
    //                 setPageLoad(false);
    //                 setUsers([]);
    //             }
    //         });
    // };

    // Get twilio numbers from api
    const getTwilioNumbersFromAPI = () => {
        setApiPageLoad(true);

        // Api call
        pageService
            .getTwilioNumbers()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setTwilioNumbers([]);
                    } else {
                        setTwilioNumbers(DataList);
                    }
                    setApiPageLoad(false);
                } else {
                    setApiPageLoad(false);
                    setTwilioNumbers([]);
                }
            });
    };

    //On Change Campaign Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name === "twilio_number_id"){
            val = e;
        }else{
            val = (e.target && e.target.value) || '';
        }
        setCampaignData({ ...campaignData, [name]: val });
    };

    // On extra checkbox change
    const onExtraCheckboxChange = (e: any) => {
        setExtraChecked(e);
        if (!e) {
            setExtraArray([
                {
                    country: '',
                    phone_number: '',
                    first_name: '',
                    last_name: ''
                }
            ]);
        }
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

    // On extra people input change
    const onExtraInputChange = (e: any, name: string, index: number) => {
        let tempExtraArr = extraArray;
        let val;
        if (name == "country") {
            val = e;
        } else {
            val = (e.target && e.target.value) || '';
        }
        tempExtraArr[index][name] = val;
        setExtraArray(tempExtraArr);
        setIsExtraArrayUpdate(true);
    };

    // Handle extra Data
    const handleExtraArray = () => {
        const defaultObject = {
            country: '',
            phone_number: '',
            first_name: '',
            last_name: ''
        };
        let array = extraArray;
        array.push(defaultObject);
        setExtraArray(array);
        setIsExtraArrayUpdate(true);
    };

    // Delete extra array
    const deleteExtraArr = (index: any) => {
        let deleteExtraArray = extraArray;
        deleteExtraArray.splice(index, 1);
        setExtraArray(deleteExtraArray);
        setIsExtraArrayUpdate(true);
    };

    // Extra recieptients ui
    const getExtraArrayUI = () => {
       return(
            <>
                {extraArray.map((item: any, index: any) => {
                    return(
                        <>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 md:col-2">
                                    <label htmlFor="name">First Name <span style={{ color: "red" }}>*</span></label>
                                    <InputText
                                        defaultValue={item?.first_name}
                                        name="name"
                                        autoComplete="off"
                                        placeholder="Enter First Name"
                                        onChange={(e) => onExtraInputChange(e, "first_name", index)}
                                        className={errors['first_name'] && 'p-invalid'}
                                    />
                                    <small className="p-invalid-txt">{errors['first_name']}</small>
                                </div>
                                <div className="field col-12 md:col-2">
                                    <label htmlFor="name">Last Name <span style={{ color: "red" }}>*</span></label>
                                    <InputText
                                        defaultValue={item?.last_name}
                                        name="name"
                                        autoComplete="off"
                                        placeholder="Enter Last Name"
                                        onChange={(e) => onExtraInputChange(e, "last_name", index)}
                                        className={errors['last_name'] && 'p-invalid'}
                                    />
                                    <small className="p-invalid-txt">{errors['last_name']}</small>
                                </div>
                                <div className="field col-12 md:col-2">
                                    <label htmlFor="name">Select Country <span style={{ color: "red" }}>*</span></label>
                                    <Dropdown
                                        value={item?.country}
                                        name="name"
                                        options={countriesList}
                                        filter
                                        optionLabel="name"
                                        placeholder="Select Country"
                                        onChange={(e) => onExtraInputChange(e.value, "country", index)}
                                        valueTemplate={selectedCountryTemplate}
                                        itemTemplate={countryOptionTemplate}
                                        className={errors['country'] && 'p-invalid'}
                                    />
                                    <small className="p-invalid-txt">{errors['country']}</small>
                                </div>
                                <div className="field col-12 md:col-2">
                                    <label htmlFor="name">Mobile No. <span className="required">*</span></label>
                                    <InputText
                                        defaultValue={item?.phone_number}
                                        keyfilter="int"
                                        name="name"
                                        autoComplete="off"
                                        placeholder="Enter Mobile Number"
                                        onChange={(e) => onExtraInputChange(e, "phone_number", index)}
                                        className={errors['phone_number'] && 'p-invalid'}
                                    />
                                    <small className="p-invalid-txt">{errors['phone_number']}</small>
                                </div>
                                {
                                    index > 0 ?
                                        <div className="field col-12 md:col-2">
                                            <Button
                                                icon="pi pi-trash"
                                                className="p-button-rounded p-button-danger mt-5"
                                                onClick={() => deleteExtraArr(index)}
                                            />
                                        </div>
                                    :
                                        <></>
                                }
                                
                            </div>
                        </>
                    )
                })}
            </>
       )
    };

    // On Submit Api Call
    const onSubmitApiCall = () => {
        const { errors, isError } = addSMSCampaignValidate(campaignData, selectedGroup, selectedSubGroup, extraChecked, extraArray);
        setErrors(errors);
        if (!isError) {
            setSubmitLoader(true);

            let formData: any = new FormData();
            if(editId !== null){
                formData.append('id', editId.campaign_id);
            }
            formData.append('twilio_number_id', campaignData?.twilio_number_id?.code);
            formData.append('campaign_name', campaignData?.campaign_name);
            formData.append('campaign_description', campaignData?.campaign_description);
            formData.append('message_flow', campaignData?.message_flow);
            formData.append('message_body_1', campaignData?.message_body_1);
            formData.append('message_body_2', campaignData?.message_body_2);
            formData.append('opt_out_message', campaignData?.opt_out_message);
            formData.append('welcome_message', campaignData?.welcome_message);

            let finalSelectedGroups = selectedGroup.map((item: any) => item.code);
            formData.append('selected_group', finalSelectedGroups.toString());

            // Convert selected group array to comma string
            if (selectedSubGroup !== null && selectedSubGroup.length > 0 && selectedGroup.some((item: any) => Object.values(item).includes("Subscribers"))) {
                let finalSelectedSubGroups = selectedSubGroup.map((item: any) => item.code);
                formData.append('selected_subgroup', finalSelectedSubGroups.toString());
            }

            // Add extra people in form data
            if(extraChecked){
                let tempExtraArr: any = [];
                extraArray.map((item: any, index: any) => {
                    let tempExtraObj: any = {};
                    tempExtraObj["phonecode"] = item.country.phonecode;
                    tempExtraObj["phone_number"] = item.phone_number;
                    tempExtraObj["first_name"] = item.first_name;
                    tempExtraObj["last_name"] = item.last_name;
                    tempExtraObj["country"] = item.country;
                    if(item.id !== undefined){
                        tempExtraObj["id"] = item.id;
                    }
                    tempExtraArr.push(tempExtraObj);
                });
                formData.append("extra_people", JSON.stringify(tempExtraArr));
            }

            if(resubmitChecked){
                formData.append('resubmit_a2p', true);
            }

            // call api
            pageService.addUpdateSMSCampaign(formData).then((response) => {
                // Get response
                if (response) {
                    setSubmitLoader(false);
                    setCampaignData({});
                    setSelectedUsers(null);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    setTimeout(() => {
                        navigate('/sms-campaigns');
                    }, 1000);
                } else {
                    setSubmitLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setSubmitLoader(false);
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
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> {editId !== null ? "Update Campaign Details" : "Add Campaign"}</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <div className="card-title-box">
                        <h3 className="card-title">Enter Campaign Details</h3>
                        <hr/>
                        <h6>Note: When you submit the campaign, this campaign is going to be register for A2P 10DLC. A2P 10DLC Business Registration Form A2P 10DLC is a new messaging standard introduced by major US carriers to curb SMS spam and fraud. Opt-in: Please note that sending cold SMS is now illegal, and an opt-in process is mandatory.</h6>
                        <h6>Some of the details you have to keep in mind while filling the below form are as below with expamples: <br/><br/>
                            1. Message Flow: Give the detaild stpes from where user will opt-in for this sms campaign, and how they can opt-out. For Example, "User visits https://website.com and fills out the form with their first name, last name, mobile number, and email to subscribe to SMS campaigns. User can Opt-Out by replying "STOP"."
                            <br/><br/>
                            2. Sample SMS Message 1 and 2: You have to enter sample messages in these two fields. These messages are just samples which you will enter for registration of A2P 10DLC. These messages are not going to be user when actual SMS Campaign runs. You have to enter the sample messages which will align with the campaign usecase you will fill in campaign description.
                        </h6>
                    </div>
                </div>
                <div className="card-body">
                    
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="name">Campaign Name <span style={{ color: "red" }}>*</span></label>
                            <InputText
                                value={campaignData?.campaign_name}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Campaign Name"
                                onChange={(e) => onInputChange(e, "campaign_name")}
                                className={errors['campaign_name'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['campaign_name']}</small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="name">Phone Number <span style={{ color: "red" }}>*</span></label>
                            {
                                editId === null ?
                                    <>
                                        <Dropdown
                                            value={campaignData?.twilio_number_id}
                                            name="name"
                                            options={twilioNumbers}
                                            filter
                                            optionLabel="name"
                                            placeholder="Select Phone Number"
                                            onChange={(e) => onInputChange(e.value, "twilio_number_id")}
                                            className={errors['twilio_number_id'] && 'p-invalid'}
                                        />
                                        <small className="p-invalid-txt">{errors['twilio_number_id']}</small>
                                    </>
                                :
                                    <>
                                        <InputText
                                            value={campaignData?.twilio_number_id?.name}
                                            name="name"
                                            placeholder="Select Phone Number"
                                            disabled={true}
                                        />
                                    </>
                            }
                        </div>
                    </div>

                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-12">
                            <label htmlFor="name">Please describe the campaign usecase <span style={{ color: "red" }}>*</span></label>
                            <InputTextarea
                                value={campaignData?.campaign_description}
                                onChange={(e) => onInputChange(e, "campaign_description")}
                                rows={5}
                                cols={30}
                            />
                            <small className="p-invalid-txt">{errors['campaign_description']}</small>
                        </div>

                        <div className="field col-12 md:col-12">
                            <label htmlFor="name">Message Flow (A detailed description of how end users opt in (consent) to receiving the Campaign's messages.) <span style={{ color: "red" }}>*</span></label>
                            <InputTextarea
                                value={campaignData?.message_flow}
                                onChange={(e) => onInputChange(e, "message_flow")}
                                rows={5}
                                cols={30}
                            />
                            <small className="p-invalid-txt">{errors['message_flow']}</small>
                        </div>
                    </div>

                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="name">Sample SMS Message 1 <span style={{ color: "red" }}>*</span></label>
                            <InputText
                                value={campaignData?.message_body_1}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Message 1"
                                onChange={(e) => onInputChange(e, "message_body_1")}
                                className={errors['message_body_1'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['message_body_1']}</small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="name">Sample SMS Message 2 <span style={{ color: "red" }}>*</span></label>
                            <InputText
                                value={campaignData?.message_body_2}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Message 2"
                                onChange={(e) => onInputChange(e, "message_body_2")}
                                className={errors['message_body_2'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['message_body_2']}</small>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="name">Opt-Out Message (This message will be sent when recipient out-outs this campaign by replying "STOP".) <span style={{ color: "red" }}>*</span></label>
                            <InputTextarea
                                value={campaignData?.opt_out_message}
                                onChange={(e) => onInputChange(e, "opt_out_message")}
                                rows={5}
                                cols={30}
                            />
                            <small className="p-invalid-txt">{errors['opt_out_message']}</small>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label htmlFor="name">Welcome Message (This message will be sent to all recipients when this campaign is been live.) <span style={{ color: "red" }}>*</span></label>
                            <InputTextarea
                                value={campaignData?.welcome_message}
                                onChange={(e) => onInputChange(e, "welcome_message")}
                                rows={5}
                                cols={30}
                            />
                            <small className="p-invalid-txt">{errors['welcome_message']}</small>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className="card-body">
                    <h5>Select Recieptients Group To Send Message To <span style={{ color: "red" }}>*</span></h5> 
                    <div className="p-fluid formgrid grid">
                        {/* <div className="field col-12 md:col-12">
                            {pageLoad == true ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive" stripedRows
                                        value={users}
                                        paginator={users.length > 0 && true}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        selectionMode='checkbox'
                                        selection={selectedUsers}
                                        onSelectionChange={(e) => setSelectedUsers(e.value)}
                                        dataKey="id"
                                        emptyMessage="No Investors Found"
                                    >
                                        <Column
                                            selectionMode="multiple"
                                            headerStyle={{ width: '3rem' }}
                                        />
                                        {UsersListForSMSCampaign.map((col, i) => {
                                            if (col.field === 'sr_no') {
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
                                    <DataTable value={Skeletonitems}>
                                        {UsersListForSMSCampaign.map((col, i) => (
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
                        </div> */}
                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Select Group<span style={{ color: "red" }}>*</span></label>
                            <MultiSelect 
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.value)}
                                options={smsCampaignGroup}
                                optionLabel="name"
                                placeholder="Select Group Of People"
                                className={errors['selected_group'] && 'p-invalid'}
                                disabled={editId !== null ? true : false}
                            />
                            <small className="p-invalid-txt">{errors['selected_group']}</small>
                        </div>

                        {
                            !window.cn(selectedGroup) && selectedGroup !== null && selectedGroup.some((item: any) => Object.values(item).includes("Subscribers")) ? 
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name">Select Sub Group<span style={{ color: "red" }}>*</span></label>
                                    <MultiSelect
                                        value={selectedSubGroup}
                                        onChange={(e) => setSelectedSubGroup(e.value)}
                                        options={smsCampaignSubscriberSubGroup}
                                        optionLabel="name"
                                        placeholder="Select Sub Group Of People"
                                        className={errors['selected_subgroup'] && 'p-invalid'}
                                        disabled={editId !== null ? true : false}
                                    />
                                    <small className="p-invalid-txt">{errors['selected_subgroup']}</small>
                                </div>
                            :
                                <></>
                        }
                        
                    </div>
                </div>

                <hr/>

                <div className="flex flex-wrap justify-content-left ml-5 mb-5">
                    <div className="flex align-items-center">
                        <Checkbox onChange={e => onExtraCheckboxChange(e.checked)} checked={extraChecked}></Checkbox>
                        <label className="ml-2">Do you want to add extra recieptients?</label>
                    </div>
                </div>
                {
                    extraChecked ? 
                        <>
                            <div className="card-body">
                                <h5>Add Extra Recieptients To Send Message To </h5>
                                {getExtraArrayUI()}

                                <div className="field col-12 md:col-12">
                                    <Button
                                        style={{ width: 'fit-content' }}
                                        label="Add More"
                                        icon="pi pi-plus"
                                        className="p-button"
                                        onClick={handleExtraArray}
                                    />
                                </div>
                            </div>
                        </>
                    :
                        <>
                        </>
                }
                
                <div className="card-footer">
                    <div className="button-group">
                        {
                            editId !== null ?
                                <div className="flex flex-wrap justify-content-left ml-5 mb-5">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => setResubmitChecked(e.checked)} checked={resubmitChecked}></Checkbox>
                                        <label className="ml-2">Resubmit A2P Registration</label>
                                    </div>
                                </div>
                            :
                                <></>
                        }
                        <Button label="Save" loading={submitLoader} onClick={onSubmitApiCall} />
                    </div>
                </div>
            </div>

            {/* Loader Start */}
            {
                apiPageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    )
}