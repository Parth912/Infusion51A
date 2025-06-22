import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';
import { TabMenu } from 'primereact/tabmenu';
import { Checkbox } from 'primereact/checkbox';

// Data table
import {
    defaultPageRowOptions,
    defaultRowOptions,
    paginatorLinks,
    showingEntries,
    SkeletonbodyTemplate,
    Skeletonitems,
} from '../../../appconfig/Settings';

// Column
import { RolesColumns } from '../../../appconfig/DatatableSetting';

//Services
import PageService from '../../../service/PageService';
import { roleValidate } from '../../../config/Validate';
import { TeamLeaderList } from '../Team Leaders/TeamLeaderList';
import { BrokersList } from '../Brokers/BrokersList';
import { LeadGeneratorsList } from '../Lead Generators/LeadGeneratorsList';
import { DataScrappersList } from '../Data Scrappers/DataScrappersList';

export const RoleManagement = () => {
    document.title = "Role Management | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Roles</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }
    

    //Navigate Another Route
    const navigate = useNavigate();

    const tabitems = [
        { label: 'Team Leaders' },
        { label: 'Brokers' },
        { label: 'Lead Generators' },
        { label: 'Data Scrappers' },
    ];

    const allPermissions: any = ['Clients', 'Trash', 'eSign', 'SMS Campaign', 'Email Campaigns', 'Careers', 'Applicants', 'Job Roles', 'Employees', 'Leave Type', 'Potential Investors', 'Current Investors', 'Investment Material', 'Investor Converting Docs', 'Opportunities'];
    const [currentTab, setCurrentTab] = useState<any>({ index: 0, value: "Team Leaders" });

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [roleList, setRoleList] = useState<any>([]);
    const [editId, setEditId] = useState<any>(null);
    const [roleName, setRoleName] = useState<any>("");
    const [errors, setErrors] = useState<any>({});
    const [adUpdateModal, setAddUpdateModal] = useState<boolean>(false);
    const [adUpdateLoader, setAddUpdateLoader] = useState<boolean>(false);
    const [permissionList, setPermissionList] = useState<any>([]);

    // Page service
    const pageService = new PageService();

    // useEffect
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getAllRolesFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Get all roles form api
    const getAllRolesFromAPI = () => {
        setPageLoad(false);
        // Api call
        pageService
            .getAllRoles()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setRoleList([]);
                    } else {
                        setRoleList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setRoleList([]);
                }
            });
    };

    // Get single role details
    const getSingleRoleDetailsFromApi = (id: any) => {
        pageService
            .getSingleRole(id)
            .then((response) => {
                // Get response
                if (response) {
                    setRoleName(response?.role);
                    setPermissionList(response?.default_role_permissions.split(","));
                }
            });
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

    // Add role modal handle change
    const addRoleModalHandleChange = () => {
        setAddUpdateModal(true);
    };

    // Edit role modal handle change
    const editRoleModalHandleChange = (id: any) => {
        setEditId(id);
        getSingleRoleDetailsFromApi(id);
        setAddUpdateModal(true);
    };

    // Hide add update modal
    const hideAddUpdateModal = () => {
        setAddUpdateModal(false);
        setRoleName("");
        setPermissionList([]);
        setEditId(null);
        setErrors({});
    };

    // On permission change
    const onPermissionChange = (e: any) => {
        let permissions = [...permissionList];

        if (e.checked)
            permissions.push(e.value);
        else
            permissions.splice(permissions.indexOf(e.value), 1);

        setPermissionList(permissions);
    }

    // Template for action body
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                <div className="tb-actions">
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-square p-btn-default"
                        onClick={() => editRoleModalHandleChange(rowData.id)}
                        tooltip="Edit" 
                        tooltipOptions={{ position: 'top' }}
                    />
                </div>
            </>
        )
    };

    // On sublit add update role
    const addUpdateRoleAPICall = () => {
        const { errors, isError } = roleValidate(roleName, permissionList);
        setErrors(errors);

        try {
            if (!isError) {
                setAddUpdateLoader(true);

                // request data
                let formData = new FormData();
                if (editId !== null) {
                    formData.append('id', editId);
                }
                formData.append('role', roleName);
                formData.append('default_role_permissions', permissionList.toString());

                // call api
                pageService.addUpdateRole(formData).then((response) => {
                    // Get response
                    if (response) {
                        setAddUpdateLoader(false);
                        setAddUpdateModal(false);
                        setRoleName("");
                        setPermissionList([]);
                        getAllRolesFromAPI();
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.data.message,
                        });
                    } else {
                        setAddUpdateLoader(false);
                        setAddUpdateModal(true);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Something went wrong, Please try again.',
                        });
                    }
                });
            }
        } catch (error: any) {
            setAddUpdateLoader(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.error,
            });
        }
    };

    // On change tab
    const changeCurrentTab = (tab: any) => {
        setCurrentTab({ index: tab?.index, value: tab?.value?.label });
    };

    return(
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Role Management</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">
                            <Toolbar className="page-header-search-area" left={leftToolbarTemplate}></Toolbar>
                        </div>
                        <Button className="p-button mr-2" label="Add New Role" onClick={() => addRoleModalHandleChange()} />
                    </div>
                </div>
            </div>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            {/* Datatable Start */}
                            {pageLoad == true ? (
                                <>
                                    <DataTable
                                        className="datatable-responsive" stripedRows
                                        value={roleList}
                                        paginator={roleList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Roles Found"
                                    >
                                        {RolesColumns.map((col, i) => {
                                            if (col.field === 'action') {
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
                                        {RolesColumns.map((col, i) => (
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
                        </div>
                        {/* Datatable End */}
                    </div>
                </div>
            </div>

            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className="userprofile-menu">
                                <div className="userprofile-menulist">
                                    <TabMenu model={tabitems} activeIndex={currentTab?.index} onTabChange={(e) => changeCurrentTab(e)} />
                                </div>
                            </div>

                            {
                                currentTab?.value === "Team Leaders" ? 
                                    <TeamLeaderList/>
                                : currentTab?.value === "Brokers" ? 
                                    <BrokersList/>
                                : currentTab?.value === "Lead Generators" ? 
                                    <LeadGeneratorsList/>
                                : 
                                    <DataScrappersList/>
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Update Dialog */}
            <Dialog
                visible={adUpdateModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={editId !== null ? "Update Role" : "Add New Role"}
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
                            onClick={() => addUpdateRoleAPICall()}
                            loading={adUpdateLoader}
                        />
                    </>
                }
                onHide={hideAddUpdateModal}
            >
                <div className="formgrid grid">
                    <div className="field col">
                        <label htmlFor="name">Role Name <span className="required">*</span></label>
                        <InputText
                            value={roleName}
                            name="name"
                            autoComplete="off"
                            placeholder="Enter Role Name"
                            onChange={(e) => setRoleName(e.target.value)}
                            className={errors['role'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['role']}</small>
                    </div>
                </div>
                <hr/>
                
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h5><u><b>Menu Accesses</b></u><small className="p-invalid-txt">{errors['permissions']}</small></h5>
                    <div>
                        <Button
                            tooltip='Select All'
                            icon="pi pi-check-square"
                            className="p-button-outlined p-button-primary"
                            onClick={() => setPermissionList(allPermissions)}
                        />
                        <Button
                            tooltip='Clear All'
                            icon="pi pi-times"
                            className="p-button-outlined p-button-danger ml-2"
                            onClick={() => setPermissionList([])}
                        />
                    </div>
                </div>
                
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-3">
                        <h6><b>Clients</b></h6>
                        <div className="flex align-items-center">
                            <Checkbox inputId="clients" name="clients" value="Clients" onChange={onPermissionChange} checked={permissionList.includes('Clients')} />
                            <label htmlFor="clients" className="ml-2">Clients</label>
                        </div>
                    </div>

                    <div className="field col-12 md:col-3">
                        <h6><b>Trash</b></h6>
                        <div className="flex align-items-center">
                            <Checkbox inputId="trash" name="trash" value="Trash" onChange={onPermissionChange} checked={permissionList.includes('Trash')} />
                            <label htmlFor="trash" className="ml-2">Trash</label>
                        </div>
                    </div>

                    <div className="field col-12 md:col-3">
                        <h6><b>eSign</b></h6>
                        <div className="flex align-items-center">
                            <Checkbox inputId="trash" name="trash" value="eSign" onChange={onPermissionChange} checked={permissionList.includes('eSign')} />
                            <label htmlFor="trash" className="ml-2">eSign</label>
                        </div>
                    </div>

                    <div className="field col-12 md:col-3">
                        <h6><b>Sales</b></h6>
                        <div className="flex align-items-center">
                            <Checkbox inputId="sms_campaign" name="sms_campaign" value="SMS Campaign" onChange={onPermissionChange} checked={permissionList.includes('SMS Campaign')} />
                            <label htmlFor="sms_campaign" className="ml-2">SMS Campaign</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="email_campaigns" name="email_campaigns" value="Email Campaigns" onChange={onPermissionChange} checked={permissionList.includes('Email Campaigns')} />
                            <label htmlFor="email_campaigns" className="ml-2">Email Campaigns</label>
                        </div>
                    </div>
                    
                    <div className="field col-12 md:col-3 mt-3">
                        <h6><b>HR</b></h6>
                        <div className="flex align-items-center">
                            <Checkbox inputId="careers" name="careers" value="Careers" onChange={onPermissionChange} checked={permissionList.includes('Careers')} />
                            <label htmlFor="careers" className="ml-2">Careers</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="applicants" name="applicants" value="Applicants" onChange={onPermissionChange} checked={permissionList.includes('Applicants')} />
                            <label htmlFor="applicants" className="ml-2">Applicants</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="job_roles" name="job_roles" value="Job Roles" onChange={onPermissionChange} checked={permissionList.includes('Job Roles')} />
                            <label htmlFor="job_roles" className="ml-2">Job Roles</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="employees" name="employees" value="Employees" onChange={onPermissionChange} checked={permissionList.includes('Employees')} />
                            <label htmlFor="employees" className="ml-2">Employees</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="leave_type" name="leave_type" value="Leave Type" onChange={onPermissionChange} checked={permissionList.includes('Leave Type')} />
                            <label htmlFor="leave_type" className="ml-2">Leave Type</label>
                        </div>
                    </div>

                    <div className="field col-12 md:col-3 mt-3">
                        <h6><b>Investment Portal</b></h6>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="potential_investors" name="potential_investors" value="Potential Investors" onChange={onPermissionChange} checked={permissionList.includes('Potential Investors')} />
                            <label htmlFor="potential_investors" className="ml-2">Potential Investors</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="current_investors" name="current_investors" value="Potential Investors" onChange={onPermissionChange} checked={permissionList.includes('Potential Investors')} />
                            <label htmlFor="current_investors" className="ml-2">Current Investors</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="investment_material" name="investment_material" value="Investment Material" onChange={onPermissionChange} checked={permissionList.includes('Investment Material')} />
                            <label htmlFor="investment_material" className="ml-2">Investment Material</label>
                        </div>
                        <div className="flex align-items-center mt-2">
                            <Checkbox inputId="investor_converting_docs" name="investor_converting_docs" value="Investor Converting Docs" onChange={onPermissionChange} checked={permissionList.includes('Investor Converting Docs')} />
                            <label htmlFor="investor_converting_docs" className="ml-2">Investor Converting Docs</label>
                        </div>
                    </div>

                    <div className="field col-12 md:col-3 mt-3">
                        <h6><b>CRM</b></h6>
                        <div className="flex align-items-center">
                            <Checkbox inputId="opportunites" name="opportunites" value="Opportunities" onChange={onPermissionChange} checked={permissionList.includes('Opportunities')} />
                            <label htmlFor="opportunites" className="ml-2">Opportunities</label>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    )
};