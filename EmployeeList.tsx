import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

//Prime React Component Inbuilt
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Avatar } from 'primereact/avatar';
import { Checkbox } from 'primereact/checkbox';

//Buffer Storage
import { Buffer } from 'buffer';

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
import { EmployeeListColumns } from '../../../appconfig/DatatableSetting';

//Services
import PageService from '../../../service/PageService';
import { employeeDetailsValidate } from '../../../config/Validate';
import { Dropdown } from 'primereact/dropdown';

export const EmployeeList = () => {
    document.title = "Employees | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Employees</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' };

    //Set Toast/ Filter Properties
    const [globalFilter, setGlobalFilter] = useState<any>(null);
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    //Navigate Another Route
    const navigate = useNavigate();

    // Page service
    const pageService = new PageService();

    //Loading/Page Loading
    const [pageLoad, setPageLoad] = useState(false);
    const [countriesList, setCountriesList] = useState<any>([]);
    const [phonecode, setPhoneCode] = useState<any>("");
    const [employeeList, setEmployeeList] = useState<any>([]);
    const [employeeData, setEmployeeData] = useState<any>({});
    const [editId, setEditId] = useState<any>(null);
    const [addUpdateModal, setAddUpdateModal] = useState<boolean>(false);
    const [addUpdateLoader, setAddUpdateLoader] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});
    const [rolesList, setRoles] = useState<any>([]);
    const [permissionList, setPermissionList] = useState<any>([]);

    // useEffect
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getCountriesFromAPi();
        getAllRolesFromAPI();
        getAllEmployeesFromAPI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Get all roles form api
    const getAllRolesFromAPI = () => {
        setPageLoad(false);
        // Api call
        pageService
            .getAllRoles("dropdown")
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setRoles([]);
                    } else {
                        setRoles(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(false);
                    setRoles([]);
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

    // Get all employees
    const getAllEmployeesFromAPI = () => {
        setPageLoad(false);
        // Api call
        pageService
            .getAllEmployee()
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setEmployeeList([]);
                    } else {
                        setEmployeeList(DataList);
                    }
                    setPageLoad(true);
                } else {
                    setPageLoad(true);
                    setEmployeeList([]);
                }
            });
    };

    // Get single employee details
    const getSingleEmployeeDetailsFromApi = (id: any) => {
        pageService
            .getSingleEmployee(id)
            .then((response) => {
                // Get response
                if (response) {
                    setEmployeeData({
                        first_name: response?.first_name,
                        last_name: response?.last_name,
                        mobile: response?.mobile,
                        email: response?.email,
                        country: { code: response?.country?.iso, name: response?.country?.name, id: response?.country?.id, phonecode: response?.country?.phonecode }
                    });
                    setPhoneCode("+" + response?.country?.phonecode);
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

    // Template for full name
    const fullNameBodyTemplate = (rowData: any, rowIndex: any) => {
        return (
            <>
                <Link className="tb-avatar-box" to="/employee/details" state={{ employee_id: rowData?.id }}>
                    <Avatar className="tb-avatar-img" label={rowData?.full_name.charAt(0).toUpperCase()} shape="circle" />
                    <div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.full_name}</div></div>
                </Link>
            </>
        );
    };

    // Template for action body
    const actionBodyTemplate = (rowData: any, rowIndex: any) => {
        return(
            <>
                <div className="tb-actions">
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-square p-btn-default"
                        tooltip="Update" 
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => openEditEmployeeModal(rowData.id)}
                    />
                </div>
            </>
        );
    };

    // Open add employee modal
    const openAddEmployeeModal = () => {
        setAddUpdateModal(true);
    };

    // Open Edit employee modal
    const openEditEmployeeModal = (id: any) => {
        setEditId(id);
        getSingleEmployeeDetailsFromApi(id);
        setAddUpdateModal(true);
    };

    // Close add update employee modal
    const closeAddUpdateEmployeeModal = () => {
        setErrors({});
        setEmployeeData({});
        setPhoneCode("");
        setPermissionList([]);
        setAddUpdateModal(false);
        setAddUpdateLoader(false);
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

    //On Change Employee Data
    const onInputChange = (e: any, name: string) => {
        let val;
        if (name == "country") {
            val = e;
            setPhoneCode("+" + e.phonecode);
        } else if(name === "role"){
            val = e;
            setPermissionList(val.default_role_permissions.split(","))
        } else {
            val = (e.target && e.target.value) || '';
        }
        setEmployeeData({ ...employeeData, [name]: val });
    };

    // On submit add update employee
    const addUpdateEmployeeAPICall = () => {
        const { errors, isError } = employeeDetailsValidate(employeeData, editId);
        setErrors(errors);
        if (!isError) {
            setAddUpdateLoader(true);

            // request data
            let formData = new FormData();
            if (editId !== null) {
                formData.append('id', editId);
            } else {
                //Password base64 convert
                let passwordBuff = Buffer.from(employeeData?.password).toString('base64');
                formData.append('password', passwordBuff);
            }

            formData.append('user_type', 'employee');
            formData.append('first_name', employeeData?.first_name);
            formData.append('last_name', employeeData?.last_name);
            formData.append('email', employeeData?.email);
            formData.append('mobile', employeeData?.mobile);
            formData.append('country_id', employeeData?.country?.id);

            // call api
            pageService.addUpdateEmployee(formData).then((response) => {
                // Get response
                if (response) {
                    setAddUpdateLoader(false);
                    setAddUpdateModal(false);
                    setEmployeeData({});
                    setEditId(null);
                    setPhoneCode("");
                    getAllEmployeesFromAPI();
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
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
            }).catch(error => {
                setAddUpdateLoader(false);
                setAddUpdateModal(true);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: error.response.data.error,
                });
            });
        }
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

    return(
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Employees</div>
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
                        <Button className="p-button mr-2" label="Add New Employee" onClick={() => openAddEmployeeModal()} />
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
                                        value={employeeList}
                                        paginator={employeeList.length > 0 && true}
                                        globalFilter={globalFilter}
                                        rows={defaultRowOptions}
                                        rowsPerPageOptions={defaultPageRowOptions}
                                        paginatorTemplate={paginatorLinks}
                                        currentPageReportTemplate={showingEntries}
                                        emptyMessage="No Employees Found"
                                    >
                                        {EmployeeListColumns.map((col, i) => {
                                            if (col.field === 'action') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={actionBodyTemplate}
                                                    />
                                                );
                                            } else if (col.field === 'full_name') {
                                                return (
                                                    <Column
                                                        key={col.field}
                                                        field={col.field}
                                                        header={col.header}
                                                        body={fullNameBodyTemplate}
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
                                        {EmployeeListColumns.map((col, i) => (
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

            {/* Add Update Dialog */}
            <Dialog
                visible={addUpdateModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header={editId !== null ? "Update Employee Details" : "Add New Employee"}
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={closeAddUpdateEmployeeModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => addUpdateEmployeeAPICall()}
                            loading={addUpdateLoader}
                        />
                    </>
                }
                onHide={closeAddUpdateEmployeeModal}
            >
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="name">First Name <span className="required">*</span></label>
                        <InputText
                            value={employeeData?.first_name}
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
                            value={employeeData?.last_name}
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
                            value={employeeData?.country}
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
                                value={employeeData?.mobile}
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
                            value={employeeData?.email}
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
                                value={employeeData?.password}
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
                    {/* <div className="field col-6">
                        <label htmlFor="name">Role <span className="required">*</span></label>
                        <Dropdown
                            value={employeeData?.role}
                            name="name"
                            options={rolesList}
                            filter
                            optionLabel="name"
                            placeholder="Select Role"
                            onChange={(e) => onInputChange(e.value, "role")}
                            className={errors['role'] && 'p-invalid'}
                        />
                        <small className="p-invalid-txt">{errors['role']}</small>
                    </div> */}
                </div>
                {/* {
                    !window.cn(employeeData?.role) && !window.cn(employeeData?.role?.default_role_permissions) ?
                        <div className="p-fluid formgrid grid">
                            <h6><b>Select Menu Access Permissions</b></h6>
                            {
                                employeeData?.role?.default_role_permissions.split(",").map((item: any, index: any) => {
                                    return(
                                        <>
                                            <div className="field col-12 md:col-12">
                                                <div className="flex align-items-center">
                                                    <Checkbox inputId={"checkbox" + index} name={"checkbox" + index} value={item} onChange={onPermissionChange} checked={permissionList.includes(item)} />
                                                    <label htmlFor={"checkbox" + index} className="ml-2">{item}</label>
                                                </div>
                                            </div>
                                        </>
                                    )
                                })
                            }
                        </div>
                    :

                        <></>
                } */}
            </Dialog>
        </>
    )
};