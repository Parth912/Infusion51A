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
import { TeamLeaderColumns } from '../../../appconfig/DatatableSetting';

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
import { addBrokerToTeamValidate, teamLeaderDetailsValidate } from '../../../config/Validate';

export const TeamLeaderList = () => {
    document.title = "Role Management | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Team Leaders</span>
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
    const [teamLeadersList, setTeamLeadersList] = useState<any>([]);
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
    const [teamLeaderDetails, setTeamLeaderDetails] = useState<any>({});
    const [isUserTypeUpdated, setIsUserTypeUpdated] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState<any>(null);
    const [deleteLoader, setDeleteLoader] = useState<any>(false);
    const [teamLeaderId, setTeamLeaderId] = useState<any>("");
    const [brokersToAdd, setBrokersToAdd] = useState<any>([]);
    const [selectedBroker, setSelectedBroker] = useState<any>(null);
    const [brokerToTeamLoader, setBrokerToTeamLoader] = useState<boolean>(false);

    // use effect method
    useEffect(() => {
        getTeamLeadersDataFromAPI();
        getCountriesFromAPi();
        getBrokersToAddTeamFromAPI();
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [dates, status]);

    useEffect(() => {
        if (isUserTypeUpdated) {
            setIsUserTypeUpdated(false);
            addUpdateTeamLeaderFormUI();
        }
    }, [isUserTypeUpdated]);

    // Get brokers for add dropdown
    const getBrokersToAddTeamFromAPI = () => {
        // Api call
        pageService
            .getBrokersToAddTeam()
            .then((response) => {
                // Get response
                if (response) {
                    setBrokersToAdd(response["broker_list"]);
                } else {
                    setBrokersToAdd([]);
                }
            });
    };

    // Get Team Leaders Data from API
    const getTeamLeadersDataFromAPI = async () => {

        // Api call
        pageService
            .getClientsList(status.code, "teamleader", null)
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setTeamLeadersList([]);
                    } else {
                        setTeamLeadersList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setTeamLeadersList([]);
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
                getTeamLeadersDataFromAPI();
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

    // Status template
    const statusTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                {rowData.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : rowData.status == 1 ? <><Badge value="Active" severity="success"></Badge></> : <><Badge value="Access Revoked" severity="danger"></Badge></>}
            </>
        )
    };

    // Full name template
    const fullNameTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/teamleader/details" state={{ teamleader_id: rowData.id }}>{rowData?.profile_img != null && rowData?.profile_img != "null" && rowData?.profile_img != "" ?
                    <Avatar className="tb-avatar-img" image={rowData?.profile_img} shape="circle" /> : <Avatar className='tb-avatar-img user-list-avatar' label={rowData?.full_name.charAt(0).toUpperCase()} shape="circle" />}<div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.full_name}</div><div className="tb-avatar-text">{rowData?.email}</div></div>
                </Link>
            </>
        )
    };

    // Handle on click add new broker team
    const handleOnclickAddNewBrokerTeam = (e: any, team_leader_id: any) => {
        op.current.toggle(e);
        setTeamLeaderId(team_leader_id);
    };

    // Hide add new broker team
    const hideAddNewBrokerTeam = () => {
        setTeamLeaderId("");
        setSelectedBroker(null);
        setErrors({});
        setBrokerToTeamLoader(false);
    };

    // On submit to ass broker to team 
    const onSubmitToAddBrokerToTeam = () => {
        const { errors, isError } = addBrokerToTeamValidate(selectedBroker);
        setErrors(errors);
        if (!isError) {
            setBrokerToTeamLoader(true);

            // request data
            let formData = new FormData();
            formData.append('type', "broker");
            formData.append('broker_id', selectedBroker.code);
            formData.append('team_leader_id', teamLeaderId);

            // call api
            pageService.addTeamMembers(formData).then((response) => {
                // Get response
                if (response) {
                    setBrokerToTeamLoader(false);
                    setTeamLeaderDetails({});
                    setSelectedBroker(null);
                    setTeamLeaderId("");
                    getTeamLeadersDataFromAPI();
                    getBrokersToAddTeamFromAPI();
                    setErrors({});
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                } else {
                    setBrokerToTeamLoader(false);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            }).catch(error => {
                setBrokerToTeamLoader(false);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
    };

    const brokersTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <div className="tb-avatar-box p-avatar-group p-component" data-pc-name="avatargroup" data-pc-section="root">
                    {
                        rowData?.brokers.length > 0 && rowData?.brokers.map((item: any, index: any) => {
                            return (
                                <>
                                    {
                                        item?.profile_img == null || item?.profile_img == "null" || item?.profile_img == "" ?
                                            <Avatar className='user-list-avatar' id='avatar-tooltip' data-pr-tooltip={item?.full_name} label={item?.full_name.charAt(0).toUpperCase()} icon="pi pi-plus" shape="circle" />
                                            :
                                            <div id="avatar-tooltip" className="p-avatar p-component p-avatar-image p-avatar-circle" data-pc-name="avatar" data-pc-section="root" data-pr-tooltip={item?.full_name}>
                                                <img alt="avatar" src={item?.profile_img} data-pc-section="image" />
                                            </div>
                                    }
                                </>
                            )
                        })
                    }

                    <Avatar onClick={(e: any) => handleOnclickAddNewBrokerTeam(e, rowData?.id)} className='user-list-avatar' style={{ backgroundColor: '#e5e7eb' }} icon="pi pi-plus" shape="circle" />
                    <Tooltip target="#avatar-tooltip" mouseTrack position='top' />
                    <OverlayPanel ref={op} onHide={() => hideAddNewBrokerTeam()}>
                        <div className="overlaypanel-card-box">
                            <div className="overlaypanel-card-title">Add To Team</div>
                            <div className="overlaypanel-card-body">
                                <div className="grid">
                                    <div className="col-12">
                                        <div className="overlaypanel-card-content">
                                            <Dropdown
                                                value={selectedBroker}
                                                onChange={(e) => setSelectedBroker(e.value)}
                                                options={brokersToAdd}
                                                optionLabel="name"
                                                placeholder="Select Broker"
                                            ></Dropdown>
                                            <Button
                                                icon="pi pi-check"
                                                className="p-button-outlined ml-2"
                                                onClick={() => onSubmitToAddBrokerToTeam()}
                                                loading={brokerToTeamLoader}
                                            />
                                        </div>
                                        <small className="p-invalid-txt text-sm mt-2">{errors['broker']}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </OverlayPanel>
                </div>
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
        getSingleTeamLeaderData(id);
    };

    // Get single team leader data on click of edit
    const getSingleTeamLeaderData = (id: any) => {
        setPageLoad(true);
        // Api call
        pageService.getSingleClientDetails(id).then((response) => {
            // Get response
            if (response) {
                const responseData = response;
                setTeamLeaderDetails({
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
                setTeamLeaderDetails({});
            }
        });
    };

    // Hide add update modal
    const hideAddUpdateModal = () => {
        setAddUpdateModal(false);
        setEditId(null);
        setTeamLeaderDetails({});
        setPhoneCode("");
        setErrors({});
    };

    //On Change Job Post Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == "country") {
            val = e;
            setPhoneCode("+" + e.phonecode);
        } else {
            val = (e.target && e.target.value) || '';
        }
        setTeamLeaderDetails({ ...teamLeaderDetails, [name]: val });
    };

    // On submit of add update client
    const addUpdateClient = () => {
        const { errors, isError } = teamLeaderDetailsValidate(teamLeaderDetails, editId);
        setErrors(errors);
        if (!isError) {
            setSubmitLoading(true);

            // request data
            let formData = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            } else {
                //Password base64 convert
                let passwordBuff = Buffer.from(teamLeaderDetails?.password).toString('base64');
                formData.append('password', passwordBuff);
            }

            formData.append('user_type', "teamleader");
            formData.append('first_name', teamLeaderDetails?.first_name);
            formData.append('last_name', teamLeaderDetails?.last_name);
            formData.append('email', teamLeaderDetails?.email);
            formData.append('mobile', teamLeaderDetails?.mobile);
            formData.append('country_id', teamLeaderDetails?.country?.id);

            // call api
            pageService.addUpdateClientApiCall(formData).then((response) => {
                // Get response
                if (response) {
                    setSubmitLoading(false);
                    setAddUpdateModal(false);
                    setTeamLeaderDetails({});
                    setEditId(null);
                    setPhoneCode("");
                    getTeamLeadersDataFromAPI();
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

    // Add Update team leader form
    const addUpdateTeamLeaderFormUI = () => {
        return (
            <>
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">First Name <span className="required">*</span></label>
                        <InputText
                            value={teamLeaderDetails?.first_name}
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
                            value={teamLeaderDetails?.last_name}
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
                            value={teamLeaderDetails?.country}
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
                                value={teamLeaderDetails?.mobile}
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
                            value={teamLeaderDetails?.email}
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
                                value={teamLeaderDetails?.password}
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

    // Delete Team Leader
    const deleteTeamLeaderApiCall = () => {
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
                getTeamLeadersDataFromAPI();
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
                    {/* <div className="page-header-info">
                        <div className="page-title">Team Leaders</div>
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
                        <Button className="p-button mr-2" label="Add New Team Leader" onClick={() => addModalHandleChange()} />
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
                                        value={teamLeadersList}
                                        paginator={teamLeadersList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Team Leaders Found"
                                    >
                                        {TeamLeaderColumns.map((col, i) => {
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
                                            } else if (col.field === 'brokers') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={brokersTemplate}
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
                                        {TeamLeaderColumns.map((col, i) => (
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
                header={!window.cn(approveRejectStatus) && approveRejectStatus == "Approved" ? "Give Access To Team Leader" : "Revoke Team Leader Access"}
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
                                Note: Once you Approve, an email will sent to the team leader's provided email id with temporary password.
                            </span>
                        </>

                        : approveRejectStatus == "Rejected" ?
                            <>
                                <i
                                    className="pi pi-exclamation-triangle mr-3 delete-triangle"
                                    style={{ fontSize: '2rem' }}
                                />
                                <span className="delete-dialog-note">
                                    Note: Do you really want to revoke access of the admin for this team leader?
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
                header={editId !== null ? "Update Team Leader Details" : "Add New Team Leader"}
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
                {addUpdateTeamLeaderFormUI()}
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
                            onClick={deleteTeamLeaderApiCall}
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
                        Note: Do you really want to delete this team leader?
                    </span>
                </div>
            </Dialog>
        </>
    );
};
