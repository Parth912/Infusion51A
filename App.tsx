import React, { useState, useEffect, useRef } from 'react';
import { classNames } from 'primereact/utils';
import { Route, Routes, useLocation } from 'react-router-dom';
import AppTopbar from './layouts/AppTopbar';
import AppMenu from './layouts/AppMenu';
import { Tooltip } from 'primereact/tooltip';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.scss';
import './flags.css';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import { ChangePassword } from './pages/ChangePassword';
import { ClientsList } from './pages/Admin/Clients/ClientsList';
import { ClientsDetails } from './pages/Admin/Clients/ClientsDetails';
import { CareersList } from './pages/Admin/Careers/CareersList';
import { AddUpdateCareers } from './pages/Admin/Careers/AddUpdateCareers';
import { JobRoles } from './pages/Admin/Master/JobRoles';
import { CareerJobDetailsView } from './pages/Admin/Careers/CareerJobDetailsView';
import { CareerApplicants } from './pages/Admin/Careers/CareerApplicants';
import { CareerApplicantsDetail } from './pages/Admin/Careers/CareerApplicantsDetail';
import { InvestmentMaterial } from './pages/Admin/Master/InvestmentMaterial';
import { InvestorMaterialList } from './pages/Admin/Investors/InvestorMaterialList';
import { InvestmentMaterialApproval } from './pages/Admin/Master/InvestmentMaterialApproval';
import { UserAllNotificationsList } from './pages/dashboard/UserAllNotificationsList';
import { InvestorsList } from './pages/Admin/Investors/InvestorsList';
import { InvestorsDetails } from './pages/Admin/Investors/InvestorsDetails';
import { BrokersList } from './pages/Admin/Brokers/BrokersList';
import { BrokersDetails } from './pages/Admin/Brokers/BrokersDetails';
import { PerticularBrokerInvestorList } from './pages/Admin/Brokers/PerticularBrokerInvestorList';
import { TrashList } from './pages/Admin/Master/TrashList';
import { UserSettings } from './pages/dashboard/UserSettings';
import { TeamLeaderList } from './pages/Admin/Team Leaders/TeamLeaderList';
import { TeamLeaderDetails } from './pages/Admin/Team Leaders/TeamLeaderDetails';
import { LeadGeneratorsList } from './pages/Admin/Lead Generators/LeadGeneratorsList';
import { LeadGeneratorsDetails } from './pages/Admin/Lead Generators/LeadGeneratorsDetails';
import { TestExcel } from './pages/TestExcel';
import { DataScrappersList } from './pages/Admin/Data Scrappers/DataScrappersList';
import { DataScrapperDetails } from './pages/Admin/Data Scrappers/DataScrapperDetails';
import { AddLeads } from './pages/Admin/Leads/AddLeads';
import { LeadsList } from './pages/Admin/Leads/LeadsList';
import { Team } from './pages/Admin/Team Leaders/Team';
import { PersonalBrokerLeadList } from './pages/Admin/Brokers/PersonalBrokerLeadList';
import { KanbanViewLeads } from './pages/Admin/Leads/KanbanViewLeads';
import { CampaignsList } from './pages/Admin/Campaigns/CampaignsList';
import { CampaignDetails } from './pages/Admin/Campaigns/CampaignDetails';
import { SMSCampaignList } from './pages/Admin/SMS Campaign/SMSCampaignList';
import { AddUpdateSMSCampaign } from './pages/Admin/SMS Campaign/AddUpdateSMSCampaign';
import { SMSCampaignDetails } from './pages/Admin/SMS Campaign/SMSCampaignDetails';
import { RoleManagement } from './pages/Admin/Master/RoleManagement';
import { LeadView } from './pages/Admin/Leads/LeadView';
import { CurrentInvestorsList } from './pages/Admin/Investors/CurrentInvestorsList';
import { CurrentInvestorDetails } from './pages/Admin/Investors/CurrentInvestorDetails';
import { NDA } from './pages/Admin/Master/NDA';
import { SignNDA } from './pages/Admin/Master/SignNDA';
import { EmployeeList } from './pages/Admin/Employee/EmployeeList';
import { LeavesList } from './pages/Admin/Leaves/LeavesList';
import { LeaveType } from './pages/Admin/Leaves/LeaveType';
import { EmployeeDetails } from './pages/Admin/Employee/EmployeeDetails';
import { SMSCampaignMessageRecipients } from './pages/Admin/SMS Campaign/SMSCampaignMessageRecipients';
import { InvestorConvertingDocs } from './pages/Admin/Investors/InvestorConvertingDocs';
import { InvestorDocUpload } from './pages/Admin/Investors/InvestorDocUpload';
import { BecomeAnInvestor } from './pages/Admin/Investors/BecomeAnInvestor';
import { InterviewStagesMaster } from './pages/Admin/Interview/InterviewStagesMaster';
import { Interview } from './pages/Admin/Interview/Interview';
import { InterviewDetails } from './pages/Admin/Interview/InterviewDetails';
import { CList } from './pages/Admin/Client/CList';
const App = (props: any) => {
  const [menuMode, setMenuMode] = useState('sidebar');
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [sidebarStatic, setSidebarStatic] = useState(true);
  const [staticMenuDesktopInactive, setStaticMenuDesktopInactive] = useState(false);
  const [staticMenuMobileActive, setStaticMenuMobileActive] = useState(false);
  const [menuActive, setMenuActive] = useState(true);
  const [topbarMenuActive, setTopbarMenuActive] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(true);
  const [pinActive, setPinActive] = useState(true);
  const [activeInlineProfile, setActiveInlineProfile] = useState(false);
  const [resetActiveIndex, setResetActiveIndex] = useState<boolean>(false);
  const [assignedActions, setAssignedActions] = useState<any>([]);
  const copyTooltipRef = useRef<any>();
  const location = useLocation();

  // use effect method
  useEffect(() => {
    // if (localStorage.getItem("user_type") !== "client" || localStorage.getItem("user_type") !== "investor" || localStorage.getItem("user_type") !== "currentinvestor" || localStorage.getItem("user_type") !== "teamleader" || localStorage.getItem("user_type") !== "broker" || localStorage.getItem("user_type") !== "leadgen" || localStorage.getItem("user_type") !== "leadgen" || localStorage.getItem("user_type") !== "datascrapper"){
    //   let rolesss = "Clients,SMS Campaign,Team Leaders,Data Scrappers,Investors,Applicants,Brokers,Trash,Job Roles";
    //   let tempAssignedActions = rolesss.split(',');
    //   setAssignedActions(tempAssignedActions);
    //   assignedMenu(tempAssignedActions);
    // }else{
    //   checkRoleAndGiveAccess(localStorage.getItem("user_type"));
    // }
    
  }, []);

  // Admin Menus
  let menu = [
    {
      label: 'Dashboard',
      icon: 'ti ti-smart-home',
      to: '/dashboard'
    },
    {
      label: 'Clients',
      icon: 'ti ti-users',
      to: '/clients'
    },
    {
      label: 'Client',
      icon: 'pi pi-user',
      to: '/client'
    },
    {
      label: 'HR',
      icon: 'ti ti-briefcase',
      items: [
        { label: 'Careers', icon: 'ti ti-stairs-up', to: '/careers' },
        { label: 'Applicants', icon: 'ti ti-clipboard-text', to: '/applicants' },
        { label: 'Job Roles', icon: 'ti ti-user-check', to: '/master/job/roles' },
        { label: 'Employees', icon: 'ti ti-briefcase', to: '/employees' },
        { label: 'Leave Type', icon: 'ti ti-calendar-pause', to: '/leave-type' },
      ],
    },
    {
      label: 'CRM',
      icon: 'ti ti-database-dollar',
      items: [
        { label: 'Opportunities', icon: 'ti ti-filter-cog', to: '/leads' },
      ],
    },
    {
      label: 'Investment Portal',
      icon: 'ti ti-heart-handshake',
      items: [
        { label: 'Potential Investors', icon: 'ti ti-user-hexagon', to: '/investors' },
        { label: 'Current Investors', icon: 'ti ti-user-dollar', to: '/current-investors' },
        { label: 'Investment Material', icon: 'ti ti-book-2', to: '/investment-material' },
        { label: 'Investor Converting Docs', icon: 'ti ti-checklist', to: '/investor-converting-docs' },
      ]
    },
    {
      label: 'Sales',
      icon: 'ti ti-chart-arrows-vertical',
      items: [
        { label: 'SMS Campaign', icon: 'ti ti-message-2', to: '/sms-campaigns' },
        { label: 'Email Campaigns', icon: 'ti ti-mail', to: '/campaigns' },
      ],
    },
    {
      label: 'eSign',
      icon: 'ti ti-certificate',
      to: '/nda-list'
    },
    {
      label: 'Trash',
      icon: 'ti ti-trash',
      to: '/trash'
    },
  ];

  // Menu for employees
  if (localStorage.getItem("user_type") === "employee") {
    menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
      },
      {
        label: 'Interview',
        icon: 'pi pi-users',
        to: '/Interview'
      },
    ];
  };

  // Menu for clients
  if (localStorage.getItem("user_type") === "client") {
    menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
      },
      {
        label: 'Careers',
        icon: 'pi pi-briefcase',
        items: [
          { label: 'Careers', icon: 'pi pi-minus', to: '/careers' },
          { label: 'Applicants', icon: 'pi pi-minus', to: '/applicants' },
        ],
      }
    ];
  };

  // Menu for investors
  if (localStorage.getItem("user_type") === "investor" || localStorage.getItem("user_type") === "currentinvestor") {
    menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
      },
      {
        label: 'Investment Material',
        icon: 'pi pi-dollar',
        to: '/investor-material'
      },
    ];
  };

  // Menu for team leader
  if (localStorage.getItem("user_type") === "teamleader") {
    menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
      },
      {
        label: 'Brokers',
        icon: 'pi pi-users',
        to: '/brokers'
      },
      {
        label: 'Lead Generators',
        icon: 'pi pi-user-plus',
        to: '/lead-generators'
      },
      {
        label: 'Data Scrappers',
        icon: 'pi pi-database',
        to: '/data-scrappers'
      },
      {
        label: 'Leads',
        icon: 'pi pi-user-plus',
        to: '/leads'
      },
      // {
      //   label: 'Team',
      //   icon: 'pi pi-sitemap',
      //   to: '/team'
      // },
    ];
  };

  // Menu for brokers
  if (localStorage.getItem("user_type") === "broker") {
    menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
      },
      {
        label: 'Potential Investors',
        icon: 'pi pi-users',
        to: '/investors'
      },
      {
        label: 'Lead Generators',
        icon: 'pi pi-send',
        to: '/lead-generators'
      },
      {
        label: 'Leads',
        icon: 'pi pi-user-plus',
        to: '/personal-broker-leads'
      },
    ];
  };

  // Menu for lead generator
  if (localStorage.getItem("user_type") === "leadgen") {
    menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
      },
      {
        label: 'Data Scrappers',
        icon: 'pi pi-users',
        to: '/data-scrappers'
      },
    ];
  };

  // Menu for datascrapper
  if (localStorage.getItem("user_type") === "datascrapper") {
    menu = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        to: '/dashboard'
      },
      {
        label: 'Leads',
        icon: 'pi pi-user-plus',
        to: '/leads'
      },
    ];
  };

  // // Check role and give access
  // const checkRoleAndGiveAccess = (userType: any) => {
    

  //   setAssignedActions(menu);
  // };

  // Make roles menu
  const assignedMenu = (assignedActions: any) => {
    let newMenu: any = menu;
    //check for assigned roles
    for (let i = 0; i < assignedActions.length; i++) {
      for (let j = 0; j < newMenu.length; j++) {
        //check if inner roles exists
        if (newMenu[j].hasOwnProperty('items')) {
          let items: any = newMenu[j].items;
          //check for inner roles
          for (let k = 0; k < items.length; k++) {
            //if role is assigned change status to 1
            if (items[k].label == assignedActions[i]) {
              items[k].status = "1";
            }
          }
        } else {
          //if role is assigned change status to 1
          if (newMenu[j].label == assignedActions[i]) {
            newMenu[j]["status"] = "1";
          }
        }
      }
    }

    //Create new array for assisgned roles to display in sidebar
    let newAssignedRoles = [];
    for (let j = 0; j < newMenu.length; j++) {
      if (newMenu[j].hasOwnProperty('items')) {
        //check for inner roles
        let items: any = newMenu[j].items;
        for (let k = 0; k < items.length; k++) {
          if (items[k]["status"] != undefined) {
            //check if value exists in array of object or not
            let valueExists = newAssignedRoles.some((el: any) => el.label == newMenu[j]["label"]);
            //if value exists in array of object the push in items array
            if (valueExists) {
              for (let x = 0; x < newAssignedRoles.length; x++) {
                if (newAssignedRoles[x]["label"] == newMenu[j]["label"]) {
                  newAssignedRoles[x]["items"]?.push(items[k]);
                }
              }
            } else {
              //if value does not exusts in array object then push new object in array
              newAssignedRoles.push({
                "label": newMenu[j]["label"],
                "icon": newMenu[j]["icon"],
                "items": [items[k]]
              });
            }
          }
        }
      } else {
        if (newMenu[j]["status"] != undefined) {
          newAssignedRoles.push(newMenu[j]);
        }
      }
    }
    setAssignedActions(newAssignedRoles);
  };

  let menuClick: any;

  let topbarItemClick: any;

  useEffect(() => {
    copyTooltipRef &&
      copyTooltipRef.current &&
      copyTooltipRef.current.updateTargetEvents();
  }, [location]);

  useEffect(() => {
    setResetActiveIndex(true);
    setMenuActive(false);
  }, [menuMode]);

  const onDocumentClick = () => {
    if (!topbarItemClick) {
      setTopbarMenuActive(false);
    }

    if (!menuClick) {
      if (isHorizontal() || isSlim()) {
        setMenuActive(false);
        setResetActiveIndex(true);
      }

      if (overlayMenuActive || staticMenuMobileActive) {
        setOverlayMenuActive(false);
        setStaticMenuMobileActive(false);
      }

      hideOverlayMenu();
      unblockBodyScroll();
    }

    topbarItemClick = false;
    menuClick = false;
  };

  const onMenuButtonClick = (event: any) => {
    menuClick = true;

    if (isOverlay()) {
      setOverlayMenuActive((prevState) => !prevState);
    }

    if (isDesktop()) {
      setStaticMenuDesktopInactive((prevState) => !prevState);
    } else {
      setStaticMenuMobileActive((prevState) => !prevState);
    }

    event.preventDefault();
  };

  const hideOverlayMenu = () => {
    setOverlayMenuActive(false);
    setStaticMenuMobileActive(false);
  };

  const onTopbarItemClick = (event: any) => {
    topbarItemClick = true;
    setTopbarMenuActive((prevState) => !prevState);
    hideOverlayMenu();
    event.preventDefault();
  };

  const onToggleMenu = (event: any) => {
    menuClick = true;

    if (overlayMenuActive) {
      setOverlayMenuActive(false);
    }

    if (sidebarActive) {
      setSidebarStatic((prevState) => !prevState);
    }

    event.preventDefault();

  };

  const onSidebarMouseOver = () => {
    if (menuMode === 'sidebar' && !sidebarStatic) {
      setSidebarActive(isDesktop());
      setTimeout(() => {
        setPinActive(isDesktop());
      }, 200);
    }
  };

  const onSidebarMouseLeave = () => {
    if (menuMode === 'sidebar' && !sidebarStatic) {
      setTimeout(() => {
        setSidebarActive(false);
        setPinActive(false);
      }, 250);
    }
  };

  const onMenuClick = () => {
    menuClick = true;
  };

  const onChangeActiveInlineMenu = (event: any) => {
    setActiveInlineProfile((prevState) => !prevState);
    event.preventDefault();
  };

  const onRootMenuItemClick = () => {
    setMenuActive((prevState) => !prevState);
  };

  const onMenuItemClick = (event: any) => {
    if (!event.item.items) {
      hideOverlayMenu();
      setResetActiveIndex(true);
    }

    if (!event.item.items && (isHorizontal() || isSlim())) {
      setMenuActive(false);
    }
  };

  const isHorizontal = () => {
    return menuMode === 'horizontal';
  };

  const isSlim = () => {
    return menuMode === 'slim';
  };

  const isOverlay = () => {
    return menuMode === 'overlay';
  };

  const isDesktop = () => {
    return window.innerWidth > 991;
  };

  const unblockBodyScroll = () => {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    } else {
      document.body.className = document.body.className.replace(
        new RegExp(
          '(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
    }
  };

  const layoutClassName = classNames('layout-wrapper', {
    'layout-static': menuMode === 'static',
    'layout-overlay': menuMode === 'overlay',
    'layout-overlay-active': overlayMenuActive,
    'layout-slim': menuMode === 'slim',
    'layout-horizontal': menuMode === 'horizontal',
    'layout-active': menuActive,
    'layout-mobile-active': staticMenuMobileActive,
    'layout-sidebar': menuMode === 'sidebar',
    'layout-sidebar-static': menuMode === 'sidebar' && sidebarStatic,
    'layout-static-inactive':
      staticMenuDesktopInactive && menuMode === 'static',
  });

  const [isFullView, setIsFullView] = useState<boolean>(true);

  const changeVal = (val: any) => {
    setIsFullView(val);
  };

  return (
    <div className={layoutClassName} onClick={onDocumentClick}>
      <Tooltip
        ref={copyTooltipRef}
        target=".block-action-copy"
        position="bottom"
        content="Copied to clipboard"
        event="focus"
      />
      <div className="layout-main">
        <AppTopbar
          items={menu}
          menuMode={menuMode}
          colorScheme={props.colorScheme}
          menuActive={menuActive}
          topbarMenuActive={topbarMenuActive}
          activeInlineProfile={activeInlineProfile}
          onTopbarItemClick={onTopbarItemClick}
          onMenuButtonClick={onMenuButtonClick}
          onSidebarMouseOver={onSidebarMouseOver}
          onSidebarMouseLeave={onSidebarMouseLeave}
          onToggleMenu={onToggleMenu}
          onChangeActiveInlineMenu={onChangeActiveInlineMenu}
          onMenuClick={onMenuClick}
          onMenuItemClick={onMenuItemClick}
          onRootMenuItemClick={onRootMenuItemClick}
          resetActiveIndex={resetActiveIndex}
        />
        
        <AppMenu
          changeColorScheme={props.onColorSchemeChange}
          model={menu}
          onRootMenuItemClick={onRootMenuItemClick}
          onMenuItemClick={onMenuItemClick}
          onToggleMenu={onToggleMenu}
          onMenuClick={onMenuClick}
          menuMode={menuMode}
          colorScheme={props.colorScheme}
          menuActive={menuActive}
          sidebarActive={sidebarActive}
          sidebarStatic={sidebarStatic}
          pinActive={pinActive}
          onSidebarMouseLeave={onSidebarMouseLeave}
          onSidebarMouseOver={onSidebarMouseOver}
          activeInlineProfile={activeInlineProfile}
          onChangeActiveInlineMenu={onChangeActiveInlineMenu}
          resetActiveIndex={resetActiveIndex}
          onFChnge={changeVal}
        />
        <div className={isFullView === true ? "layout-main-content-custom" : "layout-main-content"}>
          <Routes>
            {/* <Route path="/forminputs" element={<FormsInput />} /> */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<UserAllNotificationsList />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Clients */}
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/client/details" element={<ClientsDetails />} />

            {/* Team Leaders */}
            <Route path="/team-leaders" element={<TeamLeaderList />} />
            <Route path="/teamleader/details" element={<TeamLeaderDetails />} />
            <Route path="/team" element={<Team />} />

            {/* Brokers */}
            <Route path="/brokers" element={<BrokersList />} />
            <Route path="/broker/details" element={<BrokersDetails />} />
            <Route path="/personal-broker-leads" element={<PersonalBrokerLeadList />} />

            {/* Lead Generators */}
            <Route path="/lead-generators" element={<LeadGeneratorsList />} />
            <Route path="/leadgenerators/details" element={<LeadGeneratorsDetails />} />

            {/* Data Scrappers */}
            <Route path="/data-scrappers" element={<DataScrappersList />} />
            <Route path="/datascrapper/details" element={<DataScrapperDetails />} />

            {/* Investors */}
            <Route path="/individual-investors" element={<PerticularBrokerInvestorList />} />
            <Route path="/investors" element={<InvestorsList />} />
            <Route path="/investor/details" element={<InvestorsDetails />} />
            <Route path="/investor-converting-docs" element={<InvestorConvertingDocs />} />
            <Route path="/become-an-investor" element={<BecomeAnInvestor />} />

            {/* Current Investors */}
            <Route path="/current-investors" element={<CurrentInvestorsList />} />
            <Route path="/current-investor-details" element={<CurrentInvestorDetails />} />
            <Route path="/investor-doc-upload" element={<InvestorDocUpload />} />

            {/* Careers */}
            <Route path="/careers" element={<CareersList />} />
            <Route path="/career/publish" element={<AddUpdateCareers />} />
            <Route path="/career/details" element={<CareerJobDetailsView />} />

            {/* Applicants */}
            <Route path="/applicants" element={<CareerApplicants />} />
            <Route path="/applicant/details/:id" element={<CareerApplicantsDetail />} />

            {/* Master */}
            <Route path="/master/job/roles" element={<JobRoles />} />
            <Route path="/investment-material" element={<InvestmentMaterial />} />

            {/* Investment Material */}
            <Route path="/investor-material" element={<InvestorMaterialList />} />

            {/* Investment Material Approval */}
            <Route path="/invt-material-approvals" element={<InvestmentMaterialApproval />} />

            {/* Trash */}
            <Route path="/trash" element={<TrashList />} />

            {/* Settings */}
            <Route path="/user-settings" element={<UserSettings />} />

            {/* Leads */}
            <Route path="/leads" element={<LeadsList />} />
            <Route path="/lead-details" element={<LeadView />} />
            <Route path="/add-update-leads" element={<AddLeads />} />
            <Route path="/kanban-view-leads" element={<KanbanViewLeads />} />

            {/* Campaigns */}
            <Route path="/campaigns" element={<CampaignsList />} />
            <Route path="/campaign-details" element={<CampaignDetails />} />

            {/* SMS Campaign */}
            <Route path="/sms-campaigns" element={<SMSCampaignList />} />
            <Route path="/add-update-campaign" element={<AddUpdateSMSCampaign />} />
            <Route path="/sms-campaign-details" element={<SMSCampaignDetails />} />
            <Route path="/message-recipients" element={<SMSCampaignMessageRecipients />} />

            {/* Role Management */}
            <Route path="/role-management" element={<RoleManagement />} />
            
            {/* NDA */}
            <Route path="/nda-list" element={<NDA />} />
            <Route path="/sign-nda" element={<SignNDA />} />

            {/* Employee */}
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employee/details" element={<EmployeeDetails />} />

            {/* Leaves */}
            <Route path="/leaves" element={<LeavesList />} />
            <Route path="/leave-type" element={<LeaveType />} />

            {/* Interview */}

            <Route path="/interview-stages" element={<InterviewStagesMaster />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/interview/interviewdetails" element={<InterviewDetails />} />

            <Route path="/test-excel" element={<TestExcel />} />
            {/* Client */}
            <Route path="/client" element={<CList />} />
          </Routes>
        </div>

        {/* <AppFooter colorScheme={props.colorScheme} /> */}
      </div>
    </div>
  );
};

export default App;
