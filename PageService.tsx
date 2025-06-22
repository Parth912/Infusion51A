import { APP_BASE_URL, convertDateFrom } from '../appconfig/Settings';
import {
  ADD_INVESTMENT_MATERIAL,
  ADD_UPDATE_LEAD,
  ADD_READ_TIME_OF_INVT_MATERIAL,
  ADD_TEAM_MEMBERS,
  ADD_UPDATE_CAREER_JOBS,
  ADD_UPDATE_CLIENT,
  ADD_UPDATE_INVT_MATERIAL_FOLDER,
  ADD_UPDATE_JOB_ROLE,
  APPLICANT_STATUS_CHANGE,
  APPROVE_INVESTMENT_MATERIAL_ACCESS,
  APPROVE_REJECT_CLIENT,
  CHANGE_CAREER_JOB_POST_STATUS,
  CHANGE_JOB_ROLE_STATUS,
  CHANGE_PASSWORD,
  CLEAR_NOTIFICATION,
  DELETE_CLIENT,
  DELETE_FOLDER,
  DELETE_INVESTMENT_MATERIAL,
  EMPTY_TRASH,
  GET_ALL_INVESTMENT_APPROVAL_MATERIAL,
  GET_ALL_INVESTMENT_MATERIAL,
  GET_ALL_INVT_MATERIAL_FOLDER,
  GET_APPLICANTS_LIST,
  GET_BROKERS_TO_ADD_TEAM,
  GET_BROKER_INVT_LIST_DROPDOWN,
  GET_CAREER_JOBS,
  GET_CLIENTS_LIST,
  GET_COUNTRIES,
  GET_DASHBOARD_DATA,
  GET_FILE_OR_FOLDER_DETAILS,
  GET_INVESTOR_MATERIAL_DATA,
  GET_JOB_ROLES,
  GET_NOTIFICATIONS,
  GET_NOT_ASSIGNED_USER,
  GET_SINGLE_APPLICANT_DATA,
  GET_SINGLE_CAREER_JOB,
  GET_SINGLE_CLIENT_DATA,
  GET_SINGLE_INVESTMENT_MATERIAL,
  GET_SINGLE_JOB_ROLE,
  GET_TRASHED_FOLDER_OR_FILE,
  GET_USER_ALL_NOTIFICATIONS,
  INVESTMENT_MATERIAL_ACCESS,
  SET_BROCHURE_DATA,
  TRASH_OR_REVERT_FOLDER_OR_FILE,
  UPDATE_PROFILE_IMG,
  UPLOAD_BROCHURE,
  VIEW_FLIPBOOK,
  VIEW_INVESTMENT_MATERIAL,
  GET_ZOHO_FORM_FIELDS,
  GET_ASSIGNED_USERS,
  GET_LEADS,
  ADD_LEADS_BY_EXCEL,
  GET_LEADS_LIST_FILTER,
  GET_SINGLE_LEAD,
  GET_PERSONAL_LEADS,
  KANBAN_LEADS_DATA,
  KANBAN_LEAD_STAGE_CHANGE,
  ADD_TASK,
  GET_TASKS,
  CHANGE_TASK_STATUS,
  GET_INSTANTLY_CAMPAIGNS,
  GET_CAMPAIGN_DETAILS,
  GET_SMS_CAMPAIGNS,
  ADD_UPDATE_SMS_CAMPAIGN,
  GET_INVESTORS_LIST_FOR_CAMPAIGNS,
  GET_SMS_CAMPAIGN_DETAILS,
  ADD_UPDATE_ROLE,
  GET_ALL_ROLES,
  GET_SINGLE_ROLE,
  GET_TWILIO_NUMBERS,
  DELETE_SMS_CAMPAIGN,
  GET_EDIT_CAMPAIGN_DATA,
  ALLOW_REVOKE_DOWNLOAD_FILE,
  ADD_LEAD_NOTES,
  GET_LEAD_NOTES,
  ADD_UPDATE_NDA,
  LIST_ALL_NDA,
  GET_SINGLE_NDA,
  DELETE_NDA,
  UPLOAD_SIGNED_NDA,
  GET_DRIVE_FOLDER_DETAILS,
  GET_PDF_DYNAMIC_DATA,
  UPDATE_LEADS_DATA,
  ADD_USER_EXTRA_DETAILS,
  ADD_UPDATE_EMPLOYEE,
  GET_ALL_EMPLOYEE,
  GET_SINGLE_EMPLOYEE,
  ADD_UPDATE_LEAVE_TYPE,
  GET_ALL_LEAVE_TYPE,
  GET_SINGLE_LEAVE_TYPE,
  CHANGE_LEAVE_TYPE_STATUS,
  ADD_UPDATE_LEAVE,
  GET_ALL_LEAVES,
  GET_SINGLE_LEAVE,
  ADD_EXTRA_PEOPLE_TO_CAMPAIGN,
  ADD_NEW_MESSAGE_TO_CAMPAIGN,
  GET_MESSAGE_RECIPIENT,
  ADD_UPDATE_CONVERT_INVESTOR_DOC,
  GET_ALL_CONVERT_INVESTOR_DOC,
  GET_SINGLE_CONVERT_INVESTOR_DOC,
  DELETE_CONVERT_INVESTOR_DOC,
  UPLOAD_INVESTOR_DOC,
  GET_INVESTOR_UPLOADED_DOCS,
  ADD_REQUEST_FOR_DOC,
  GET_TIMEZONES,
  ADD_SPECIFIC_RECIPIENTS_TO_MESSAGE,
  ADD_INVESTOR_ATTORNEY,
  GET_INVESTOR_ATTORNEY,
  REMOVE_RECIPIENT_FROM_CAMPAIGN,
  ADD_UPDATE_INTERVIEW_STAGE_MASTER,
  GET_ALL_INTERVIEW_STAGES_MASTER,
  CHANGE_INTERVIEW_STAGES_MASTER_STATUS,
} from '../config/ApiConstant';
import axiosInstance from '../config/axiosInstance';

