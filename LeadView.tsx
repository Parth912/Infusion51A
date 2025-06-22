import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

//Prime React Component Inbuilt
import { Tooltip } from 'primereact/tooltip';
import { TabMenu } from 'primereact/tabmenu';
import { InputTextarea } from 'primereact/inputtextarea';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { leadNoteValidate } from '../../../config/Validate';
import moment from 'moment';

export const LeadView = () => {
    document.title = "Lead Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/leads">Leads</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Lead Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    const tabitems = [
        { label: 'Overview' },
        { label: 'Address Information' },
        { label: 'Social Media' },
    ];

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [leadData, setLeadData] = useState<any>({});
    const [currentTab, setCurrentTab] = useState<any>({ index: 0, value: "Overview" });
    const [noteTitle, setNoteTitle] = useState<any>('');
    const [note, setNote] = useState<any>('');
    const [isListening, setIsListening] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>({});
    const [saveNoteLoader, setSaveNoteLoader] = useState<boolean>(false);
    const [leadNotes, setLeadNotes] = useState<any>([]);
    const [editingFieldName, setEditingFieldName] = useState<any>("");
    const [editingFieldValue, setEditingFieldValue] = useState<any>("");

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Page service
    const pageService = new PageService();
    const toast = useRef<any>(null);

    // useEffect
    useEffect(() => {
        if (location.state) {
            const state = location.state;
            getSingleLeadDataFromAPi(state);
            getLeadNotesFromAPI(state);
        }
    }, []);

    useEffect(() => {
        setNote(note + transcript);
    }, [transcript]);

    // On change tab
    const changeCurrentTab = (tab: any) => {
        setCurrentTab({ index: tab?.index, value: tab?.value?.label });
    };

    // Get lead data
    const getSingleLeadDataFromAPi = (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleLead(state.lead_id, "")
            .then((response) => {
                // Get response
                if (response) {
                    setLeadData(response);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                }
            });
    };

    // get lead notes
    const getLeadNotesFromAPI = (state: any) => {
        // Api call
        pageService
            .getLeadNotes(state.lead_id)
            .then((response) => {
                // Get response
                if (response) {
                    setLeadNotes(response);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                }
            });
    };

    // Start mic for note
    const startListening = () => {
        setIsListening(true);
        SpeechRecognition.startListening();
    };

    // Stop mic for note
    const stopListening = () => {
        setIsListening(false);
        SpeechRecognition.stopListening();
    };

    // On save note
    const onSaveNote = () => {
        const { errors, isError } = leadNoteValidate(noteTitle, note);
        setErrors(errors);
        try {
            if (!isError) {
                setSaveNoteLoader(true);
                let formData = new FormData();
                formData.append("note_title", noteTitle);
                formData.append("note", note);
                formData.append("lead_id", leadData?.id);

                // call api
                pageService.addLeadNotes(formData).then((response) => {
                    // Get response
                    if (response) {
                        setSaveNoteLoader(false);
                        setNoteTitle("");
                        setNote("");
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: response.message,
                        });
                        getLeadNotesFromAPI({ lead_id: leadData?.id });
                    } else {
                        setSaveNoteLoader(false);
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Something went wrong, Please try again.',
                        });
                    }
                });
            }
        } catch (error: any) {
            setSaveNoteLoader(false);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response.data.error,
            });
        }
    };

    // On editing field
    const onEditingField = (name: any, val: any) => {
        setEditingFieldName(name);
        setEditingFieldValue(val);
    };

    // On close editing field
    const onCloseEditingField = () => {
        setEditingFieldName("");
        setEditingFieldName("");
    };

    // On save editing field
    const onSaveEditingField = (name: any) => {
        try {
            setPageLoad(true);
            let formData = new FormData();
            formData.append("id", leadData?.id);
            if (name === "Birthdate") {
                const formattedDate = moment(editingFieldValue).format('YYYY-MM-DD');
                formData.append(name, formattedDate);
            } else {
                formData.append(name, editingFieldValue);
            }

            // call api
            pageService.updateLeadsData(formData).then((response) => {
                // Get response
                if (response) {
                    setPageLoad(false);
                    setEditingFieldName("");
                    setEditingFieldValue("");
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    getSingleLeadDataFromAPi({ lead_id: leadData?.id });
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
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">{localStorage.getItem("user_type") !== "datascrapper" ? <Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> : <></>} Lead Details</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
            </div>
            {
                !window.cn(leadData) && Object.keys(leadData).length > 0 ?
                    <>
                        <div className="grid">
                            <div className="col-12">
                                <div className="card">
                                    <div className="card-body pb-0">
                                        <div className="userprofile-card">
                                            <div className="userprofile-avatar-box">
                                                {/* <img className="userprofile-avatar-img" src="https://preview.keenthemes.com/metronic8/demo31/assets/media/avatars/300-1.jpg" alt="Max Smith" /> */}
                                                <span className="userprofile-avatar-img"><span className="userprofile-avatar-text">{leadData?.First_Name.substring(0, 1)}</span></span>
                                            </div>
                                            <div className="userprofile-infoarea">
                                                <div className="userprofile-info">
                                                    <div className="userprofile-namebox">
                                                        <div className="userprofile-name">{leadData?.First_Name + " " + leadData?.Last_Name}</div>
                                                    </div>
                                                    {
                                                        !window.cn(leadData?.Website) && leadData?.Website !== null && leadData?.Website !== undefined ? <a href={leadData?.Website} target="_blank"><div className="userprofile-website">{leadData?.Website}</div></a> : <></>
                                                    }
                                                </div>
                                                <div className="userprofile-listbox">
                                                    <Tooltip target=".custom-target-icon" />
                                                    {
                                                        !window.cn(leadData?.Phone) && leadData?.Phone !== null && leadData?.Phone !== undefined ? <div className="userprofile-lists"><i className="ti ti-phone pr-2"></i> {leadData?.Phone} <i className="custom-target-icon ti ti-rosette-discount-check text-green ml-2" data-pr-tooltip="Verified" data-pr-position="top" data-pr-at="left+9 top-7"></i></div> : <></> 
                                                    }
                                                    {
                                                        !window.cn(leadData?.Email) && leadData?.Email !== null && leadData?.Email !== undefined ?<div className="userprofile-lists"><i className="ti ti-mail pr-2"></i> {leadData?.Email} <i className="custom-target-icon ti ti-rosette-discount-check text-green ml-2" data-pr-tooltip="Verified" data-pr-position="top" data-pr-at="left+9 top-7"></i></div> : <></>
                                                    }
                                                    {
                                                        !window.cn(leadData?.Company) && leadData?.Company !== null && leadData?.Company !== undefined ?
                                                            <>
                                                                <div className="userprofile-lists"><i className="ti ti-building pr-2"></i> {leadData?.Company}</div>
                                                            </>
                                                            :
                                                            <></>
                                                    }
                                                </div>
                                                {/* <div className="userprofile-listingname"><i className="ti ti-map-pin pr-2"></i>Dental Clinic, Ghatlodiya</div> */}
                                                {
                                                    !window.cn(leadData?.tags) && leadData?.tags !== null && leadData?.tags !== undefined ?
                                                        <>
                                                            <div className="userprofile-tagbox">
                                                                <div className="userprofile-tagicon"><i className="ti ti-tag pr-2"></i></div>
                                                                <div className="userprofile-taglists">
                                                                    {
                                                                        leadData?.tags.split(",").map((item: any, index: any) => {
                                                                            return (
                                                                                <div className="userprofile-tagname">{item}</div>
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                            </div>
                                                        </>
                                                        :
                                                        <></>
                                                }
                                            </div>
                                        </div>
                                        <div className="userprofile-menu">
                                            <div className="userprofile-menulist">
                                                <TabMenu model={tabitems} activeIndex={currentTab?.index} onTabChange={(e) => changeCurrentTab(e)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid">
                                    <div className="col-8">
                                        <div className="card">
                                            <div className="card-header">
                                                <div className="card-title-box">
                                                    <h3 className="card-title">Notes</h3>
                                                </div>
                                            </div>
                                            <div className="card-body p-0">
                                                <div className="card-body-inner">
                                                    <div className="p-fluid formgrid grid">
                                                        <div className="field col-12">
                                                            <label htmlFor="name">Enter Note Title <span className="required">*</span></label>
                                                            <InputText
                                                                value={noteTitle}
                                                                name="name"
                                                                autoComplete="off"
                                                                placeholder="Enter Note Title"
                                                                onChange={(e) => setNoteTitle(e.target.value)}
                                                                className={errors['note_title'] && 'p-invalid'}
                                                            />
                                                            {errors['note_title'] !== undefined ? <small className="p-invalid-txt">{errors['note_title']}</small> : <></>}
                                                        </div>
                                                        <div className="field col-12">
                                                            <label htmlFor="name">Enter Note <span className="required">*</span></label>
                                                            <InputTextarea
                                                                value={note}
                                                                onChange={(e) => setNote(e.target.value)}
                                                                rows={5}
                                                                cols={45}
                                                                placeholder='Enter Note'
                                                                className={errors['note'] && 'p-invalid'}
                                                            />
                                                            {errors['note'] !== undefined ? <small className="p-invalid-txt">{errors['note']}</small> : <></>}
                                                        </div>
                                                        <div className="field col-12">
                                                            <div className="text-right">
                                                                {
                                                                    isListening ?
                                                                        <Button
                                                                            className='p-button-danger'
                                                                            onClick={stopListening}
                                                                            icon="ti ti-microphone-off"
                                                                        />
                                                                        :
                                                                        <Button
                                                                            className='p-button-secondary'
                                                                            onClick={startListening}
                                                                            icon="ti ti-microphone"
                                                                        />
                                                                }
                                                                <Button
                                                                    className='ml-2'
                                                                    onClick={onSaveNote}
                                                                    icon="ti ti-check"
                                                                    loading={saveNoteLoader}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {
                                                    leadNotes.length > 0 ?
                                                        <div className="card-body-inner border-top v-scroll">
                                                            <div className="comments-note grid">
                                                                <div className="field col-12">
                                                                    <ul className="list-none m-0 p-0">
                                                                        {
                                                                            leadNotes.map((item: any, index: any) => {
                                                                                return (
                                                                                    <>
                                                                                        {
                                                                                            <li>
                                                                                                <a className="flex surface-border mb-3 p-3 border-1 surface-border border-round hover:surface-hover transition-colors transition-duration-150">
                                                                                                    {item?.user?.profile_img != null && item?.user?.profile_img != "null" && item?.user?.profile_img != "" ?
                                                                                                        <Avatar image={item?.user?.profile_img} shape="circle" />
                                                                                                        :
                                                                                                        <Avatar label={leadNotes?.user?.first_name.charAt(0).toUpperCase()} shape="circle" />
                                                                                                    }
                                                                                                    <div className="ml-3 flex-1">
                                                                                                        <span className="mb-2 font-semibold" style={{ color: "black" }}>{item?.note_title}</span>
                                                                                                        <p className="text-color-secondary mt-2 m-0">{item?.note}</p>
                                                                                                        <div className="notes-info">
                                                                                                            <div className="notes-info-list"><i className="ti ti-clock"></i>{moment(item?.created_at).format("MMM DD, YYYY")} by {item?.user?.first_name} {item?.user?.last_name}</div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </a>
                                                                                            </li>
                                                                                        }
                                                                                    </>
                                                                                )
                                                                            })
                                                                        }
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <></>
                                                }

                                            </div>
                                        </div>
                                        
                                        {currentTab?.value === "Overview" ? <div className="tab-panel">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title">Modules and Engagement Status</h3>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="userprofile-ullist">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">CE Engagement Status</div>
                                                            <div className="userprofile-value">{leadData?.CE_Engagement_Status}</div>
                                                        </div>
                                                        {
                                                            !window.cn(leadData?.Human_Capital) && leadData?.Human_Capital !== null && leadData?.Human_Capital !== undefined ?
                                                                <div className="userprofile-list">
                                                                    <div className="userprofile-label">Human Capital</div>
                                                                    <div className="userprofile-value">{leadData?.Human_Capital == 0 ? "No" : "Yes"}</div>
                                                                </div>
                                                                :
                                                                <></>
                                                        }
                                                        {
                                                            !window.cn(leadData?.Investment_Opportunity) && leadData?.Investment_Opportunity !== null && leadData?.Investment_Opportunity !== undefined ?
                                                                <div className="userprofile-list">
                                                                    <div className="userprofile-label">Investment Opportunity</div>
                                                                    <div className="userprofile-value">{leadData?.Investment_Opportunity == 0 ? "No" : "Yes"}</div>
                                                                </div>
                                                                :
                                                                <></>
                                                        }
                                                        {
                                                            !window.cn(leadData?.Vendor) && leadData?.Vendor !== null && leadData?.Vendor !== undefined ?
                                                                <div className="userprofile-list">
                                                                    <div className="userprofile-label">Vendor</div>
                                                                    <div className="userprofile-value">{leadData?.Vendor == 0 ? "No" : "Yes"}</div>
                                                                </div>
                                                                :
                                                                <></>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title mb-2">General Information</h3>
                                                        <p style={{ color: "gray", fontSize: "12px" }}>Double click on the text to edit it.</p>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="userprofile-ullist">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">First Name</div>
                                                            {
                                                                editingFieldName === "First_Name" ? 
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter First Name"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("First_Name")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("First_Name", leadData?.First_Name)}>{leadData?.First_Name}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Last Name</div>
                                                            {
                                                                editingFieldName === "Last_Name" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Last Name"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Last_Name")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Last_Name", leadData?.Last_Name)}>{leadData?.Last_Name}</div>
                                                            }   
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Birthdate</div>
                                                            {
                                                                editingFieldName === "Birthdate" ?
                                                                    <>
                                                                        <Calendar
                                                                            className="p-inputtext-sm"
                                                                            placeholder='Select Birth Date'
                                                                            value={editingFieldValue}
                                                                            onChange={(e) => setEditingFieldValue(e.value)}
                                                                            dateFormat="yy-mm-dd"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Birthdate")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Birthdate", leadData?.Birthdate)}>{!window.cn(leadData?.Birthdate) && leadData?.Birthdate !== null && leadData?.Birthdate !== undefined ? leadData?.Birthdate : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Title</div>
                                                            {
                                                                editingFieldName === "Title" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Title"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Title")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Title", leadData?.Title)}>{!window.cn(leadData?.Title) && leadData?.Title !== null && leadData?.Title !== undefined ? leadData?.Title : "-"}</div>  
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Company</div>
                                                            {
                                                                editingFieldName === "Company" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Company"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Company")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Company", leadData?.Company)}>{!window.cn(leadData?.Company) && leadData?.Company !== null && leadData?.Company !== undefined ? leadData?.Company : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Email</div>
                                                            {
                                                                editingFieldName === "Email" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Email"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Email")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Email", leadData?.Email)}>{leadData?.Email}  <span className="badge badge-success ml-2">Verified</span>  </div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Secondary Email</div>
                                                            {
                                                                editingFieldName === "Secondary_Email" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Secondary Email"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Secondary_Email")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Secondary_Email", leadData?.Secondary_Email)}> {!window.cn(leadData?.Secondary_Email) && leadData?.Secondary_Email !== null && leadData?.Secondary_Email !== undefined ? leadData?.Secondary_Email : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Email (Work)</div>
                                                            {
                                                                editingFieldName === "Email_Work" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Work Email"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Email_Work")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Email_Work", leadData?.Email_Work)}> {!window.cn(leadData?.Email_Work) && leadData?.Email_Work !== null && leadData?.Email_Work !== undefined ? leadData?.Email_Work : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Phone Number</div>
                                                            {
                                                                editingFieldName === "Phone" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Phone"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Phone")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Phone", leadData?.Phone)}>{leadData?.Phone}  <span className="badge badge-success ml-2">Verified</span>  </div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Direct Phone Number</div>
                                                            {
                                                                editingFieldName === "Phone_Home" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Home Phone"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Phone_Home")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Phone_Home", leadData?.Phone_Home)}> {!window.cn(leadData?.Phone_Home) && leadData?.Phone_Home !== null && leadData?.Phone_Home !== undefined ? leadData?.Phone_Home : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Work Phone Number</div>
                                                            {
                                                                editingFieldName === "Phone_Work" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Work Phone"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Phone_Work")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Phone_Work", leadData?.Phone_Work)}> {!window.cn(leadData?.Phone_Work) && leadData?.Phone_Work !== null && leadData?.Phone_Work !== undefined ? leadData?.Phone_Work : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Salary</div>
                                                            {
                                                                editingFieldName === "Salary" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Salary"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Salary")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Salary", leadData?.Salary)}> {!window.cn(leadData?.Salary) && leadData?.Salary !== null && leadData?.Salary !== undefined ? "$" + leadData?.Salary : "-"} </div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Industry</div>
                                                            {
                                                                editingFieldName === "Industry" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Industry"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Industry")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Industry", leadData?.Industry)}> {!window.cn(leadData?.Industry) && leadData?.Industry !== null && leadData?.Industry !== undefined ? leadData?.Industry : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Annual Revenue</div>
                                                            {
                                                                editingFieldName === "Annual_Revenue" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Annual Revenue"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Annual_Revenue")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Annual_Revenue", leadData?.Annual_Revenue)}> {!window.cn(leadData?.Annual_Revenue) && leadData?.Annual_Revenue !== null && leadData?.Annual_Revenue !== undefined ? "$" + leadData?.Annual_Revenue : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Number of Employee</div>
                                                            {
                                                                editingFieldName === "No_of_Employees" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter No of Employees"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("No_of_Employees")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("No_of_Employees", leadData?.No_of_Employees)}> {!window.cn(leadData?.No_of_Employees) && leadData?.No_of_Employees !== null && leadData?.No_of_Employees !== undefined ? leadData?.No_of_Employees : "-"}</div>
                                                            }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Website</div>
                                                            {
                                                                editingFieldName === "Website" ?
                                                                    <>
                                                                        <InputText
                                                                            value={editingFieldValue}
                                                                            name="name"
                                                                            autoComplete="off"
                                                                            placeholder="Enter Website Link"
                                                                            onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                            className="p-inputtext-sm"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                            onClick={() => onCloseEditingField()}
                                                                            icon="pi pi-times"
                                                                        />
                                                                        <Button
                                                                            className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                            onClick={() => onSaveEditingField("Website")}
                                                                            icon="pi pi-check"
                                                                        />
                                                                    </>
                                                                    :
                                                                    <div className="userprofile-value" onDoubleClick={() => onEditingField("Website", leadData?.Website)}> {!window.cn(leadData?.Website) && leadData?.Website !== null && leadData?.Website !== undefined ? <>{leadData?.Website} <a className="ml-2" href={leadData?.Website} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> : currentTab?.value === "Address Information" ? <div className="tab-panel">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title mb-2">Company Address</h3>
                                                        <p style={{ color: "gray", fontSize: "12px" }}>Double click on the text to edit it.</p>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="userprofile-ullist">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Address 1</div>
                                                                {
                                                                    editingFieldName === "Address" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Address"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Address")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Address", leadData?.Address)}> {!window.cn(leadData?.Address) && leadData?.Address !== null && leadData?.Address !== undefined ? leadData?.Address : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Address 2</div>
                                                                {
                                                                    editingFieldName === "Address_2" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Address Line 2"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Address_2")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Address_2", leadData?.Address_2)}> {!window.cn(leadData?.Address_2) && leadData?.Address_2 !== null && leadData?.Address_2 !== undefined ? leadData?.Address_2 : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Country</div>
                                                                {
                                                                    editingFieldName === "Country" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Country"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Country")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Country", leadData?.Country)}> {!window.cn(leadData?.Country) && leadData?.Country !== null && leadData?.Country !== undefined ? leadData?.Country : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">State</div>
                                                                {
                                                                    editingFieldName === "State" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter State"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("State")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("State", leadData?.State)}> {!window.cn(leadData?.State) && leadData?.State !== null && leadData?.State !== undefined ? leadData?.State : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">City</div>
                                                                {
                                                                    editingFieldName === "City" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter City"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("City")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("City", leadData?.City)}> {!window.cn(leadData?.City) && leadData?.City !== null && leadData?.City !== undefined ? leadData?.City : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Zip Code</div>
                                                                {
                                                                    editingFieldName === "Zip_Code" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Zip Code"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Zip_Code")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Zip_Code", leadData?.Zip_Code)}> {!window.cn(leadData?.Zip_Code) && leadData?.Zip_Code !== null && leadData?.Zip_Code !== undefined ? leadData?.Zip_Code : "-"}</div>
                                                                }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title mb-2">Personal Address</h3>
                                                        <p style={{ color: "gray", fontSize: "12px" }}>Double click on the text to edit it.</p>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="userprofile-ullist">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Address 1</div>
                                                                {
                                                                    editingFieldName === "Address_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Personal Address"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Address_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Address_Personal", leadData?.Address_Personal)}> {!window.cn(leadData?.Address_Personal) && leadData?.Address_Personal !== null && leadData?.Address_Personal !== undefined ? leadData?.Address_Personal : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Address 2</div>
                                                                {
                                                                    editingFieldName === "Address_2_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Personal Address Line 2"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Address_2_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Address_2_Personal", leadData?.Address_2_Personal)}> {!window.cn(leadData?.Address_2_Personal) && leadData?.Address_2_Personal !== null && leadData?.Address_2_Personal !== undefined ? leadData?.Address_2_Personal : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Country</div>
                                                                {
                                                                    editingFieldName === "Country_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Country"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Country_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Country_Personal", leadData?.Country_Personal)}> {!window.cn(leadData?.Country_Personal) && leadData?.Country_Personal !== null && leadData?.Country_Personal !== undefined ? leadData?.Country_Personal : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">State</div>
                                                                {
                                                                    editingFieldName === "State_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter State"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("State_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("State_Personal", leadData?.State_Personal)}> {!window.cn(leadData?.State_Personal) && leadData?.State_Personal !== null && leadData?.State_Personal !== undefined ? leadData?.State_Personal : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">City</div>
                                                                {
                                                                    editingFieldName === "City_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter City"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("City_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("City_Personal", leadData?.City_Personal)}> {!window.cn(leadData?.City_Personal) && leadData?.City_Personal !== null && leadData?.City_Personal !== undefined ? leadData?.City_Personal : "-"}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Zip Code</div>
                                                                {
                                                                    editingFieldName === "Zip_Code_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Zip Code"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Zip_Code_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Zip_Code_Personal", leadData?.Zip_Code_Personal)}> {!window.cn(leadData?.Zip_Code_Personal) && leadData?.Zip_Code_Personal !== null && leadData?.Zip_Code_Personal !== undefined ? leadData?.Zip_Code_Personal : "-"}</div>
                                                                }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> : currentTab?.value === "Social Media" ? <div className="tab-panel">
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title">Company Social Media</h3>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="userprofile-ullist">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Facebook</div>
                                                                    {
                                                                        editingFieldName === "Facebook" ?
                                                                            <>
                                                                                <InputText
                                                                                    value={editingFieldValue}
                                                                                    name="name"
                                                                                    autoComplete="off"
                                                                                    placeholder="Enter Facebook Link"
                                                                                    onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                    className="p-inputtext-sm"
                                                                                />
                                                                                <Button
                                                                                    className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                    onClick={() => onCloseEditingField()}
                                                                                    icon="pi pi-times"
                                                                                />
                                                                                <Button
                                                                                    className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                    onClick={() => onSaveEditingField("Facebook")}
                                                                                    icon="pi pi-check"
                                                                                />
                                                                            </>
                                                                            :
                                                                            <div className="userprofile-value" onDoubleClick={() => onEditingField("Facebook", leadData?.Facebook)}> {!window.cn(leadData?.Facebook) && leadData?.Facebook !== null && leadData?.Facebook !== undefined ? <>View <a className="ml-2" href={leadData?.Facebook} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                    }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Instagram</div>
                                                                {
                                                                    editingFieldName === "Instagram" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Instagram Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Instagram")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Instagram", leadData?.Instagram)}> {!window.cn(leadData?.Instagram) && leadData?.Instagram !== null && leadData?.Instagram !== undefined ? <>View <a className="ml-2" href={leadData?.Instagram} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Linked In</div>
                                                                {
                                                                    editingFieldName === "LinkedIn" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter LinkedIn Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("LinkedIn")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("LinkedIn", leadData?.LinkedIn)}>  {!window.cn(leadData?.LinkedIn) && leadData?.LinkedIn !== null && leadData?.LinkedIn !== undefined ? <>View <a className="ml-2" href={leadData?.LinkedIn} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Tik Tok</div>
                                                                {
                                                                    editingFieldName === "Tik_Tok" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Tik_Tok Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Tik_Tok")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Tik_Tok", leadData?.Tik_Tok)}>  {!window.cn(leadData?.Tik_Tok) && leadData?.Tik_Tok !== null && leadData?.Tik_Tok !== undefined ? <>View <a className="ml-2" href={leadData?.Tik_Tok} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Twitter</div>
                                                                {
                                                                    editingFieldName === "Twitter_URL" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Twitter Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Twitter_URL")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Twitter_URL", leadData?.Twitter_URL)}>  {!window.cn(leadData?.Twitter_URL) && leadData?.Twitter_URL !== null && leadData?.Twitter_URL !== undefined ? <>View <a className="ml-2" href={leadData?.Twitter_URL} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card">
                                                <div className="card-header">
                                                    <div className="card-title-box">
                                                        <h3 className="card-title">Personal Social Media</h3>
                                                    </div>
                                                </div>
                                                <div className="card-body">
                                                    <div className="userprofile-ullist">
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Facebook</div>
                                                                {
                                                                    editingFieldName === "Facebook_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Facebook Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Facebook_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Facebook_Personal", leadData?.Facebook_Personal)}>  {!window.cn(leadData?.Facebook_Personal) && leadData?.Facebook_Personal !== null && leadData?.Facebook_Personal !== undefined ? <>View <a className="ml-2" href={leadData?.Facebook_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Instagram</div>
                                                                {
                                                                    editingFieldName === "Instagram_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Instagram Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Instagram_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Instagram_Personal", leadData?.Instagram_Personal)}>  {!window.cn(leadData?.Instagram_Personal) && leadData?.Instagram_Personal !== null && leadData?.Instagram_Personal !== undefined ? <>View <a className="ml-2" href={leadData?.Instagram_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Linked In</div>
                                                                {
                                                                    editingFieldName === "LinkedIn_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Linked In Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("LinkedIn_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("LinkedIn_Personal", leadData?.LinkedIn_Personal)}>  {!window.cn(leadData?.LinkedIn_Personal) && leadData?.LinkedIn_Personal !== null && leadData?.LinkedIn_Personal !== undefined ? <>View <a className="ml-2" href={leadData?.LinkedIn_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Tik Tok</div>
                                                                {
                                                                    editingFieldName === "Tik_Tok_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Tik Tok Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Tik_Tok_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Tik_Tok_Personal", leadData?.Tik_Tok_Personal)}>  {!window.cn(leadData?.Tik_Tok_Personal) && leadData?.Tik_Tok_Personal !== null && leadData?.Tik_Tok_Personal !== undefined ? <>View <a className="ml-2" href={leadData?.Tik_Tok_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                        <div className="userprofile-list">
                                                            <div className="userprofile-label">Twitter</div>
                                                                {
                                                                    editingFieldName === "Twitter_Personal" ?
                                                                        <>
                                                                            <InputText
                                                                                value={editingFieldValue}
                                                                                name="name"
                                                                                autoComplete="off"
                                                                                placeholder="Enter Twitter Link"
                                                                                onChange={(e) => setEditingFieldValue(e.target.value)}
                                                                                className="p-inputtext-sm"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-danger ml-2'
                                                                                onClick={() => onCloseEditingField()}
                                                                                icon="pi pi-times"
                                                                            />
                                                                            <Button
                                                                                className='p-button-outlined p-button-rounded p-button-success ml-2'
                                                                                onClick={() => onSaveEditingField("Twitter_Personal")}
                                                                                icon="pi pi-check"
                                                                            />
                                                                        </>
                                                                        :
                                                                        <div className="userprofile-value" onDoubleClick={() => onEditingField("Twitter_Personal", leadData?.Twitter_Personal)}>  {!window.cn(leadData?.Twitter_Personal) && leadData?.Twitter_Personal !== null && leadData?.Twitter_Personal !== undefined ? <>View <a className="ml-2" href={leadData?.Twitter_Personal} target="_blank"><i className="pi pi-external-link" style={{ fontSize: '1rem' }}></i></a></> : <>-</>}</div>
                                                                }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> : ""}
                                    </div>
                                    <div className="col-4">
                                        <div className="card">
                                            <div className="card-header">
                                                <div className="card-title-box">
                                                    <h3 className="card-title">Lead Conversion Status</h3>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="userprofile-ullist">
                                                    <div className="userprofile-list">
                                                        <div className="userprofile-label">Assignd Broker</div>
                                                        <div className="userprofile-value">-</div>
                                                    </div>
                                                    {/* <div className="userprofile-list">
                                                    <div className="userprofile-label">Last Contact</div>
                                                    <div className="userprofile-value">-</div>
                                                </div> */}
                                                    <div className="userprofile-list">
                                                        <div className="userprofile-label">Lead Stage</div>
                                                        <div className="userprofile-value">{!window.cn(leadData?.Lead_Stage) && leadData?.Lead_Stage !== null && leadData?.Lead_Stage !== undefined ? leadData?.Lead_Stage : <>-</>}</div>
                                                    </div>
                                                    {/* <div className="userprofile-list">
                                                    <div className="userprofile-label">Lead Status</div>
                                                    <div className="userprofile-value"><span className="badge badge-info">Not Contacted</span></div>
                                                </div> */}
                                                    <div className="userprofile-list">
                                                        <div className="userprofile-label">Rating</div>
                                                        <div className="userprofile-value">{!window.cn(leadData?.Rating) && leadData?.Rating !== null && leadData?.Rating !== undefined ? leadData?.Rating : <>-</>}</div>
                                                    </div>
                                                    <div className="userprofile-list">
                                                        <div className="userprofile-label">Investment Amount</div>
                                                        <div className="userprofile-value">{!window.cn(leadData?.Investment_Amount) && leadData?.Investment_Amount !== null && leadData?.Investment_Amount !== undefined ? "$" + leadData?.Investment_Amount : <>-</>}</div>
                                                    </div>
                                                    <div className="userprofile-list">
                                                        <div className="userprofile-label">Lead Source</div>
                                                        <div className="userprofile-value">{!window.cn(leadData?.Lead_Source) && leadData?.Lead_Source !== null && leadData?.Lead_Source !== undefined ? leadData?.Lead_Source : <>-</>}</div>
                                                    </div>
                                                    <div className="userprofile-list">
                                                        <div className="userprofile-label">Conversion Stratagy</div>
                                                        <div className="userprofile-value">{!window.cn(leadData?.Conversion_Strategy) && leadData?.Conversion_Strategy !== null && leadData?.Conversion_Strategy !== undefined ? leadData?.Conversion_Strategy : <>-</>}</div>
                                                    </div>
                                                    <div className="userprofile-list">
                                                        <div className="userprofile-label">Lead Status</div>
                                                        <div className="userprofile-value">{!window.cn(leadData?.Lead_Status) && leadData?.Lead_Status !== null && leadData?.Lead_Status !== undefined ? leadData?.Lead_Status : <>-</>}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                    :
                    <></>
            }

            {/* Loader Start */}
            {
                pageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    )
}
