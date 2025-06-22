import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

//Prime React Component Inbuilt
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { OverlayPanel } from 'primereact/overlaypanel';
import { BreadCrumb } from 'primereact/breadcrumb';

import moment from "moment/moment";

//Buffer Storage
import { Buffer } from 'buffer';

// Column
import { LeadGeneatorsColumns } from '../../../appconfig/DatatableSetting';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
    userStatus,
} from '../../../appconfig/Settings';

//Services
import PageService from '../../../service/PageService';
import { addDataScrapperToTeamValidate, leadGeneratorsDetailsValidate } from '../../../config/Validate';

export const LeadGeneratorsList = () => {
    document.title = "Role Management | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Lead Generators</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    // Date Object
    let today = new Date();
    const [dates, setDates] = useState<string | Date | Date[] | any | null>([new Date(today.setDate(today.getDate() - 31)), new Date()]);

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);
    const op = useRef<any>(null);

    // Page service
    const pageService = new PageService();

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [leadGeneratorsList, setLeadGeneratorsList] = useState<any>([]);
    const [countriesList, setCountriesList] = useState<any>([]);
    const [phonecode, setPhoneCode] = useState<any>("");
    const [status, setStatus] = useState<any>({ name: 'All', code: "All" });
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [approveRejectId, setApproveRejectId] = useState("");
    const [approveRejectStatus, setApproveRejectStatus] = useState("");
    const [approveRejectModal, setApproveRejectModal] = useState(false);
    const [addUpdateModal, setAddUpdateModal] = useState<boolean>(false);
    const [editId, setEditId] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    const [leadGeneratorDetails, setLeadGeneratorDetails] = useState<any>({});
    const [isUserTypeUpdated, setIsUserTypeUpdated] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<any>(null);
    const [deleteLoader, setDeleteLoader] = useState<any>(false);
    const [leadGenId, setLeadGenId] = useState<any>("");
    const [dataScrapperToAdd, setDataScrapperToAdd] = useState<any>([]);
    const [selectedDataScrapper, setselectedDataScrapper] = useState<any>(null);
    const [dataScrappeLoader, setDataScrappeLoader] = useState<boolean>(false);
    const [broker, setBroker] = useState<any>([]);

    // use effect method
    useEffect(() => {
        getLeadGeneratorsDataFromAPI();
        getCountriesFromAPi();
        if (localStorage.getItem("user_type") == "teamleader") {
            getLeadsListFilterFromAPI(null);
        }
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dates, status]);

    useEffect(() => {
        if (isUserTypeUpdated) {
            setIsUserTypeUpdated(false);
            addUpdateLeadGeneratorFormUI();
        }
    }, [isUserTypeUpdated]);

    // Get brokers dropdown form api
    const getLeadsListFilterFromAPI = (state: any) => {
        // Api call
        pageService
            .getLeadsListFilter(state?.datascrapper_id)
            .then((response) => {
                // Get response
                if (response) {
                    let brokersVals = response?.brokers.filter((item: any) => item.code !== "All");
                    setBroker(brokersVals);
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                }
            });
    };

    // Get Lead Generators Data from API
    const getLeadGeneratorsDataFromAPI = async () => {

        // Api call
        pageService
            .getClientsList(status.code, "leadgen", null)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setLeadGeneratorsList([]);
                    } else {
                        setLeadGeneratorsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setLeadGeneratorsList([]);
                }
            });
    };

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

    // Approve Reject User
    const approveRejectClient = async () => {
        setSubmitLoading(true);

        // request data
        let formData = new FormData();
        formData.append('id', approveRejectId);
        formData.append('status', approveRejectStatus);

        // call api
        pageService.approveRejectClient(formData).then((response) => {
            // Get response
            if (response) {
                setSubmitLoading(false);
                setApproveRejectModal(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                getLeadGeneratorsDataFromAPI();
            } else {
                setSubmitLoading(false);
                setApproveRejectModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong, Please try again.',
                });
            }
        });
    }

    const approveUser = (id: any, status: any) => {
        setApproveRejectId(id);
        setApproveRejectStatus("Approved");
        setApproveRejectModal(true);
    }

    const rejectUser = (id: any, status: any) => {
        setApproveRejectId(id);
        setApproveRejectStatus("Rejected");
        setApproveRejectModal(true);
    }

    // On Date Change
    const onDateChange = (e: any) => {
        setDates(e.value);
    };

    // left part of toolbar
    const leftToolbarTemplate = () => {
        return (
            <>
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                        placeholder="Search..."
                    />
                </span>
            </>
        );
    };

    // Get not assigned data scrapper from api 
    const getNotAssignedDataScrapperFromAPI = (user_id: any) => {
        // Api call
        pageService
            .getNotAssignedLeadGen(user_id, "datascrapper")
            .then((response) => {
                // Get response
                if (response) {
                    setDataScrapperToAdd(response);
                } else {
                    setDataScrapperToAdd([]);
                }
            });
    };

    // Handle on click add new data scrapper
    const handleOnclickAddNewDataScrapper = (e: any, broker_id: any) => {
        op.current.toggle(e);
        setLeadGenId(broker_id);

        // Api call to get data scrappers which are not in team
        getNotAssignedDataScrapperFromAPI(broker_id);
    };

    // Hide add new lead generator
    const hideAddNewDataScrapper = () => {
        setLeadGenId("");
        setselectedDataScrapper(null);
        setErrors({});
        setDataScrappeLoader(false);
    };

    // On submit to add lead generator to the team
    const onSubmitToAddLeadGenToTeam = () => {
        const { errors, isError } = addDataScrapperToTeamValidate(selectedDataScrapper);
        setErrors(errors);
        if (!isError) {
            setDataScrappeLoader(true);

            // request data
            let formData = new FormData();
            formData.append('type', "datascrapper");
            formData.append('data_scrapper_id', selectedDataScrapper.code);
            formData.append('leadgen_id', leadGenId);

            // call api
            pageService.addTeamMembers(formData).then((response) => {
                // Get response
                if (response) {
                    setDataScrappeLoader(false);
                    setselectedDataScrapper(null);
                    getNotAssignedDataScrapperFromAPI(leadGenId);
                    getLeadGeneratorsDataFromAPI();
                    setErrors({});
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    setDataScrappeLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setDataScrappeLoader(false);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };


    // right part of toolbar
    const rightToolbarTemplate = () => {
        return (
            <>
                <Dropdown
                    value={status}
                    onChange={(e) => setStatus(e.value)}
                    options={userStatus}
                    optionLabel="name"
                    placeholder="Approval Status"
                ></Dropdown>
                {/* <div style={{ marginLeft: '15px' }}></div>
                <Calendar
                    value={dates}
                    dateFormat="dd/mm/yy"
                    onChange={(e) => onDateChange(e)}
                    selectionMode="range"
                    showIcon
                /> */}
            </>
        );
    };

    // Delete modal handle change
    const deleteModalHandleChange = (id: any) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    // for column action
    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="tb-actions">
                {
                    rowData.user_type != "admin" ?
                        <>
                            {
                                rowData.status == 1 ?
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-square p-button-outlined mr-3"
                                        onClick={() => rejectUser(rowData.id, rowData.status)}
                                        tooltip="Revoke Access" tooltipOptions={{ position: 'top' }}
                                        disabled={rowData.status == 2 ? true : false}
                                    />
                                    :
                                    <Button
                                        icon="pi pi-check"
                                        className="p-button-square p-button-outlined mr-3"
                                        onClick={() => approveUser(rowData.id, rowData.status)}
                                        tooltip="Give Access" tooltipOptions={{ position: 'top' }}
                                        disabled={rowData.status == 1 ? true : false}
                                    />
                            }
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-square p-btn-default"
                                onClick={() => updateModalHandleChange(rowData.id)}
                            />
                            <Button
                                icon="pi pi-trash"
                                className="p-button-square p-btn-default"
                                onClick={() => deleteModalHandleChange(rowData.id)}
                            />
                        </>
                        :
                        <div>--</div>
                }
            </div>
        );
    };

    const dateFormatCreatedAtTemplate = (rowData: any, rowIndex: any) => {

        return (
            <>
                {rowData.created_at === rowData[rowIndex.field] && rowData.created_at !== null ? moment.utc(rowData.created_at).format('MMM DD, YYYY') : '-'}
            </>
        );
    };

    const statusTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : rowData.status == 1 ? <><Badge value="Active" severity="success"></Badge></> : <><Badge value="Access Revoked" severity="danger"></Badge></>}
            </>
        )
    };

    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/leadgenerators/details" state={{ leadgenerator_id: rowData?.id }}>{rowData?.profile_img != null && rowData?.profile_img != "null" && rowData?.profile_img != "" ?
                    <Avatar className="tb-avatar-img" image={rowData?.profile_img} shape="circle" /> : <Avatar className='tb-avatar-img user-list-avatar' label={rowData?.full_name.charAt(0).toUpperCase()} shape="circle" />}<div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.full_name}</div><div className="tb-avatar-text">{rowData?.email}</div></div>
                </Link>
            </>
        )
    };

    const mobileTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>+{rowData?.country?.phonecode} {rowData?.mobile}</>
        )
    };

    const hideApproveConfirmModal = () => {
        setApproveRejectId("");
        setApproveRejectStatus("");
        setApproveRejectModal(false);
    };

    // Add modal handle change
    const addModalHandleChange = () => {
        setAddUpdateModal(true);
    };

    // Update modal handle change
    const updateModalHandleChange = (id: any) => {
        setEditId(id);
        setAddUpdateModal(true);
        getSingleLeadGeneratorData(id);
    };

    // Get single lead generator data on click of edit
    const getSingleLeadGeneratorData = (id: any) => {
        setPageLoad(true);
        // Api call
        pageService.getSingleClientDetails(id).then((response) => {
            // Get response
            if (response) {
                const responseData = response;
                setLeadGeneratorDetails({
                    "first_name": responseData?.first_name,
                    "last_name": responseData?.last_name,
                    "email": responseData?.email,
                    "mobile": responseData?.mobile,
                    "country": { code: responseData?.country?.iso, name: responseData?.country?.name, id: responseData?.country?.id, phonecode: responseData?.country?.phonecode }
                });
                setPhoneCode("+" + responseData?.country?.phonecode);
                setPageLoad(true);
            } else {
                setPageLoad(true);
                setLeadGeneratorDetails({});
            }
        });
    };

    // Hide add update modal
    const hideAddUpdateModal = () => {
        setAddUpdateModal(false);
        setEditId(null);
        setLeadGeneratorDetails({});
        setPhoneCode("");
        setErrors({});
    };

    //On Change Job Post Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == "assigned_broker_id") {
            val = e;
        } else if (name == "country") {
            val = e;
            setPhoneCode("+" + e.phonecode);
        } else {
            val = (e.target && e.target.value) || '';
        }
        setLeadGeneratorDetails({ ...leadGeneratorDetails, [name]: val });
    };

    // On submit of add update client
    const addUpdateClient = () => {
        const { errors, isError } = leadGeneratorsDetailsValidate(leadGeneratorDetails, editId);
        setErrors(errors);
        if (!isError) {
            setSubmitLoading(true);

            // request data
            let formData = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            } else {
                //Password base64 convert
                let passwordBuff = Buffer.from(leadGeneratorDetails?.password).toString('base64');
                formData.append('password', passwordBuff);
            }

            if (localStorage.getItem("user_type") == "teamleader" && editId === null) {
                formData.append('assigned_broker_id', leadGeneratorDetails?.assigned_broker_id?.code);
            }

            formData.append('user_type', "leadgen");
            formData.append('first_name', leadGeneratorDetails?.first_name);
            formData.append('last_name', leadGeneratorDetails?.last_name);
            formData.append('email', leadGeneratorDetails?.email);
            formData.append('mobile', leadGeneratorDetails?.mobile);
            formData.append('country_id', leadGeneratorDetails?.country?.id);

            // call api
            pageService.addUpdateClientApiCall(formData).then((response) => {
                // Get response
                if (response) {
                    setSubmitLoading(false);
                    setAddUpdateModal(false);
                    setLeadGeneratorDetails({});
                    setEditId(null);
                    setPhoneCode("");
                    getLeadGeneratorsDataFromAPI();
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    setSubmitLoading(false);
                    setAddUpdateModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setSubmitLoading(false);
                setAddUpdateModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
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

    // Add Update lead generators form
    const addUpdateLeadGeneratorFormUI = () => {
        return (
            <>
                <div className="formgrid grid">
                    {
                        localStorage.getItem('user_type') == "teamleader" && editId === null ?
                            <div className="field col-6">
                                <label htmlFor="name">Assign Broker To Lead Generator <span style={{ color: "red" }}>*</span></label>
                                <Dropdown
                                    value={leadGeneratorDetails?.assigned_broker_id}
                                    name="name"
                                    options={broker}
                                    filter
                                    optionLabel="name"
                                    placeholder="Assign To Broker"
                                    onChange={(e) => onInputChange(e.value, "assigned_broker_id")}
                                    className={errors['assigned_broker_id'] && 'p-invalid'}
                                />
                                <small className="p-invalid-txt">{errors['assigned_broker_id']}</small>
                            </div>
                            :
                            <></>
                    }
                    <div className="field col-6">
                        <label htmlFor="name">First Name <span className="required">*</span></label>
                        <InputText
                            value={leadGeneratorDetails?.first_name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter First Name"
                            onChange={(e) => onInputChange(e, "first_name")}
                            className={errors['first_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['first_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Last Name <span className="required">*</span></label>
                        <InputText
                            value={leadGeneratorDetails?.last_name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Last Name"
                            onChange={(e) => onInputChange(e, "last_name")}
                            className={errors['last_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['last_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Country <span className="required">*</span></label>
                        <Dropdown
                            value={leadGeneratorDetails?.country}
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
                        <label htmlFor="name">Mobile No. <span className="required">*</span></label>
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                {phonecode !== "" ? phonecode : "+0"}
                            </span>
                            <InputText
                                value={leadGeneratorDetails?.mobile}
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
                    <div className="field col-6">
                        <label htmlFor="name">Email <span className="required">*</span></label>
                        <InputText
                            value={leadGeneratorDetails?.email}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Email"
                            onChange={(e) => onInputChange(e, "email")}
                            className={errors['email'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['email']}</small>
                    </div>
                    {editId === null ?
                        <div className="field col-6">
                            <label htmlFor="name">Password <span className="required">*</span></label>
                            <InputText
                                type='password'
                                value={leadGeneratorDetails?.password}
                                name="name"
                                autoComplete="off"
                                placeholder="Enter Password"
                                onChange={(e) => onInputChange(e, "password")}
                                className={errors['password'] && 'p-invalid'}
                            />
                            <small className="p-invalid-txt">{errors['password']}</small>
                        </div>
                        :
                        <></>
                    }
                </div>
            </>
        )
    };

    // Hide delete modal
    const hideDeleteModal = () => {
        setDeleteId(null);
        setDeleteModal(false);
    };

    // Delete Lead Generators
    const deleteLeadGeneratorApiCall = () => {
        setDeleteLoader(true);

        // call api
        pageService.deleteClient(deleteId).then((response) => {
            // Get response
            if (response) {
                setDeleteLoader(false);
                setDeleteModal(false);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.message,
                });
                getLeadGeneratorsDataFromAPI();
            } else {
                setDeleteLoader(false);
                setDeleteModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Something went wrong, Please try again.',
                });
            }
        });
    };

    const dataScrapperTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <div className="tb-avatar-box p-avatar-group p-component" style={{ gap: "4px" }} data-pc-name="avatargroup" data-pc-section="root">
                    {
                        rowData?.datascrapper.length > 0 && rowData?.datascrapper.map((item: any, index: any) => {
                            return (
                                <>
                                    {
                                        item?.data_scrapper?.profile_img == null || item?.data_scrapper?.profile_img == "null" || item?.data_scrapper?.profile_img == "" ?
                                            <Avatar onClick={() => navigate('/leads', { state: { datascrapper_id: item?.data_scrapper?.id, leadgen_id: item?.leadgen_id } })} className='user-list-avatar' id='avatar-tooltip' data-pr-tooltip={item?.data_scrapper?.full_name} label={item?.data_scrapper?.full_name.charAt(0).toUpperCase()} icon="pi pi-plus" shape="circle" />
                                            :
                                            <div id="avatar-tooltip" className="p-avatar p-component p-avatar-image p-avatar-circle" data-pc-name="avatar" data-pc-section="root" data-pr-tooltip={item?.data_scrapper?.full_name}>
                                                <img alt="avatar" src={item?.data_scrapper?.profile_img} data-pc-section="image" />
                                            </div>
                                    }
                                </>
                            )
                        })
                    }

                    <Avatar onClick={(e: any) => handleOnclickAddNewDataScrapper(e, rowData?.id)} className='user-list-avatar' style={{ backgroundColor: '#e5e7eb' }} icon="pi pi-plus" shape="circle" />
                    <Tooltip target="#avatar-tooltip" mouseTrack position='top' />
                    <OverlayPanel ref={op} onHide={() => hideAddNewDataScrapper()}>
                        <div className="overlaypanel-card-box">
                            <div className="overlaypanel-card-title">Add To Team</div>
                            <div className="overlaypanel-card-body">
                                <div className="grid">
                                    <div className="col-12">
                                        <div className="overlaypanel-card-content">
                                            <Dropdown
                                                value={selectedDataScrapper}
                                                onChange={(e) => setselectedDataScrapper(e.value)}
                                                options={dataScrapperToAdd}
                                                optionLabel="name"
                                                placeholder="Select Data Scrapper"
                                            ></Dropdown>
                                            <Button
                                                icon="pi pi-check"
                                                className="p-button-outlined ml-2"
                                                onClick={() => onSubmitToAddLeadGenToTeam()}
                                                loading={dataScrappeLoader}
                                            />
                                        </div>
                                        <small className="p-invalid-txt mt-2">{errors['leadgen']}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </OverlayPanel>
                </div>
            </>
        )
    };

    // page template
    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    {/* <div className="page-header-info">
                        <div className="page-title">Lead Generators</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div> */}
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <Toolbar className="page-header-search-area" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                        </div>
                        <Button className="p-button mr-2" label="Add New Lead Generator" onClick={() => addModalHandleChange()} />
                    </div>
                </div>
            </div>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            {/* Datatable Start */}
                            {pageLoad ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive" stripedRows
                                        value={leadGeneratorsList}
                                        paginator={leadGeneratorsList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Lead Generators Found"
                                    >
                                        {LeadGeneatorsColumns.map((col, i) => {
                                            if (col.field === 'status') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={statusTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'mobile') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={mobileTemplate}
                                                        filter
                                                        sortable
                                                    />
                                                );
                                            } else if (col.field === 'full_name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={fullNameTemplate}
                                                        filter
                                                        sortable
                                                    />
                                                );
                                            } else if (col.field === 'datascrapper') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={dataScrapperTemplate}
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
                                        {LeadGeneatorsColumns.map((col, i) => (
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

            {/* Approve Reject Dialog */}
            <Dialog
                visible={approveRejectModal}
                style={{ width: '450px' }}
                header={!window.cn(approveRejectStatus) && approveRejectStatus == "Approved" ? "Give Access To Lead Generator" : "Revoke Lead Generator Access"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideApproveConfirmModal}
                        />
                        {
                            !window.cn(approveRejectStatus) && approveRejectStatus == "Approved" ?
                                <>
                                    <Button
                                        label="Approve"
                                        className="p-button-success"
                                        onClick={approveRejectClient}
                                        loading={submitLoading}
                                    />
                                </>
                                :
                                <>
                                    <Button
                                        label="Reject"
                                        className="p-button-danger"
                                        onClick={approveRejectClient}
                                        loading={submitLoading}
                                    />
                                </>
                        }

                    </>
                }
                onHide={hideApproveConfirmModal}
            >
                <div className="flex align-items-center justify-content-start">
                    {!window.cn(approveRejectStatus) && approveRejectStatus == "Approved" ?
                        <>
                            <i
                                className="pi pi-verified mr-3 approve-triangle"
                                style={{ fontSize: '2rem' }}
                            />
                            <span className="approve-dailog-note">
                                Note: Once you Approve, an email will sent to the lead generator's provided email id with temporary password.
                            </span>
                        </>

                        : approveRejectStatus == "Rejected" ?
                            <>
                                <i
                                    className="pi pi-exclamation-triangle mr-3 delete-triangle"
                                    style={{ fontSize: '2rem' }}
                                />
                                <span className="delete-dialog-note">
                                    Note: Do you really want to revoke access of the admin for this lead generator?
                                </span>
                            </>

                            : <></>

                    }
                </div>
            </Dialog>

            {/* Add Update Dialog */}
            <Dialog
                visible={addUpdateModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={editId !== null ? "Update Lead Generators Details" : "Add New Lead Generators"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideAddUpdateModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addUpdateClient()}
                            loading={submitLoading}
                        />
                    </>
                }
                onHide={hideAddUpdateModal}
            >
                {addUpdateLeadGeneratorFormUI()}
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                visible={deleteModal}
                style={{ width: '450px' }}
                header="Delete Investment Material"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideDeleteModal}
                        />
                        <Button
                            label="Delete"
                            className="p-button-danger"
                            onClick={deleteLeadGeneratorApiCall}
                            loading={deleteLoader}
                        />
                    </>
                }
                onHide={hideDeleteModal}
            >
                <div className="flex align-items-center justify-content-start">
                    <i
                        className="pi pi-exclamation-triangle mr-3 delete-triangle"
                        style={{ fontSize: '2rem' }}
                    />
                    <span className="delete-dialog-note">
                        Note: Do you really want to delete this lead generator?
                    </span>
                </div>
            </Dialog>
        </>
    );
};
