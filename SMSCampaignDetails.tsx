import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Badge } from 'primereact/badge';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';

import moment from 'moment';

// Column
import { SMSCampaignMessages, SMSCampaignRecipients, SMSCampaignRecipientsUnSubscribed } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
    SMSMessagePriority,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { Link } from 'react-router-dom';
import { addNewMessageValidate, addNewRecipientsValidate } from '../../../config/Validate';
import { Checkbox } from 'primereact/checkbox';

export const SMSCampaignDetails = () => {
    document.title = "SMS Campaign Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/sms-campaigns">SMS Campaigns</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Campaign Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();
    
    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [cmapaignId, setCampaignId] = useState<any>("");
    const [campaignDetails, setCampaignDetails] = useState<any>([]);
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
    const [timezones, setTimezones] = useState<any>([]);
    const [errors, setErrors] = useState<any>({});
    const [extraArrayModal, setExtraArrayModal] = useState<boolean>(false);
    const [extraPeopleLoader, setExtraPeopleLoader] = useState<boolean>(false);
    const [newMessageModal, setNewMessageModal] = useState<boolean>(false);
    const [newMessageLoader, setNewMessageLoader] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<any>("");
    const [startDateTime, setStartDateTime] = useState<any>("");
    const [selectedTimezone, setSelectedTimezone] = useState<any>(null);
    const [messageEditId, setMessageEditId] = useState<any>(null);
    const [subscribedUsers, setSubscribedUsers] = useState<any>([]);
    const [unsubscribedUsers, setUnsubscribedUsers] = useState<any>([]);
    const [specificRecipientModal, setSpecificRecipientModal] = useState<boolean>(false);
    const [specificRecipientLoader, setSpecificRecipientLoader] = useState<boolean>(false);
    const [specificRecipientMessageId, setSpecificRecipientMessageId] = useState<any>(null);
    const [selectedSpecificRecipients, setSelectedSpecificRecipients] = useState<any>([]);
    const [messageOnlyRecipients, setMessageOnlyRecipients] = useState<boolean>(false);
    const [messageOnlyId, setMessageOnlyId] = useState<any>(null);
    const [priority, setPriority] = useState<boolean>(false);
    const [optOutDefault, setOptOutDefault] = useState<boolean>(false);
    const [highPriorityDefault, setHighPriorityDefault] = useState<boolean>(false);
    const [removeRecipientModal, setRemoveRecipientModal] = useState<boolean>(false);
    const [removeRecipientLoader, setRemoveRecipientLoader] = useState<boolean>(false);
    const [removeRecipientId, setRemoveRecipientId] = useState<any>(null);
    
    // Page service
    const pageService = new PageService();
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setCampaignId(state);
            getSMSCampaignsDetailsFromAPI(state);
            getCountriesFromAPI();
            getTimezonesFromAPI()
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isExtraArrayUpdate) {
            setIsExtraArrayUpdate(false);
            getExtraArrayUI();
        }
    }, [isExtraArrayUpdate]);

    // Get SMS Camapaigns
    const getSMSCampaignsDetailsFromAPI = async (state: any) => {
        // Api call
        pageService
            .getSMSCampaignDetails(state.campaign_id)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setCampaignDetails([]);
                    } else {
                        setCampaignDetails(DataList);
                        let subscribed = DataList?.recipients.filter((item: any) => item.is_unsubscribed === 0);
                        subscribed = subscribed.map((item: any) => {
                            const extraDetails = item.extra_people_detail ? JSON.parse(item.extra_people_detail) : null;
                            const fullName = extraDetails
                                ? `${extraDetails.first_name} ${extraDetails.last_name}`
                                : item.recipient_details
                                    ? `${item.recipient_details.first_name} ${item.recipient_details.last_name}`
                                    : '';
                            return { ...item, full_name: fullName };
                        });
                        let unSubscribed = DataList?.recipients.filter((item: any) => item.is_unsubscribed === 1);
                        unSubscribed = unSubscribed.map((item: any) => {
                            const extraDetails = item.extra_people_detail ? JSON.parse(item.extra_people_detail) : null;
                            const fullName = extraDetails
                                ? `${extraDetails.first_name} ${extraDetails.last_name}`
                                : item.recipient_details
                                    ? `${item.recipient_details.first_name} ${item.recipient_details.last_name}`
                                    : '';
                            return { ...item, full_name: fullName };
                        });
                        setSubscribedUsers(subscribed);
                        setUnsubscribedUsers(unSubscribed);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setCampaignDetails([]);
                }
            });
    };

    // Get countires
    const getCountriesFromAPI = () => {
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

    // Get timezones
    const getTimezonesFromAPI = () => {
        // Api call
        pageService
            .getTimezones()
            .then((response) => {
                // Get response
                if (response) {
                    setTimezones(response);
                } else {
                    setTimezones([]);
                }
            });
    };

    // Template for full name
    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.recipient_details?.first_name !== undefined ? rowData?.recipient_details?.first_name + " " + rowData?.recipient_details?.last_name : JSON.parse(rowData?.extra_people_detail)["first_name"] + " " + JSON.parse(rowData?.extra_people_detail)["last_name"]}
            </>
        );
    };

    // Template for message name
    const messageTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link to="/message-recipients" state={{ message_id: rowData.id, campaign_id: cmapaignId.campaign_id, a2p_status: cmapaignId.a2p_status }} style={{ color: "black" }}>
                    {rowData?.message}
                </Link>
            </>
        );
    };

    // Template for total sent messages
    const messageSentTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.delivered.length}
            </>
        );
    };

    // Template for message status
    const messageStatusTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData?.status === "Pending" ? <Badge severity='warning' value="Pending"></Badge> : rowData?.status === "Running" ? <Badge severity='info' value="Running"></Badge> : <Badge severity='success' value="Completed"></Badge>}
            </>
        );
    };

    // Template for message priority
    const msgPriorityTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                {rowData.priority === "High" ? <Badge severity='danger' value="High"></Badge> : <Badge severity='info' value="All"></Badge>}
            </>
        )
    };

    // Open remove recipient modal
    const openRemoveRecipientModal = (recipient_id: any) => {
        setRemoveRecipientId(recipient_id);
        setRemoveRecipientModal(true);
    };

    // Close remove recipient modal
    const closeRemoveRecipientModal = () => {
        setRemoveRecipientId(null);
        setRemoveRecipientModal(false);
        setRemoveRecipientLoader(false);
    };

    // Remove recipient from campaign api call
    const removeRecipientFromCampaignApiCall = () => {
        setRemoveRecipientLoader(true);

        // call api
        pageService.removeRecipientFromCampaign(cmapaignId.campaign_id, removeRecipientId).then((response) => {
            // Get response
            if (response) {
                setRemoveRecipientLoader(false);
                setRemoveRecipientModal(false);
                setRemoveRecipientId(null);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                getSMSCampaignsDetailsFromAPI({ campaign_id: cmapaignId.campaign_id, a2p_status: cmapaignId.a2p_status });
            } else {
                setRemoveRecipientLoader(false);
                setRemoveRecipientModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong, Please try again.',
                });
            }
        });
    };

    // Template for recipient actions
    const recipientActionTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <div className="tb-actions">
                    <Button
                        type="button"
                        icon="pi pi-trash"
                        className='p-button-danger p-button-square'
                        tooltip='Remove From Campaign'
                        tooltipOptions={{ position: "top" }}
                        onClick={() => openRemoveRecipientModal(rowData.id)}
                    />
                </div>
            </>
        )
    };

    // Template for action body
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <div className="tb-actions">
                    <Button
                        type="button"
                        icon="pi pi-send"
                        className='p-button-secondary p-button-square'
                        tooltip='Select Specific Reciepients'
                        tooltipOptions={{ position: "top" }}
                        onClick={() => openSpecificRecipientModal(rowData)}
                        disabled={rowData?.status === "Pending" || rowData?.delivered.length === 0 ? false : true}
                    />
                    <Button
                        type="button"
                        icon="pi pi-user-plus"
                        className='p-button-secondary p-button-square'
                        tooltip='Add Reciepients For This Message Only'
                        tooltipOptions={{ position: "top" }}
                        onClick={() => openExtraArrayModal("message_only", rowData.id)}
                        disabled={rowData?.status === "Pending" || rowData?.delivered.length === 0 ? false : true}
                    />
                    <Button
                        type="button"
                        icon="pi pi-pencil"
                        className='p-button-secondary p-button-square'
                        tooltip='Edit'
                        tooltipOptions={{ position: "top" }}
                        onClick={() => openEditMessageModal(rowData)}
                        disabled={rowData?.status === "Pending" || rowData?.delivered.length === 0 ? false : true}
                    />
                </div>
            </>
        )
    };

    // Open extra array modal
    const openExtraArrayModal = (type: any, messageId: any) => {
        if (type === "message_only") {
            setMessageOnlyRecipients(true);
            setMessageOnlyId(messageId);
        }
        setExtraArrayModal(true);
    };

    // Close extra array modal
    const closeExtraArrayModal = () => {
        setExtraArrayModal(false);
        setExtraArray([
            {
                country: '',
                phone_number: '',
                first_name: '',
                last_name: ''
            },
        ]);
        setErrors({});
        setMessageOnlyRecipients(false);
        setMessageOnlyId(null);
        setExtraPeopleLoader(false);
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

    // Extra recieptients ui
    const getExtraArrayUI = () => {
        return (
            <>
                {extraArray.map((item: any, index: any) => {
                    return (
                        <>
                            <div className="p-fluid formgrid grid">
                                <div className="field col-12 md:col-5">
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
                                <div className="field col-12 md:col-5">
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
                                <div className="field col-12 md:col-5">
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
                                <div className="field col-12 md:col-5">
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

    // On save extra recipients
    const saveExtraRecipients = () => {
        const { errors, isError } = addNewRecipientsValidate(extraArray);
        setErrors(errors);
        if (!isError) {
            setExtraPeopleLoader(true);

            let formData: any = new FormData();

            if(messageOnlyRecipients === true){
                formData.append("type", "message_only");
                formData.append("message_id", messageOnlyId);
            }

            formData.append("id", cmapaignId.campaign_id);

            let tempExtraArr: any = [];
            extraArray.map((item: any, index: any) => {
                let tempExtraObj: any = {};
                tempExtraObj["phonecode"] = item.country.phonecode;
                tempExtraObj["phone_number"] = item.phone_number;
                tempExtraObj["first_name"] = item.first_name;
                tempExtraObj["last_name"] = item.last_name;
                tempExtraObj["country"] = item.country;
                if (item.id !== undefined) {
                    tempExtraObj["id"] = item.id;
                }
                tempExtraArr.push(tempExtraObj);
            });
            formData.append("extra_people", JSON.stringify(tempExtraArr));
            
            // call api
            pageService.addExtraPeopleToCampaign(formData).then((response) => {
                // Get response
                if (response) {
                    setExtraPeopleLoader(false);
                    setExtraArrayModal(false);
                    setMessageOnlyRecipients(false);
                    setMessageOnlyId(null);
                    setExtraArray([
                        {
                            country: '',
                            phone_number: '',
                            first_name: '',
                            last_name: ''
                        }
                    ]);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getSMSCampaignsDetailsFromAPI({ campaign_id: cmapaignId.campaign_id, a2p_status: cmapaignId.a2p_status });
                } else {
                    setExtraPeopleLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setExtraPeopleLoader(false);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });

        }
    };

    // Open new message modal
    const openNewMessageModal = () => {
        setNewMessageModal(true);
    };

    // Open edit message modal
    const openEditMessageModal = (rowData: any) => {
        setMessageEditId(rowData.id);
        setNewMessage(rowData.message);
        let convertedDatTime = moment(rowData.start_date_time, "MM/DD/YY hh:mm A").toDate();
        setStartDateTime(convertedDatTime);
        if(rowData.priority === "High"){
            setPriority(true);
        }
        setSelectedTimezone({ name: rowData.timezone, code: rowData.timezone });
        setNewMessageModal(true);
    };

    // Close new message modal
    const closeNewMessageModal = () => {
        setNewMessageModal(false);
        setNewMessageLoader(false);
        setMessageEditId(null);
        setNewMessage("");
        setStartDateTime("");
        setPriority(false);
        setOptOutDefault(false);
        setHighPriorityDefault(false);
        setSelectedTimezone(null);
        setErrors({});
    };

    // On change deagult message
    const onChangeDefaultText = (val: any, name: any) => {
        if (val === true) {
            if(name === "opt_out"){
                setNewMessage(newMessage + "\nReply STOP to unsubscribe.");
                setOptOutDefault(true);
            } else if (name === "high_priority"){
                setNewMessage(newMessage + "\nReply HIGH to recieve only high-priority updates.");
                setHighPriorityDefault(true);
            }
        }else{
            if (name === "opt_out") {
                setNewMessage(newMessage.replace("\nReply STOP to unsubscribe.", ""));
                setOptOutDefault(false);
            } else if (name === "high_priority") {
                setNewMessage(newMessage.replace("\nReply HIGH to recieve only high-priority updates.", ""));
                setHighPriorityDefault(false);
            }
        }
    };

    // On save new message
    const saveNewMessage = () => {
        const { errors, isError } = addNewMessageValidate(newMessage, startDateTime, selectedTimezone);
        setErrors(errors);
        if (!isError) {
            setExtraPeopleLoader(true);

            let formData: any = new FormData();

            if(messageEditId !== null){
                formData.append("id", messageEditId);
            }

            formData.append("campaign_id", cmapaignId.campaign_id);
            formData.append("message", newMessage);
            formData.append("timezone", selectedTimezone?.code);
            if(priority === true){
                formData.append("priority", "High");
            }

            // Convert date format
            const formattedDate = moment(startDateTime).format('MM/DD/YY hh:mm A');
            formData.append('start_date_time', formattedDate);

            // call api
            pageService.addNewMessageToCampaign(formData).then((response) => {
                // Get response
                if (response) {
                    setNewMessageLoader(false);
                    setNewMessageModal(false);
                    setNewMessage("");
                    setStartDateTime("");
                    setSelectedTimezone(null);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getSMSCampaignsDetailsFromAPI({ campaign_id: cmapaignId.campaign_id, a2p_status: cmapaignId.a2p_status });
                } else {
                    setNewMessageLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setNewMessageLoader(false);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });

        }
    };

    // Open specific recipient modal
    const openSpecificRecipientModal = (rowData: any) => {
        let specificRecipientsArr = rowData.specific_recipients !== null ? rowData.specific_recipients.split(",") : [];
        setSelectedSpecificRecipients(subscribedUsers.filter((user: any) => specificRecipientsArr.some((selectedUser: any) => user.id == selectedUser)));
        setSpecificRecipientMessageId(rowData?.id);
        setSpecificRecipientModal(true);
    };

    // Close specific recipient modal
    const closeSpecificRecipientModal = () => {
        setSpecificRecipientMessageId(null);
        setSelectedSpecificRecipients([]);
        setSpecificRecipientLoader(false);
        setSpecificRecipientModal(false);
    };

    // Add specific recipients to message
    const addSpecificRecipientsToMessageApiCall = () => {
        if(selectedSpecificRecipients.length === 0){
            toast.current?.show({
                severity: 'error',
                summary: 'Message',
                detail: "Please select atleast one recipient to send message to",
            });
        }else{
            setSpecificRecipientLoader(true);

            let formData: any = new FormData();

            formData.append("id", specificRecipientMessageId);
            let specificRecipientsIds: any = [];
            selectedSpecificRecipients.map((item: any) => {
                specificRecipientsIds.push(item.id);
            });
            formData.append("specific_recipients", specificRecipientsIds.toString());

            // call api
            pageService.addSpecificRecipientsToMessage(formData).then((response) => {
                // Get response
                if (response) {
                    setSpecificRecipientMessageId(null);
                    setSelectedSpecificRecipients([]);
                    setSpecificRecipientLoader(false);
                    setSpecificRecipientModal(false);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getSMSCampaignsDetailsFromAPI({ campaign_id: cmapaignId.campaign_id, a2p_status: cmapaignId.a2p_status });
                } else {
                    setSpecificRecipientLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setSpecificRecipientLoader(false);
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
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Campaign Details </div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="field col">
                        <div className="grid">
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Name</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) ? campaignDetails?.campaign_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Total Messages Scheduled</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) && campaignDetails?.messages !== undefined ? campaignDetails?.messages.length : 0}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Total Recipients</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) ? campaignDetails?.recipients.length : ""}</div>
                                </div>
                            </div>
                            {/* <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Total Delivered</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) ? campaignDetails?.delivered_count : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Total Pending</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) ? campaignDetails?.pending_count : ""}</div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <Accordion activeIndex={1}>
                    <AccordionTab header={
                        <div className="flex align-items-center w-full">
                            <div className="font-bold white-space-nowrap">&nbsp;&nbsp;&nbsp;Messages</div>
                            <div className='ml-auto'>
                                <Button
                                    className="p-button-help p-button p-button-outlined"
                                    icon="ti ti-messages"
                                    label="New Message"
                                    onClick={() => openNewMessageModal()}
                                    disabled={cmapaignId?.a2p_status === "VERIFIED" ? false : true}
                                />
                            </div>
                        </div>
                    }>
                        {pageLoad ? (
                            <>
                                <DataTable
                                    className="datatable-responsive"
                                    value={campaignDetails?.messages}
                                    paginator={campaignDetails?.messages.length > 0 && true}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage={"No Messages Found"}
                                >
                                    {SMSCampaignMessages.map((col, i) => {
                                        if (col.field === 'message') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={messageTemplate}
                                                />
                                            );
                                        } else if (col.field === 'action') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={actionBodyTemplate}
                                                />
                                            );
                                        } else if (col.field === 'total_sent_messages') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={messageSentTemplate}
                                                />
                                            );
                                        } else if (col.field === 'status') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={messageStatusTemplate}
                                                />
                                            );
                                        } else if (col.field === 'priority') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={msgPriorityTemplate}
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
                                                />
                                            );
                                        }
                                    })}
                                </DataTable>
                            </>
                        ) : (
                            <>
                                <DataTable value={Skeletonitems}
                                    className="datatable-responsive" stripedRows
                                >
                                    {SMSCampaignMessages.map((col, i) => (
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
                    </AccordionTab>
                </Accordion>
            </div>
            <div className="card">
                <Accordion activeIndex={1}>
                    <AccordionTab header={
                        <div className="flex align-items-center w-full">
                            <div className="font-bold white-space-nowrap">&nbsp;&nbsp;&nbsp;Recipients</div>
                            <div className='ml-auto'>
                                <Button
                                    className="p-button p-button-outlined"
                                    icon="ti ti-user-plus"
                                    label="New Recipients"
                                    onClick={() => openExtraArrayModal(null, null)}
                                />
                            </div>
                        </div>
                    }>
                        {pageLoad ? (
                            <>
                                <DataTable
                                    className="datatable-responsive"
                                    value={subscribedUsers}
                                    paginator={subscribedUsers.length > 0 && true}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage={"No Recipients Found"}
                                >
                                    {SMSCampaignRecipients.map((col, i) => {
                                        if (col.field === 'sr_no') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={(_, { rowIndex }) => rowIndex + 1}
                                                />
                                            );
                                        } else if (col.field === 'priority') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={msgPriorityTemplate}
                                                />
                                            );
                                        } else if (col.field === 'action') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={recipientActionTemplate}
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
                            </>
                        ) : (
                            <>
                                <DataTable value={Skeletonitems}
                                    className="datatable-responsive" stripedRows
                                >
                                    {SMSCampaignRecipients.map((col, i) => (
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
                    </AccordionTab>
                </Accordion>
            </div>

            <div className="card">
                <Accordion activeIndex={1}>
                    <AccordionTab header={
                        <div className="flex align-items-center w-full">
                            <div className="font-bold white-space-nowrap">&nbsp;&nbsp;&nbsp;Unsubscribed</div>
                            <div className='ml-auto'></div>
                        </div>
                    }>
                        {pageLoad ? (
                            <>
                                <DataTable
                                    className="datatable-responsive"
                                    value={unsubscribedUsers}
                                    paginator={unsubscribedUsers.length > 0 && true}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage={"No One Has Unsubscribed Yet"}
                                >
                                    {SMSCampaignRecipientsUnSubscribed.map((col, i) => {
                                        if (col.field === 'full_name') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={fullNameTemplate}
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
                                                />
                                            );
                                        }
                                    })}
                                </DataTable>
                            </>
                        ) : (
                            <>
                                <DataTable value={Skeletonitems}
                                    className="datatable-responsive" stripedRows
                                >
                                    {SMSCampaignRecipientsUnSubscribed.map((col, i) => (
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
                    </AccordionTab>
                </Accordion>
            </div>

            {/* Add Extra Array Dialog */}
            <Dialog
                visible={extraArrayModal}
                style={{ width: '450px' }}
                header="Add New Recipients To The Campaign"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeExtraArrayModal}
                        />
                        <Button
                            label="Save"
                            className="p-button-success"
                            onClick={saveExtraRecipients}
                            loading={extraPeopleLoader}
                        />
                    </>
                }
                onHide={closeExtraArrayModal}
            >
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
            </Dialog>

            {/* Add New Message Dialog */}
            <Dialog
                visible={newMessageModal}
                style={{ width: '450px' }}
                header={messageEditId !== null ? "Update Message" : "Add New Message To Send"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeNewMessageModal}
                        />
                        <Button
                            label="Save"
                            className="p-button-success"
                            onClick={saveNewMessage}
                            loading={newMessageLoader}
                        />
                    </>
                }
                onHide={closeNewMessageModal}
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-12">
                        <label htmlFor="name">Message <span style={{ color: "red" }}>*</span></label>
                        <InputTextarea
                            value={newMessage}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Message"
                            onChange={(e) => setNewMessage(e.target.value)}
                            className={errors['message'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['message']}</small>
                    </div>
                    <div className="field col-12 md:col-12">
                        <div className="flex flex-wrap justify-content-left mb-5">
                            <div className="flex align-items-center">
                                <Checkbox onChange={e => onChangeDefaultText(e.checked, 'opt_out')} checked={optOutDefault}></Checkbox>
                                <label className="ml-2">Append opt-out message</label>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-content-left mb-5">
                            <div className="flex align-items-center">
                                <Checkbox onChange={e => onChangeDefaultText(e.checked, 'high_priority')} checked={highPriorityDefault}></Checkbox>
                                <label className="ml-2">Append text for High priority message</label>
                            </div>
                        </div>
                    </div>
                    <div className="field col-12 md:col-12">
                        <label htmlFor="name">Select Date & Time <span style={{ color: "red" }}>*</span></label>
                        <Calendar
                            id="calendar-12h"
                            value={startDateTime}
                            onChange={(e) => setStartDateTime(e.target.value)}
                            showIcon
                            showTime
                            hourFormat="12"
                            minDate={new Date()}
                            className={errors['start_datetime'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['start_datetime']}</small>
                    </div>
                    <div className="field col-12 md:col-12">
                        <label htmlFor="name">Timezone <span style={{ color: "red" }}>*</span></label>
                        <Dropdown
                            value={selectedTimezone}
                            onChange={(e) => setSelectedTimezone(e.value)}
                            options={timezones}
                            optionLabel="name"
                            placeholder="Select Timezone"
                            filter
                        ></Dropdown>
                        <small className="p-invalid-txt">{errors['timezone']}</small>
                    </div>
                </div>
                <hr/>
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-12">
                        <label htmlFor="name">Message Priority <span style={{ color: "red" }}>*</span> (This is a selection for messages priority for recipients. If the message priority is set to High then this message will be recieved by the recipients who has selected to recieve only High priority messages) </label>
                        <div className="flex flex-wrap justify-content-left mb-5">
                            <div className="flex align-items-center">
                                <Checkbox onChange={e => setPriority(e.checked)} checked={priority}></Checkbox>
                                <label className="ml-2">High Priority Message</label>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Add Specific Recipient Dialog */}
            <Dialog
                visible={specificRecipientModal}
                style={{ width: '450px' }}
                header="Add Specific Recipients Who Will Recieve This Message"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeSpecificRecipientModal}
                        />
                        <Button
                            label="Save"
                            className="p-button-success"
                            onClick={() => addSpecificRecipientsToMessageApiCall()}
                            loading={specificRecipientLoader}
                        />
                    </>
                }
                onHide={closeSpecificRecipientModal}
            >
                {pageLoad ? (
                    <>
                        <DataTable
                            className="datatable-responsive"
                            value={subscribedUsers}
                            paginator={subscribedUsers.length > 0 && true}
                            rows={defaultRowOptions}
                            rowsPerPageOptions={defaultPageRowOptions}
                            paginatorTemplate={paginatorLinks}
                            currentPageReportTemplate={showingEntries}
                            emptyMessage={"No Recipients Found"}
                            selectionMode="checkbox"
                            selection={selectedSpecificRecipients}
                            dataKey="id"
                            onSelectionChange={(e) => setSelectedSpecificRecipients(e.value)}
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            {SMSCampaignRecipients.map((col, i) => {
                                if (col.field === 'sr_no') {
                                    return (
                                        <Column
                                            key={col.field}
                                            field={col.field}
                                            header={col.header}
                                            body={(_, { rowIndex }) => rowIndex + 1}
                                        />
                                    );
                                } else if (col.field === 'priority') {
                                    return (
                                        <Column
                                            key={col.field}
                                            field={col.field}
                                            header={col.header}
                                            body={msgPriorityTemplate}
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
                    </>
                ) : (
                    <>
                        <DataTable value={Skeletonitems}
                            className="datatable-responsive" stripedRows
                        >
                            {SMSCampaignRecipients.map((col, i) => (
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
            </Dialog>

            {/* Remove Recipient From Campaign Dialog */}
            <Dialog
                visible={removeRecipientModal}
                style={{ width: '450px' }}
                header="Remove Recipient From Campaign"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeRemoveRecipientModal}
                        />
                        <Button
                            label="Remove"
                            className="p-button-danger"
                            onClick={removeRecipientFromCampaignApiCall}
                            loading={removeRecipientLoader}
                        />
                    </>
                }
                onHide={closeRemoveRecipientModal}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: If you remove this recipient from campaign, all the history of sms sent to that recipient will be removed.
                    </span>
                </div>
            </Dialog>
        </>
    )
}