export default class CommonService {

  // Update profile image
  updateProfileImg(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + UPDATE_PROFILE_IMG, requestData)
      .then((res) => res.data);
  }

  // Get countries
  getCountries() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_COUNTRIES
      )
      .then((res) => res.data.data);
  }

  // Get dashboard data
  getDashboardData() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_DASHBOARD_DATA
      )
      .then((res) => res.data.data);
  }

  // Get notifications
  getNotifications() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_NOTIFICATIONS
      )
      .then((res) => res.data.data);
  }

  // Clear notification
  clearNotification(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        CLEAR_NOTIFICATION + 
        "?id=" + id
      )
      .then((res) => res.data);
  }

  // Get user all notifications
  getUserAllNotifications(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_USER_ALL_NOTIFICATIONS +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  //Change Password
  changePassword(formRequestData: any) {
    return axiosInstance.post(APP_BASE_URL + CHANGE_PASSWORD, formRequestData).then((res) => res.data);
  }

  // Add update client
  addUpdateClientApiCall(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_CLIENT, requestData)
      .then((res) => res.data);
  }

  // Add user extra details
  addUserExtraDetails(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_USER_EXTRA_DETAILS, requestData)
      .then((res) => res.data);
  }

  // Get Clients List
  getClientsList(status: any, user_type: any, perticular_broker: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_CLIENTS_LIST + 
        "?status=" + status + 
        "&user_type=" + user_type + 
        "&perticular_broker=" + perticular_broker
      )
      .then((res) => res.data.data);
  }

  // Get Single Client Details
  getSingleClientDetails(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_CLIENT_DATA +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Delete Client
  deleteClient(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        DELETE_CLIENT +
        "?id=" + id
      )
      .then((res) => res.data);
  }

  //Approve Reject Client
  approveRejectClient(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + APPROVE_REJECT_CLIENT, requestData)
      .then((res) => res.data);
  }

  // Upload Client Brochure
  uploadClientBrochure(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + UPLOAD_BROCHURE, requestData)
      .then((res) => res);
  }

  // Open Client Brochure
  setClientBrochureData(client_id: any) {
    return axiosInstance
      .get(APP_BASE_URL + SET_BROCHURE_DATA + "?client_id=" + client_id)
      .then((res) => res);
  }

  // Add update career jobs
  addUpdateCareerJobs(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_CAREER_JOBS, requestData)
      .then((res) => res);
  }

  // Get career jobs
  getCareerJobs(status: any, job_company: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_CAREER_JOBS +
        "?status=" + status +
        "&job_company=" + job_company
      )
      .then((res) => res.data.data);
  }

  // Get Single Client Details
  getSingleCareerJob(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_CAREER_JOB +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Change career job post status
  changeCareerJobPostStatus(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + CHANGE_CAREER_JOB_POST_STATUS, requestData)
      .then((res) => res.data);
  }

  // Add update job roles
  addUpdateJobRole(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_JOB_ROLE, requestData)
      .then((res) => res);
  }

  // Get job roles
  getJobRolesList(status: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_JOB_ROLES +
        "?status=" + status
      )
      .then((res) => res.data.data);
  }

  // Get single job role
  getSingleJobRole(job_role_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_JOB_ROLE +
        "?id=" + job_role_id
      )
      .then((res) => res.data.data);
  }

  // Change job role status
  changeJobRoleStatus(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + CHANGE_JOB_ROLE_STATUS, requestData)
      .then((res) => res.data);
  }

  // Get job roles for dropdown
  getJobRolesListForDropdown() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_JOB_ROLES +
        "?type=active"
      )
      .then((res) => res.data.data);
  }

  // Get job companies for dropdown
  getJobCompaniesListForDropdown() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_CLIENTS_LIST +
        "?type=active"
      )
      .then((res) => res.data.data);
  }

  // Get applicants list
  getApplicantsList(status: any, company_id: any, job_role: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_APPLICANTS_LIST +
        "?status=" + status +
        "&company_id=" + company_id + 
        "&job_role=" + job_role
      )
      .then((res) => res.data.data);
  }

  // Get single applicant details
  getSingleApplicantDetails(applicant_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_APPLICANT_DATA +
        "?id=" + applicant_id
      )
      .then((res) => res.data.data);
  }

  // Applicant status change
  applicantStatusChange(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + APPLICANT_STATUS_CHANGE, requestData)
      .then((res) => res.data);
  } 

  // Get all investment material list
  getAllInvestmentMaterial(type:any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_INVESTMENT_MATERIAL + 
        "?type=" + type
      )
      .then((res) => res.data);
  }

  // Get Single investment material
  getSingleInvestmentMaterial(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_INVESTMENT_MATERIAL +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Get file or folder details
  getFileOrFolderDetails(url: any, id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_FILE_OR_FOLDER_DETAILS +
        "?url=" + url + 
        "&id=" + id
      )
      .then((res) => res.data.data);
  }

  // Add investment material
  addInvestmentMaterial(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_INVESTMENT_MATERIAL, requestData)
      .then((res) => res);
  }

  // Investment material access
  investmentMaterialAccess(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + INVESTMENT_MATERIAL_ACCESS, requestData)
      .then((res) => res.data);
  }

  // Allow revoke download file
  allowRevokeDownloadFile(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ALLOW_REVOKE_DOWNLOAD_FILE, requestData)
      .then((res) => res.data);
  };

  // Get file or folder details
  getInvestorMaterialData() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_INVESTOR_MATERIAL_DATA
      )
      .then((res) => res.data.data);
  }

  // View investment material
  viewInvestmentMaterial(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        VIEW_INVESTMENT_MATERIAL +
        "?file_id=" + id
      )
      .then((res) => res.data.data);
  }

  // Get file or folder details
  getAllInvestmentApprovalMaterial(status: any, broker_id: any, investor_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_INVESTMENT_APPROVAL_MATERIAL + 
        "?status=" + status +
        "&broker_id=" + broker_id +
        "&investor_id=" + investor_id
      )
      .then((res) => res.data.data);
  }

  // Add investment material
  approveInvestmentMaterialAccess(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + APPROVE_INVESTMENT_MATERIAL_ACCESS, requestData)
      .then((res) => res.data);
  }

  // Get brokers and investors list for dropdown
  getBrokerInvestorListDropdown() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_BROKER_INVT_LIST_DROPDOWN
      )
      .then((res) => res.data);
  }

  // Add read time of investment material
  addReadTimeOfInvtMaterial(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_READ_TIME_OF_INVT_MATERIAL, requestData)
      .then((res) => res.data);
  }

  // Add update investmnet material folder
  addUpdateInvtMaterialFolder(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_INVT_MATERIAL_FOLDER, requestData)
      .then((res) => res.data);
  }

  // Get brokers and investors list for dropdown
  getAllInvtMaterialFolder() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_INVT_MATERIAL_FOLDER
      )
      .then((res) => res.data.data);
  }

  // Get trashed folder or file
  getTrashedFolderOrFile() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_TRASHED_FOLDER_OR_FILE
      )
      .then((res) => res.data);
  }

  // Trash or revert folder or file
  trashOrRevertFolderOrFile(id: any, type: any, action: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        TRASH_OR_REVERT_FOLDER_OR_FILE +
        "?id=" + id +
        "&type=" + type +
        "&action=" + action
      )
      .then((res) => res.data);
  }

  // Delete Folder
  deleteFolder(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        DELETE_FOLDER +
        "?id=" + id
      )
      .then((res) => res.data);
  }

  // Delete investment material
  deleteInvestmentMaterial(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        DELETE_INVESTMENT_MATERIAL +
        "?id=" + id
      )
      .then((res) => res.data);
  }

  // Empty Trash
  emptyTrash() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        EMPTY_TRASH
      )
      .then((res) => res.data);
  }

  // View flip book
  viewFlipBook(id: any) {
    return axiosInstance
      .get(APP_BASE_URL + VIEW_FLIPBOOK + "?id=" + id)
      .then((res) => res.data);
  }

  // Get brokers to add team
  getBrokersToAddTeam() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_BROKERS_TO_ADD_TEAM
      )
      .then((res) => res.data);
  }

  // Add team members
  addTeamMembers(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_TEAM_MEMBERS, requestData)
      .then((res) => res.data);
  }

  // Get not assigned lead gen
  getNotAssignedLeadGen(user_id: any, type: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_NOT_ASSIGNED_USER + 
        "?user_id=" + user_id + 
        "&type=" + type
      )
      .then((res) => res.data.data);
  }

  // Get assigned users
  getAssignedUsers(type: any, id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ASSIGNED_USERS + 
        "?type=" + type + 
        "&id=" + id
      )
      .then((res) => res.data.data);
  }

  // Add lead
  addLead(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_LEAD, requestData)
      .then((res) => res.data);
  }

  // Update leads data
  updateLeadsData(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + UPDATE_LEADS_DATA, requestData)
      .then((res) => res.data);
  }

  // Add leads by excel
  addLeadsByExcel(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_LEADS_BY_EXCEL, requestData)
      .then((res) => res.data);
  }

  // Get zoho form fields
  getZohoFormFields() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ZOHO_FORM_FIELDS
      )
      .then((res) => res.data.data);
  }

  // Get leads
  getLeads(leadgen_id: any = null, broker_id: any = null, user_id: any = null) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_LEADS + 
        "?leadgen_id=" + leadgen_id + 
        "&broker_id=" + broker_id + 
        "&datascrapper_id=" + user_id
      )
      .then((res) => res.data.data);
  }

  // Get leads
  getPersonalLeads() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_PERSONAL_LEADS
      )
      .then((res) => res.data.data);
  }

  // Get leads list filter
  getLeadsListFilter(datascrapper_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL + 
        GET_LEADS_LIST_FILTER + 
        "?datascrapper_id=" + datascrapper_id
      )
      .then((res) => res.data.data);
  }

  // Get leads
  getSingleLead(id: any, type: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_LEAD +
        "?id=" + id +
        "&type=" + type
      )
      .then((res) => res.data.data);
  }

  // Kanban leads data
  kanbanLeadsData(type: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        KANBAN_LEADS_DATA + 
        "?type=" + type
      )
      .then((res) => res.data.data);
  }

  // Kanban lead stage change
  kanbanLeadStageChange(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + KANBAN_LEAD_STAGE_CHANGE, requestData)
      .then((res) => res.data);
  }

  // Add Task
  addTask(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_TASK, requestData)
      .then((res) => res.data);
  }

  // Get Task
  getTask(id: any, status: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_TASKS +
        "?id=" + id + 
        "&status=" + status
      )
      .then((res) => res.data.data);
  }

  // Change Task Status
  changeTaskStatus(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + CHANGE_TASK_STATUS, requestData)
      .then((res) => res.data);
  }

  // Get Instantly Campaigns
  getInstantlyCampaigns() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_INSTANTLY_CAMPAIGNS
      )
      .then((res) => res.data.data);
  }

  // Get Campaign Details
  getCampaignDetails(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_CAMPAIGN_DETAILS + 
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Get SMS Campaigns
  getSMSCampaigns() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SMS_CAMPAIGNS
      )
      .then((res) => res.data.data);
  }

  // Add Update SMS Campaign
  addUpdateSMSCampaign(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_SMS_CAMPAIGN, requestData)
      .then((res) => res.data);
  }

  // Add Extra People To Campaign
  addExtraPeopleToCampaign(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_EXTRA_PEOPLE_TO_CAMPAIGN, requestData)
      .then((res) => res.data);
  }

  // Add New Message To Campaign
  addNewMessageToCampaign(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_NEW_MESSAGE_TO_CAMPAIGN, requestData)
      .then((res) => res.data);
  }

  // Add Specific Recipients To Message
  addSpecificRecipientsToMessage(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_SPECIFIC_RECIPIENTS_TO_MESSAGE, requestData)
      .then((res) => res.data);
  }

  // Get Investors List For Camapaign
  getInvestorsListForCampaign() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_INVESTORS_LIST_FOR_CAMPAIGNS
      )
      .then((res) => res.data.data);
  }

  // Get SMS Camapaign Details
  getSMSCampaignDetails(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SMS_CAMPAIGN_DETAILS + 
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Get Message Recipient
  getMessageRecipient(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_MESSAGE_RECIPIENT +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }


  // Add Update Role
  addUpdateRole(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_ROLE, requestData)
      .then((res) => res.data);
  }

  // Get All Roles
  getAllRoles(type: any = null) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_ROLES +
        "?type=" + type
      )
      .then((res) => res.data.data);
  }

  // Get Single Role
  getSingleRole(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_ROLE + 
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Get Twilio Numbers
  getTwilioNumbers() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_TWILIO_NUMBERS
      )
      .then((res) => res.data.data);
  }

  // Get Timezones
  getTimezones() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_TIMEZONES
      )
      .then((res) => res.data.data);
  }

  // Delete SMS Campaign
  deleteSMSCampaign(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        DELETE_SMS_CAMPAIGN +
        "?id=" + id
      )
      .then((res) => res.data);
  }

  // Get Edit Campaign Data
  getEditCampaignData(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_EDIT_CAMPAIGN_DATA +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Add lead notes
  addLeadNotes(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_LEAD_NOTES, requestData)
      .then((res) => res.data);
  }

  // Get lead notes
  getLeadNotes(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_LEAD_NOTES +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Get drive folder details
  getDriveFolderDetails(url: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_DRIVE_FOLDER_DETAILS +
        "?url=" + url
      )
      .then((res) => res.data.data);
  }

  // Get pdf dynamic data
  getPDFDynamicData(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_PDF_DYNAMIC_DATA +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Add update nda
  addUpdateNDA(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_NDA, requestData)
      .then((res) => res.data);
  }

  // List all nda
  listAllNDA() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        LIST_ALL_NDA
      )
      .then((res) => res.data.data);
  }

  // Get single nda
  getSingleNDA(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_NDA +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Delete nda
  deleteNDA(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + DELETE_NDA, requestData)
      .then((res) => res.data);
  }

  // Upload signed nda
  uploadSignedNDA(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + UPLOAD_SIGNED_NDA, requestData)
      .then((res) => res.data);
  }

  // Add update employee
  addUpdateEmployee(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_EMPLOYEE, requestData)
      .then((res) => res.data);
  }

  // Get all employee
  getAllEmployee() {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_EMPLOYEE
      )
      .then((res) => res.data.data);
  }

  // Get single employee
  getSingleEmployee(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_EMPLOYEE +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Add update leave type
  addUpdateLeaveType(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_LEAVE_TYPE, requestData)
      .then((res) => res.data);
  }

  // Get all leave type
  getAllLeaveType(type: any = null) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_LEAVE_TYPE +
        "?type=" + type
      )
      .then((res) => res.data.data);
  }

  // Get single leave type
  getSingleLeaveType(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_LEAVE_TYPE +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Change leave type status
  changeLeaveTypeStatus(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + CHANGE_LEAVE_TYPE_STATUS, requestData)
      .then((res) => res.data);
  }

  // Add update leave 
  addUpdateLeave(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_LEAVE, requestData)
      .then((res) => res.data);
  }

  // Get all leave
  getAllLeaves(user_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_LEAVES + 
        "?user_id=" + user_id
      )
      .then((res) => res.data.data);
  }

  // Get single leave
  getSingleLeave(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_LEAVE +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Add update convert investor doc
  addUpdateConvertInvestorDoc(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_CONVERT_INVESTOR_DOC, requestData)
      .then((res) => res.data);
  }

  // Get all convert investor doc
  getAllConvertInvestorDoc(type: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_CONVERT_INVESTOR_DOC + 
        "?type=" + type
      )
      .then((res) => res.data.data);
  }

  // Get single convert investor doc
  getSingleConvertInvestorDoc(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_SINGLE_CONVERT_INVESTOR_DOC +
        "?id=" + id
      )
      .then((res) => res.data.data);
  }

  // Delete convert investor doc
  deleteConvertInvestorDoc(id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL + 
        DELETE_CONVERT_INVESTOR_DOC +
        "?id=" + id
      )
      .then((res) => res.data);
  }

  // Upload investor doc
  uploadInvestorDoc(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + UPLOAD_INVESTOR_DOC, requestData)
      .then((res) => res.data);
  }

  // Get investor uploaded docs
  getInvestorUploadedDocs(user_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_INVESTOR_UPLOADED_DOCS +
        "?user_id=" + user_id
      )
      .then((res) => res.data.data);
  }

  // Add Investor Attorney
  addInvestorAttorney(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_INVESTOR_ATTORNEY, requestData)
      .then((res) => res.data);
  }

  // Get Investor Attorney
  getInvestorAttorney(investor_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_INVESTOR_ATTORNEY +
        "?investor_id=" + investor_id
      )
      .then((res) => res.data.data);
  }

  // Add request for doc
  addRequestForDoc(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_REQUEST_FOR_DOC, requestData)
      .then((res) => res.data);
  }

  // Remove Recipient From Campaign
  removeRecipientFromCampaign(campaign_id: any, recipient_id: any) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        REMOVE_RECIPIENT_FROM_CAMPAIGN + 
        "?campaign_id=" + campaign_id +
        "&recipient_id=" + recipient_id
      )
      .then((res) => res.data);
  }

  // Add update interview stages master
  addUpdateInterviewStageMaster(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + ADD_UPDATE_INTERVIEW_STAGE_MASTER, requestData)
      .then((res) => res);
  }

  // Get interview stages master
  getInterviewStagesMasterList(type: any = null) {
    return axiosInstance
      .get(
        APP_BASE_URL +
        GET_ALL_INTERVIEW_STAGES_MASTER +
        "?type=" + type
      )
      .then((res) => res.data.data);
  }

  // Change interview stage master status
  changeInterviewStageStatus(requestData: any) {
    return axiosInstance
      .post(APP_BASE_URL + CHANGE_INTERVIEW_STAGES_MASTER_STATUS, requestData)
      .then((res) => res.data);
  }
}