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
import { BreadCrumb } from 'primereact/breadcrumb';
import { Checkbox } from 'primereact/checkbox';
import { Tooltip } from 'primereact/tooltip';
import { MultiSelect } from 'primereact/multiselect';

import moment from "moment/moment";

//Buffer Storage
import { Buffer } from 'buffer';

// Column
import { InvestorsColumns } from '../../../appconfig/DatatableSetting';

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
import { convertToInvestorDocsValidate, investorsDetailsValidate } from '../../../config/Validate';

export const InvestorsList = () => {
    document.title = "Potential Investors | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investors</span>
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

    // Page service
    const pageService = new PageService();

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [investorsList, setInvestorsList] = useState<any>([]);
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
    const [investorDetails, setInvestorDetails] = useState<any>({});
    const [isUserTypeUpdated, setIsUserTypeUpdated] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<any>(null);
    const [deleteLoader, setDeleteLoader] = useState<any>(false);
    const [NDASign, setNDASign] = useState<boolean>(false);
    const [NDAList, setNDAList] = useState<any>([]);
    const [convertToInvestorId, setConvertToInvestorId] = useState<any>(null);
    const [convertToInvestorModal, setConvertToInvestorModal] = useState<boolean>(false);
    const [convertToInvestorLoader, setConvertToInvestorLoader] = useState<boolean>(false);
    const [convertingDocsList, setConvertingDocsList] = useState<any>([]);
    const [selectedConvertingDocs, setSelectedConvertingDocs] = useState<any>([]);

    // use effect method
    useEffect(() => {
        getInvestorsDataFromAPI();
        getCountriesFromAPi();
        getNDAListFromAPI();
        getConvertingDocsList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dates, status]);

    useEffect(() => {
        if (isUserTypeUpdated) {
            setIsUserTypeUpdated(false);
            addUpdateInvestorFormUI();
        }
    }, [isUserTypeUpdated]);

    // Get converting docs list
    const getConvertingDocsList = () => {
        // Api call
        pageService
            .getAllConvertInvestorDoc("dropdown")
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

    // Get all nda
    const getNDAListFromAPI = () => {

        // Api call
        pageService.listAllNDA().then((response) => {
            // Get response
            if (response) {
                const DataList = response;
                if (DataList.length == 0) {
                    setNDAList([]);
                } else {
                    let tempNDAList: any = [];
                    DataList.map((item: any, index: any) => {
                        tempNDAList.push({
                            "code": item.id,
                            "name": item.name
                        });
                    });
                    setNDAList(tempNDAList);
                }
            } else {
                setNDAList([]);
            }
        });
    };

    // Get Clients Data from API
    const getInvestorsDataFromAPI = async () => {

        // Api call
        pageService
            .getClientsList(status.code, "investor", localStorage.getItem("user_type") == "broker" ? localStorage.getItem("id") : null)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setInvestorsList([]);
                    } else {
                        setInvestorsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setInvestorsList([]);
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
                getInvestorsDataFromAPI();
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

    // right part of toolbar
    const rightToolbarTemplate = () => {
        return (
            <>
                {localStorage.getItem('user_type') == "broker" ?
                    <></>
                    :
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
                }
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
                            tooltip="Revoke Access" tooltipOptions={{ position: 'top' }}
                            disabled={rowData.status == 1 ? true : false}
                        />
                }
                <Button
                    icon="pi pi-pencil"
                    tooltip='Edit'
                    className="p-button-square p-btn-default"
                    onClick={() => updateModalHandleChange(rowData.id)}
                />
                <Button
                    icon="pi pi-trash"
                    tooltip='Delete'
                    className="p-button-square p-btn-default"
                    onClick={() => deleteModalHandleChange(rowData.id)}
                />
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
        const createdAtMoment = moment(rowData?.created_at, 'YYYY-MM-DD HH:mm:ss');

        // Calculate the revoke date by adding loginRevoke days to created_at
        const revokeDate = createdAtMoment.add(rowData?.login_revoke, 'days');

        // Calculate the difference between revokeDate and now
        const now = moment();
        const differenceInDays = revokeDate.diff(now, 'days') + 1;

        return (
            <>
                {rowData.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : rowData.status == 1 ? <><Badge value="Active" severity="success"></Badge><Badge className='ml-1' severity='warning' value={<><i className="pi pi-clock"></i> {differenceInDays}</>} ></Badge> </> : <><Badge value="Access Revoked" severity="danger"></Badge></>}
            </>
        )
    };

    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/investor/details" state={{ investor_id: rowData.id }}>{rowData?.profile_img != null && rowData?.profile_img != "null" && rowData?.profile_img != "" ?
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

    const ndaTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>{rowData?.is_nda === 1 ? <Badge value="Sign Pending" severity="warning"></Badge> : rowData?.is_nda === 2 ? <><Tooltip target=".nda-status" /><Badge value="Signed" severity="success"></Badge><i className="pi pi-eye nda-status ml-2" data-pr-tooltip="View NDA" style={{ color: 'grey', cursor: 'pointer' }} onClick={() => window.open(rowData?.signed_nda_url, '_blank')}></i></> : <Badge value="No NDA" severity="info"></Badge>}</>
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
        getSingleClientData(id);
    };

    // Get single client data on click of edit
    const getSingleClientData = (id: any) => {
        setPageLoad(true);
        // Api call
        pageService.getSingleClientDetails(id).then((response) => {
            // Get response
            if (response) {
                const responseData = response;
                setInvestorDetails({
                    "first_name": responseData?.first_name,
                    "last_name": responseData?.last_name,
                    "email": responseData?.email,
                    "mobile": responseData?.mobile,
                    "login_revoke": responseData?.login_revoke,
                    "country": { code: responseData?.country?.iso, name: responseData?.country?.name, id: responseData?.country?.id, phonecode: responseData?.country?.phonecode },
                    "nda_id": responseData?.is_nda == 1 && responseData?.nda_id !== null ? { code: responseData?.nda?.id, name: responseData?.nda?.name } : null
                });
                setPhoneCode("+" + responseData?.country?.phonecode);
                if(responseData?.is_nda == 1){
                    setNDASign(true);
                }else{
                    setNDASign(false);
                }
                setPageLoad(true);
            } else {
                setPageLoad(true);
                setInvestorDetails({});
            }
        });
    };

    // Hide add update modal
    const hideAddUpdateModal = () => {
        setAddUpdateModal(false);
        setEditId(null);
        setInvestorDetails({});
        setNDASign(false);
        setPhoneCode("");
        setErrors({});
    };

    //On Change Job Post Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == "country") {
            val = e;
            setPhoneCode("+" + e.phonecode);
        } else if (name == "nda_id"){
            val = e;
        } else {
            val = (e.target && e.target.value) || '';
        }
        setInvestorDetails({ ...investorDetails, [name]: val });
    };

    // On submit of add update client
    const addUpdateClient = () => {
        const { errors, isError } = investorsDetailsValidate(investorDetails, editId, NDASign);
        setErrors(errors);
        if (!isError) {
            setSubmitLoading(true);

            // request data
            let formData: any = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            } else {
                //Password base64 convert
                let passwordBuff = Buffer.from(investorDetails?.password).toString('base64');
                formData.append('password', passwordBuff);
            }

            formData.append('user_type', "investor");
            formData.append('login_revoke', investorDetails?.login_revoke);
            formData.append('first_name', investorDetails?.first_name);
            formData.append('last_name', investorDetails?.last_name);
            formData.append('email', investorDetails?.email);
            formData.append('mobile', investorDetails?.mobile);
            formData.append('country_id', investorDetails?.country?.id);
            if(NDASign == true){
                formData.append('is_nda', 1);
                formData.append('nda_id', investorDetails?.nda_id?.code)
            }else{
                formData.append('is_nda', 0);
                formData.append('nda_id', null);
            }

            // call api
            pageService.addUpdateClientApiCall(formData).then((response) => {
                // Get response
                if (response) {
                    setSubmitLoading(false);
                    setAddUpdateModal(false);
                    setInvestorDetails({});
                    setEditId(null);
                    setNDASign(false);
                    setPhoneCode("");
                    getInvestorsDataFromAPI();
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

    // Add Update Investor form
    const addUpdateInvestorFormUI = () => {
        return (
            <>
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">First Name <span className="required">*</span></label>
                        <InputText
                            value={investorDetails?.first_name}
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
                            value={investorDetails?.last_name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Last Name"
                            onChange={(e) => onInputChange(e, "last_name")}
                            className={errors['last_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['last_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Email <span className="required">*</span></label>
                        <InputText
                            value={investorDetails?.email}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Email"
                            onChange={(e) => onInputChange(e, "email")}
                            className={errors['email'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['email']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Login Access Days <span className="required">*</span></label>
                        <InputText
                            value={investorDetails?.login_revoke}
                            keyfilter="int"
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Login Access Days"
                            onChange={(e) => onInputChange(e, "login_revoke")}
                            className={errors['login_revoke'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['login_revoke']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Country <span className="required">*</span></label>
                        <Dropdown
                            value={investorDetails?.country}
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
                                value={investorDetails?.mobile}
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
                    {editId === null ?
                        <div className="field col-6">
                            <label htmlFor="name">Password <span className="required">*</span></label>
                            <InputText
                                type='password'
                                value={investorDetails?.password}
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
                <br/>
                <div className="flex flex-wrap justify-content-left mb-5">
                    <div className="flex align-items-center">
                        <Checkbox onChange={e => setNDASign(e.checked)} checked={NDASign}></Checkbox>
                        <label className="ml-2">NDA Sign</label>
                    </div>
                </div>
                {
                    NDASign === true ? 
                        <div className="formgrid grid">
                            <div className="field col-6">
                                <label htmlFor="name">NDA Document <span className="required">*</span></label>
                                <Dropdown
                                    value={investorDetails?.nda_id}
                                    name="name"
                                    options={NDAList}
                                    filter
                                    optionLabel="name"
                                    placeholder="Select NDA Document"
                                    onChange={(e) => onInputChange(e.value, "nda_id")}
                                    className={errors['nda_id'] && 'p-invalid'}
                                />
                                <small className="p-invalid-txt">{errors['nda_id']}</small>
                            </div>
                        </div>
                    :
                        <></>
                }
            </>
        )
    };

    // Hide delete modal
    const hideDeleteModal = () => {
        setDeleteId(null);
        setDeleteModal(false);
    };

    // Delete Investor
    const deleteInvestorApiCall = () => {
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
                getInvestorsDataFromAPI();
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

    // page template
    return (
        <>
        <Toast ref={toast} />
        <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Potential Investors</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <Toolbar className="page-header-search-area" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                        </div>
                        <Button className="p-button mr-2" label="Add New Investor" onClick={() => addModalHandleChange()} />
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
                                    value={investorsList}
                                    paginator={investorsList.length > 0 && true}
                                    globalFilter={globalFilter}
                                    rows={defaultRowOptions}
                                    rowsPerPageOptions={defaultPageRowOptions}
                                    paginatorTemplate={paginatorLinks}
                                    currentPageReportTemplate={showingEntries}
                                    emptyMessage="No Investors Found"
                                >
                                    {InvestorsColumns.map((col, i) => {
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
                                                />
                                            );
                                        } else if (col.field === 'nda') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={ndaTemplate}
                                                    filter
                                                    sortable
                                                />
                                            );
                                        } else if (col.field === 'created_at') {
                                            return (
                                                <Column
                                                    key={col.field}
                                                    field={col.field}
                                                    header={col.header}
                                                    body={dateFormatCreatedAtTemplate}
                                                    filter
                                                    sortable
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
                                    {InvestorsColumns.map((col, i) => (
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
                header={!window.cn(approveRejectStatus) && approveRejectStatus == "Approved" ? "Give Access To Investor" : "Revoke Investor Access"}
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
                                Note: Once you Approve, an email will sent to the investor's provided email id with temporary password.
                            </span>
                        </>

                        : approveRejectStatus == "Rejected" ?
                            <>
                                <i
                                    className="pi pi-exclamation-triangle mr-3 delete-triangle"
                                    style={{ fontSize: '2rem' }}
                                />
                                <span className="delete-dialog-note">
                                    Note: Do you really want to revoke access of the dashboard for this investor?
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
                header={editId !== null ? "Update Investor Details" : "Add Investor User"}
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
                {addUpdateInvestorFormUI()}
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
                            icon="pi pi-times"
                            className="p-button-secondary"
                            onClick={hideDeleteModal}
                        />
                        <Button
                            label="Delete"
                            icon="pi pi-check"
                            className="p-button-danger"
                            onClick={deleteInvestorApiCall}
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
                        Note: Do you really want to delete this broker?
                    </span>
                </div>
            </Dialog>
        </>
    );
};
