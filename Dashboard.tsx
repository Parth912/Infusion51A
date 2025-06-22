import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMountEffect } from 'primereact/hooks';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Sidebar } from 'primereact/sidebar';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Avatar } from 'primereact/avatar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Messages } from 'primereact/messages';
import { Calendar } from 'primereact/calendar';
import { Chart } from 'primereact/chart';

//Services
import PageService from '../../service/PageService';
import { Loader } from '../../components/Loader/Loader';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import {
  APP_BASE_URL,
  defaultRowOptionsDashboard,
  SkeletonbodyTemplate,
  Skeletonitems,
  taskStatusFilter
} from '../../appconfig/Settings';
import { LoginAnalysisDashboardColumns, TasksColumns } from '../../appconfig/DatatableSetting';
import { addTaskValidate } from '../../config/Validate';
import moment from 'moment';

const Dashboard = () => {
  document.title = 'Dashboard | Venture Studio';

  // Page Service
  const pageService = new PageService();
  
  //Navigate Another Route
  const navigate = useNavigate();

  const toast = useRef<any>(null);
  const hasFetchedData = useRef(false);

  const [pageLoad, setPageLoad] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [NDAData, setNDAData] = useState<any>({});
  const [notifications, setNotifications] = useState<any>([]);
  const [visibleNotification, setVisibleNotification] = useState<boolean>(false);
  const [LoginAnalysisTable, setLoginAnalysisTable] = useState<any>([]);
  const [taskModal, setTaskModal] = useState<boolean>(false);
  const [taskDetail, setTaskDetail] = useState<any>("");
  const [taskLoader, setTaskLoader] = useState<boolean>(false);
  const [tasksList, setTasksList] = useState<any>([]);
  const [taskLoad, setTaskLoad] = useState<boolean>(false);
  const [taskStatus, setTaskStatus] = useState<any>({ code: "Pending", name: "Pending" });
  const [errors, setErrors] = useState<any>({});
  const [statusChangePageLoad, setStatusChangePageLoad] = useState<boolean>(false);

  // Chart
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const msgs = useRef<Messages>(null);

  // Date Object
  let today = new Date();
  const [dates, setDates] = useState<string | Date | Date[] | any | null>([new Date(today.setDate(today.getDate() - 31)), new Date()]);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Clients',
        data: [20, 25, 13, 9, 4, 6, 7, 14, 6, 4, 18, 22],
        backgroundColor: [
          'rgba(255, 159, 64, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)'
        ],
        borderWidth: 1
      }
    ]
  };
  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  useEffect(() => {
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;

    getDashboardDataFromApi();
    setChartData(data);
    setChartOptions(options);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("user_type") == "broker") {
      getTasksFromAPI();
    }
  }, [taskStatus]);

  useMountEffect(() => {
    msgs.current?.clear();
    msgs.current?.show([
      { sticky: true, severity: 'info', summary: 'Info', detail: 'Message Content' },
      { sticky: true, severity: 'success', summary: 'Success', detail: 'Message Content' },
      { sticky: true, severity: 'warn', summary: 'Warning', detail: 'Message Content' },
      { sticky: true, severity: 'error', summary: 'Error', detail: 'Message Content' },
    ]);
  });

  // Get Dashboard Data
  const getDashboardDataFromApi = () => {
    setPageLoad(true);
    // Api call
    pageService
      .getDashboardData()
      .then((response) => {
        // Get response
        if (response) {
          setDashboardData({
            "notification_count": response?.notification_count,
          });
          if (!window.cn(response?.login_analysis) && response?.login_analysis.length > 0) {
            setLoginAnalysisTable(response?.login_analysis);
          }
          setNDAData(response?.nda);
          setPageLoad(false);
        } else {
          setDashboardData({});
          setPageLoad(false);
        }
      });
  };

  // Get Tasks Details
  const getTasksFromAPI = async () => {
    setTaskLoad(false);
    // Api call
    pageService
      .getTask(localStorage.getItem("id"), taskStatus?.code)
      .then((response) => {
        // Get response
        if (response) {
          const responseData = response;
          setTasksList(responseData);
          setTaskLoad(true);
        } else {
          setTaskLoad(true);
          setTasksList([]);
        }
      });
  };

  // Get notifications from api
  const getNotificationsApiCall = () => {
    pageService
      .getNotifications()
      .then((response) => {
        // Get response
        if (response) {
          setNotifications(response);
          setPageLoad(false);
        } else {
          setNotifications([]);
          setPageLoad(false);
        }
      });
  };

  // Notifications hide
  const handleNotificationHideClick = () => {
    setVisibleNotification(false);
    getDashboardDataFromApi();
  }

  // On clear notification
  const clearNotification = (id: any) => {
    // Clear notification api call
    pageService
      .clearNotification(id)
      .then((response) => {
        // Get response
        if (response) {
          getNotificationsApiCall();
        }
      });
  };

  // Format created_at for Posted time show
  const PostedDate = (datetime: any) => {
    const postedTime = formatDistanceToNow(new Date(datetime), { addSuffix: true });
    return postedTime;
  };

  // Open brochure
  const onClickOpenBrochure = () => {
    axios.get(APP_BASE_URL + '/set-brochure-data?client_id=' + localStorage.getItem("id"), { withCredentials: true }).then((response) => {
      // Get response
      if (response) {
        window.open(response?.data?.url, "_blank");
        setPageLoad(false);
      } else {
        setPageLoad(false);
      }
    });
  };

  // For full name body template
  const fullNameBodyTemplate = (rowData: any, rowIndex: any) => {
    return (
      <>
        <Link className="tb-avatar-box" to="/investor/details" state={{ investor_id: rowData?.id }}>
          <Avatar className="tb-avatar-img" label={rowData?.full_name.charAt(0).toUpperCase()} shape="circle" />
          <div className="tb-avatar-info"><div className="tb-avatar-name">{rowData?.full_name}</div></div>
        </Link>
      </>
    );
  };

  // Open add task modal
  const openTaskModal = () => {
    setTaskModal(true);
  };

  // Close add task modal
  const closeTaskModal = () => {
    setTaskDetail("");
    setTaskModal(false);
    setTaskLoader(false);
    setErrors({});
  };

  // Add task api call
  const addTask = () => {
    const { errors, isError } = addTaskValidate(taskDetail);
    setErrors(errors);

    try {
      if (!isError) {
        setTaskLoader(true);

        // request data
        let formData: any = new FormData();
        formData.append('id', localStorage.getItem("id"));
        formData.append('task_detail', taskDetail);

        // call api
        pageService.addTask(formData).then((response) => {
          // Get response
          if (response) {
            setTaskLoader(false);
            setTaskModal(false);
            setTaskDetail("");
            toast.current?.show({
              severity: 'success',
              summary: 'Success',
              detail: response.message,
            });
          } else {
            setTaskLoader(false);
            setTaskModal(true);
            toast.current?.show({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong, Please try again.',
            });
          }
        });
      }
    } catch (error: any) {
      setTaskLoader(false);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response.data.error,
      });
    }
  };

  // Date format template
  const dateFormatCreatedAtTemplate = (rowData: any, rowIndex: any) => {

    return (
      <>
        {rowData.created_at === rowData[rowIndex.field] && rowData.created_at !== null ? moment.utc(rowData.created_at).format('MMM DD, YYYY hh:mm A') : '-'}
      </>
    );
  };

  // Status template
  const statusTemplate = (rowData: any, rowIndex: any) => {
    return (
      <>
        <InputSwitch checked={rowData.status == "Completed" ? true : false} onChange={(e) => changeTaskStatus(e.value, rowData.id)} />
      </>
    )
  };

  const changeTaskStatus = (value: any, id: any) => {
    try {
      setPageLoad(true);
      // request data
      let formData = new FormData();
      formData.append('id', id);

      let statusVal: any = "Completed";
      if (value == false){
        statusVal = "Pending";
      }
      formData.append('status', statusVal);
      

      // call api
      pageService.changeTaskStatus(formData).then((response) => {
        // Get response
        if (response) {
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: response.message,
          });
          setTimeout(() => {
            setPageLoad(false);
            getTasksFromAPI();
          }, 1000);
        } else {
          setPageLoad(false);
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong, Please try again.',
          });
        }
      });
    } catch (error: any) {
      setPageLoad(false);
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
      <div className="layout-dashboard">
        <div className="page-header">
          <div className="page-leftheader">
            <div className="page-header-info">
              <div className="page-title">Dashboard - <span className="dash-title text-secondary">{localStorage.getItem('full_name')}</span></div>
              {/* <div className="main-content-breadcrumb">
                <span className="header-hint">Last Login - 02 Oct 2024</span>
              </div> */}
            </div>
          </div>
          <div className="page-rightheader">
            <div className="btn-icon-list">
              <div className="page-header-search">
                
              </div>
              {
                localStorage.getItem("user_type") === "investor" ?
                  <>
                    <Button
                      label="Become An Investor"
                      className="p-button-help ml-auto"
                      onClick={() => navigate("/become-an-investor")}
                    />
                  </>
                  :
                  <></>
              }
            </div>
          </div>
        </div>

        {/* NDA Start */}
        {
          !window.cn(NDAData?.nda) && NDAData !== undefined && NDAData?.is_nda === 1 ?
            <div className="p-message p-component p-message-error p-message-enter-done" role="alert" aria-live="assertive" aria-atomic="true" data-pc-name="messages" data-pc-section="root">
              <div className="p-message-wrapper" data-pc-section="wrapper">
                <i className='pi pi-exclamation-circle mr-2' style={{ fontSize: "1.5rem" }}></i>
                <span className="p-message-summary" data-pc-section="summary">Attention</span>
                <span className="p-message-detail" data-pc-section="detail">We kindly request you to review and sign the Non-Disclosure Agreement (NDA).</span>
                <Button
                  label="View"
                  className="p-button-outlined p-button-danger ml-auto"
                  onClick={() => navigate("/sign-nda")}
                />
              </div>
            </div>
          :
            <></>
        }
        {/* NDA End */}

        {
          localStorage.getItem('user_type') == "admin" ?
            <>
              <div className="grid">
                <div className="col-12 md:col-3">
                  <div className="card-state fadein animation-duration-500">
                    <div className="card-state-icon"><i className="pi pi-dollar"></i></div>
                    <div className="card-state-content">
                      <div className="card-state-title">Investors</div>
                      <div className="card-state-value">10</div>
                    </div>
                  </div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="card-state fadein animation-duration-500">
                    <div className="card-state-icon"><i className="pi pi-users"></i></div>
                    <div className="card-state-content">
                      <div className="card-state-title">Brokers</div>
                      <div className="card-state-value">07</div>
                    </div>
                  </div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="card-state fadein animation-duration-500">
                    <div className="card-state-icon"><i className="pi pi-briefcase"></i></div>
                    <div className="card-state-content">
                      <div className="card-state-title">Total Jobs</div>
                      <div className="card-state-value">142</div>
                    </div>
                  </div>
                </div>
                <div className="col-12 md:col-3">
                  <div className="card-state fadein animation-duration-500">
                    <div className="card-state-icon"><i className="pi pi-user-plus"></i></div>
                    <div className="card-state-content">
                      <div className="card-state-title">Total Applicants</div>
                      <div className="card-state-value">68</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title-box">
                        <h3 className="card-title">Investor Login Analysis</h3>
                      </div>
                      <div className="card-toolbar">
                        <a href="#" className="p-button p-button-outlined">View All</a>
                      </div>
                    </div>
                    <div className="card-body">
                      {pageLoad == false ? (
                        <>
                          <DataTable
                            className="datatable-responsive" stripedRows
                            value={LoginAnalysisTable}
                            paginator={LoginAnalysisTable.length > 0 && true}
                            rows={defaultRowOptionsDashboard}
                            emptyMessage="No Data Found"
                            size='normal'
                          >
                            {LoginAnalysisDashboardColumns.map((col, i) => {
                              if (col.field === 'sr_no') {
                                return (
                                  <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={(_, { rowIndex }) => rowIndex + 1}
                                  />
                                );
                              } else if (col.field === 'full_name') {
                                return (
                                  <Column
                                    key={col.field}
                                    field={col.field}
                                    header={col.header}
                                    body={fullNameBodyTemplate}
                                    sortable
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
                          {/* Skeleton Data table */}
                          <DataTable value={Skeletonitems}>
                            {LoginAnalysisDashboardColumns.map((col, i) => (
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
                  </div>
                </div>
                {/* <div className="col-12 md:col-6">
                  <div className="card">
                    <div className="card-header">
                      <div className="card-title-box">
                        <h3 className="card-title">Investor Login Analysis</h3>
                      </div>
                      <div className="card-toolbar"></div>
                    </div>
                    <div className="card-body">
                      <Chart type="bar" data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div> */}
              </div>
            </>
            : localStorage.getItem("user_type") == "broker" ?
              <>
                <br />
                <div className='grid'>
                  <div className="col-12 md:col-9">
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title-box">
                          <h3 className="card-title">Everyday Tasks</h3>
                        </div>
                        <div className="card-toolbar">
                          <div className="p-toolbar p-component mb-4" role="toolbar">
                            <div className="p-toolbar-group-left">
                              <Dropdown
                                value={taskStatus}
                                onChange={(e) => setTaskStatus(e.value)}
                                options={taskStatusFilter}
                                optionLabel="name"
                                placeholder="Select Status"
                              ></Dropdown>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        {taskLoad ? (
                          <>
                            <DataTable
                              className="datatable-responsive"
                              value={tasksList}
                              paginator={tasksList.length > 0 && true}
                              rows={8}
                              emptyMessage={"No Data Found"}
                            >
                              {TasksColumns.map((col, i) => {
                                if (col.field === 'created_at') {
                                  return (
                                    <Column
                                      key={col.field}
                                      field={col.field}
                                      header={col.header}
                                      body={dateFormatCreatedAtTemplate}
                                    />
                                  );
                                } else if (col.field === 'status') {
                                  return (
                                    <Column
                                      key={col.field}
                                      field={col.field}
                                      header={col.header}
                                      body={statusTemplate}
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
                            {/* Skeleton Data table */}
                            <DataTable value={Skeletonitems}>
                              {TasksColumns.map((col, i) => (
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

                    </div>
                  </div>
                </div>
              </>
              :
              <section id="hero-animated" className="hero-animated flex align-items-center" style={{ justifyContent: "center" }}>
                <div className="container d-flex flex-column justify-content-center align-items-center text-center position-relative" data-aos="zoom-out">
                  <img src="/assets/images/logo.png" className="img-fluid animated" />
                  <p className="mb-0">HELLO {localStorage.getItem('full_name')}</p>
                  <h2>Welcome</h2>
                  {/* {localStorage.getItem('user_type') == "client"
              ?
              <Button type="button" label="Open Brochure" className="p-button-success" onClick={() => onClickOpenBrochure()}/>
              :
              <section
                id="hero-animated"
                className="hero-animated flex align-items-center "
                style={{ justifyContent: "center" }}
              >
                <div
                  className="container d-flex flex-column justify-content-center align-items-center text-center position-relative"
                  data-aos="zoom-out"
                >
                  <img
                    src="/assets/images/logo.png"
                    className="img-fluid animated"
                  />
                  <p className="mb-0">
                    HELLO {localStorage.getItem('full_name')}
                  </p>
                  <h2>
                    Welcome
                  </h2>
                  {/* {localStorage.getItem('user_type') == "client"
                ?
                <Button
                  type="button"
                  label='Open Brochure'
                  className="p-button-success"
                  onClick={() => onClickOpenBrochure()}
                />
                :

                ""
              } */}
                </div>
              </section>
        }
      </div>

      {/* Notification Sidebar */}
      <Sidebar className='p-slider-header-custom' style={{ width: "500px" }} visible={visibleNotification} onHide={() => handleNotificationHideClick()} position='right'>
        <h4>Notifications</h4>

        {
          !window.cn(notifications) && notifications.length > 0 ?
            <ul className="list-none m-0 p-0">
              {
                notifications.map((item: any, index: any) => {
                  return (
                    <>
                      <li>
                        <a className="flex surface-border mb-3 p-3 align-items-center border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                          <Avatar style={item?.user?.user_type == "broker" ? { backgroundColor: '#2196F3' } : { backgroundColor: '#9c27b0' }} label={item?.user?.full_name.charAt(0).toUpperCase()} size="xlarge" shape="circle" />
                          <div className="ml-3">
                            <span className="mb-2 font-semibold" style={{ color: "black" }}>{item?.user?.full_name} {item?.action_type === "task" ? "has added task" : ""}</span>
                            <p className="text-color-secondary m-0" style={{ width: "300px" }}>{item?.notification_message}</p>
                            <p className="text-color-secondary m-0">{PostedDate(item?.created_at)}</p>
                          </div>
                          <Button
                            className="ml-auto cursor-pointer p-button p-component p-button-icon-only p-button-text p-button-rounded p-button-secondary"
                            icon="pi pi-times"
                            aria-label="Cancel"
                            onClick={() => clearNotification(item?.id)}
                          />
                        </a>
                      </li>
                    </>
                  )
                })
              }
            </ul>
            :
            <></>
        }
      </Sidebar>

      {/* Add Update Dialog */}
      <Dialog
        visible={taskModal}
        style={{ width: '450px' }}
        className="p-fluid"
        header="Add Today's Task"
        modal
        footer={
          <>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-secondary"
              onClick={closeTaskModal}
            />
            <Button
              label="Submit"
              icon="pi pi-check"
              className="p-button-success"
              onClick={() => addTask()}
              loading={taskLoader}
            />
          </>
        }
        onHide={closeTaskModal}
      >
        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="name">Enter Task <span style={{ color: "red" }}>*</span></label>
            <InputTextarea
              value={taskDetail}
              onChange={(e) => setTaskDetail(e.target.value)}
              rows={5}
              cols={30}
            />
            <small className="p-invalid-txt">{errors['task_detail']}</small>
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

export default Dashboard;
