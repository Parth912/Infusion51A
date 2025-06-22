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
import { FileUpload } from 'primereact/fileupload';
import { Avatar } from 'primereact/avatar';
import { BreadCrumb } from 'primereact/breadcrumb';

import moment from "moment/moment";

//Buffer Storage
import { Buffer } from 'buffer';

// Column
import { ClientsColumns } from '../../../appconfig/DatatableSetting';

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
import { clientDetailsValidate } from '../../../config/Validate';
import { chooseOptions, emptyTemplate, headerTemplate } from '../../../components/ImageUploadComponent/ImageUploadSetting';

export const ClientsList = () => {
    document.title = "Clients | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Clients</span>
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

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [clientsList, setClientsList] = useState<any>([]);
    const [countriesList, setCountriesList] = useState<any>([]);
    const [phonecode, setPhoneCode] = useState<any>("");
    const [status, setStatus] = useState<any>({ code: "All", name: "All" });
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [approveRejectId, setApproveRejectId] = useState("");
    const [approveRejectStatus, setApproveRejectStatus] = useState("");
    const [approveRejectModal, setApproveRejectModal] = useState(false);
    const [addUpdateModal, setAddUpdateModal] = useState<boolean>(false);
    const [editId, setEditId] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});
    const [clientDetails, setClientDetails] = useState<any>({});
    const [companyLogo, setCompanyLogo] = useState<any>("");
    const [isUserTypeUpdated, setIsUserTypeUpdated] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<any>(null);
    const [deleteLoader, setDeleteLoader] = useState<any>(false);

    // use effect method
    useEffect(() => {
        getClientsDataFromAPI();
        getCountriesFromAPi();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dates, status]);

    useEffect(() => {
        if (isUserTypeUpdated) {
            setIsUserTypeUpdated(false);
            addUpdateClientFormUI();
        }
    }, [isUserTypeUpdated]);

    // Get Clients Data from API
    const getClientsDataFromAPI = async () => {

        // Api call
        pageService
            .getClientsList(status.code, "client", null)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setClientsList([]);
                    } else {
                        setClientsList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setClientsList([]);
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
                getClientsDataFromAPI();
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
                <span className="block mt-2 sm:mt-0 p-input-icon-left">
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
                            placeholder="Select Status"
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
                            tooltip="Give Access" tooltipOptions={{ position: 'top' }}
                            disabled={rowData.status == 1 ? true : false}
                        />
                }
                <Button
                    icon="pi pi-pencil"
                    className="p-button-square p-btn-default"
                    tooltip="Update" tooltipOptions={{ position: 'top' }}
                    onClick={() => updateModalHandleChange(rowData.id)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-square p-btn-default"
                    tooltip="Delete" tooltipOptions={{ position: 'top' }}
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
        return (
            <>
                {rowData.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : rowData.status == 1 ? <><Badge value="Active" severity="success"></Badge></> : <><Badge value="Access Revoked" severity="danger"></Badge></>}
            </>
        )
    };

    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/client/details" state={{ client_id: rowData.id }}>{rowData?.profile_img != null && rowData?.profile_img != "null" && rowData?.profile_img != "" ?
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
                setClientDetails({
                    "first_name": responseData?.first_name,
                    "last_name": responseData?.last_name,
                    "email": responseData?.email,
                    "mobile": responseData?.mobile,
                    "company_name": responseData?.company_name,
                    "country": { code: responseData?.country?.iso, name: responseData?.country?.name, id: responseData?.country?.id, phonecode: responseData?.country?.phonecode }
                });
                setCompanyLogo(responseData?.company_logo);
                setPhoneCode("+" + responseData?.country?.phonecode);
                setPageLoad(true);
            } else {
                setPageLoad(true);
                setClientDetails({});
            }
        });
    };

    // Hide add update modal
    const hideAddUpdateModal = () => {
        setAddUpdateModal(false);
        setEditId(null);
        setClientDetails({});
        setCompanyLogo("");
        setPhoneCode("");
        setErrors({});
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
        setClientDetails({ ...clientDetails, [name]: val });
    };

    // for remove company logo
    const onTemplateRemoveCompanyLogo = (callback: any) => {
        setCompanyLogo({});
        callback();
    };

    // for upload company logo
    const itemCompanyLogoTemplate = (file: any, props: any) => {
        setCompanyLogo(file);
        removeFile.current = props.onRemove;
        return (
            <>
                <div className="uploadfilebox-wrapper">
                    <div className="uploadfilebox-area">
                        <img
                            alt={file.name}
                            role="presentation"
                            src={file.objectURL}
                            width={100}
                        />
                        <div className="uploadfilebox-contant">
                            <span className="uploadfilebox-name">{file.name}</span>
                            <Button
                                type="button"
                                icon="pi pi-times"
                                // label="Remove"
                                className="uploadfilebox-remove p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={() => onTemplateRemoveCompanyLogo(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // On submit of add update client
    const addUpdateClient = () => {
        const { errors, isError } = clientDetailsValidate(clientDetails, editId, companyLogo);
        setErrors(errors);
        if (!isError) {
            setSubmitLoading(true);

            // request data
            let formData = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            } else {
                //Password base64 convert
                let passwordBuff = Buffer.from(clientDetails?.password).toString('base64');
                formData.append('password', passwordBuff);
            }

            formData.append('user_type', "client");
            formData.append('first_name', clientDetails?.first_name);
            formData.append('last_name', clientDetails?.last_name);
            formData.append('email', clientDetails?.email);
            formData.append('mobile', clientDetails?.mobile);
            formData.append('company_name', clientDetails?.company_name);
            formData.append('country_id', clientDetails?.country?.id);

            // Check if company logo is selected or not for upload
            if (companyLogo && companyLogo.name) {
                formData.append('company_logo', companyLogo);
            }

            // call api
            pageService.addUpdateClientApiCall(formData).then((response) => {
                // Get response
                if (response) {
                    setSubmitLoading(false);
                    setAddUpdateModal(false);
                    setClientDetails({});
                    setEditId(null);
                    setCompanyLogo("");
                    setPhoneCode("");
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getClientsDataFromAPI();
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

    // Add Update client form
    const addUpdateClientFormUI = () => {
        return (
            <>
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">First Name <span style={{ color: "red" }}>*</span></label>
                        <InputText
                            value={clientDetails?.first_name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter First Name"
                            onChange={(e) => onInputChange(e, "first_name")}
                            className={errors['first_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['first_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Last Name <span style={{ color: "red" }}>*</span></label>
                        <InputText
                            value={clientDetails?.last_name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Last Name"
                            onChange={(e) => onInputChange(e, "last_name")}
                            className={errors['last_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['last_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Email <span style={{ color: "red" }}>*</span></label>
                        <InputText
                            value={clientDetails?.email}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Email"
                            onChange={(e) => onInputChange(e, "email")}
                            className={errors['email'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['email']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Company Name <span style={{ color: "red" }}>*</span></label>
                        <InputText
                            value={clientDetails?.company_name}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Company Name"
                            onChange={(e) => onInputChange(e, "company_name")}
                            className={errors['company_name'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['company_name']}</small>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="name">Country <span style={{ color: "red" }}>*</span></label>
                        <Dropdown
                            value={clientDetails?.country}
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
                        <label htmlFor="name">Mobile No. <span style={{ color: "red" }}>*</span></label>
                        <div className="p-inputgroup flex-1">
                            <span className="p-inputgroup-addon">
                                {phonecode !== "" ? phonecode : "+0"}
                            </span>
                            <InputText
                                value={clientDetails?.mobile}
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
                            <label htmlFor="name">Password <span style={{ color: "red" }}>*</span></label>
                            <InputText
                                type='password'
                                value={clientDetails?.password}
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

                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="company_logo">Company Logo <span className="required">*</span></label>
                        <FileUpload
                            ref={fileUploadRef}
                            accept="image/*"
                            name="company_logo[]"
                            className="imageupload"
                            chooseOptions={chooseOptions}
                            emptyTemplate={emptyTemplate}
                            headerTemplate={headerTemplate}
                            itemTemplate={itemCompanyLogoTemplate}
                        ></FileUpload>
                        <small className="p-invalid-txt">{errors['company_logo']}</small>
                    </div>
                    {editId != null && (
                        <>
                            <div className="field col-12 md:col-4 editImage">
                                {typeof (companyLogo) === 'string' ? (
                                    <>  <label htmlFor="photo">Old Image</label>
                                        <div className="oldimg-box">
                                            <img className="img-fluid" src={companyLogo} onClick={() => window.open(companyLogo, '_blank')} />
                                        </div>
                                    </>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </>
        )
    };

    // Hide delete modal
    const hideDeleteModal = () => {
        setDeleteId(null);
        setDeleteModal(false);
    };

    // Delete Client
    const deleteClientApiCall = () => {
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
                getClientsDataFromAPI();
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
                        <div className="page-title">Clients</div>
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
                        <Button className="p-button mr-2" label={localStorage.getItem('user_type') == "broker" ? "New Investor" : "Add New Client"} onClick={() => addModalHandleChange()} />
                    </div>
                </div>
            </div>

            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            {/* Datatable Start */}
                            {pageLoad ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive" stripedRows
                                        value={clientsList}
                                        paginator={clientsList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Clients Found"
                                    >
                                        {ClientsColumns.map((col, i) => {
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
                                        {ClientsColumns.map((col, i) => (
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
                header={!window.cn(approveRejectStatus) && approveRejectStatus == "Approved" ? "Give Access To Client" : "Revoke Client Access"}
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
                                Note: Once you Approve, an email will sent to the clients's provided email id with temporary password.
                            </span>
                        </>

                        : approveRejectStatus == "Rejected" ?
                            <>
                                <i
                                    className="pi pi-exclamation-triangle mr-3 delete-triangle"
                                    style={{ fontSize: '2rem' }}
                                />
                                <span className="delete-dialog-note">
                                    Note: Do you really want to revoke access of the admin for this client?
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
                header={editId !== null ? "Update Client Details" : "Add New Client"}
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
                {addUpdateClientFormUI()}
            </Dialog>

            {/* Delete Dialog */}
            <Dialog
                visible={deleteModal}
                style={{ width: '450px' }}
                header="Delete Client Details"
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
                            onClick={deleteClientApiCall}
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
                        Note: Do you really want to delete this client?
                    </span>
                </div>
            </Dialog>
        </>
    );
};
