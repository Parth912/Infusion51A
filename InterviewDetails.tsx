import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

//Prime React Component Inbuilt
import { Timeline } from "primereact/timeline";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { BreadCrumb } from 'primereact/breadcrumb';
import { Calendar } from "primereact/calendar";
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import { Rating } from "primereact/rating";


// Main function
export const InterviewDetails = () => {

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/interview">Interview</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Interview Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    // Static Data
    const InterviewData = [
        { sr_no: 1, full_name: 'xyz', job_role: 'Software Engineer', mobile: '123-456-7890' },
        { sr_no: 2, full_name: 'abc', job_role: 'Dev Ops', mobile: '9999999999' },
        { sr_no: 3, full_name: 'pqr', job_role: 'Data Engineer', mobile: '7854368247' },
    ];

    // Static Data for Applicant Notes
    const NoteData = [
        { name: 'Raj', note: 'Please prepare for technical questions on system design.' },
        { name: 'Parth', note: 'Focus on problem-solving skills and algorithms.' },
    ];

    // Static Data for Interview Timeline
    const interviewStages = [
        { stage: 1, name: 'Stage 1', date: '25/02/2025 10:00', interviewer_name: 'Parth' },
        { stage: 2, name: 'Stage 2', date: '27/02/2025 14:00', interviewer_name: 'Raj' },
        { stage: 3, name: 'Stage 3', date: '01/03/2025 16:15', interviewer_name: 'Parth' },
        { stage: 4, name: 'Stage 4', date: '05/03/2025 10:00', interviewer_name: 'Raj' }
    ];

    // Static Data for Drop-Down Menu
    const interviewers = [
        { label: 'Raj', value: 'Raj' },
        { label: 'Parth', value: 'Parth' }
    ];

    // Define sr_no as numbers
    interface InterviewState {
        sr_no: number;
    }

    // Static Data for Rating
    const ratingCategories = [
        { label: "Communication", value: 0 },
        { label: "Technical", value: 0 },
        { label: "Logical", value: 0 },
        { label: "Teamwork", value: 0 },
        { label: "Leadership", value: 0 }
    ];

    // Setting Value For Rating 
    const [ratings, setRatings] = useState<{ [key: string]: number }>({
        Communication: 0,
        Technical: 0,
        Logical: 0,
        Teamwork: 0,
        Leadership: 0
    });


    // Page Load 
    const location = useLocation();
    const [interviewData, setInterviewData] = useState<any>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSrNo, setSelectedSrNo] = useState<number | null>(null);
    const [selectedInterviewer, setSelectedInterviewer] = useState<string | null>(null);
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [newNote, setNewNote] = useState<string>('');


    // getting row data 
    useEffect(() => {
        const state = location.state as InterviewState;

        if (state?.sr_no) {
            const selectedInterview = InterviewData.find(interview => interview.sr_no === state.sr_no);
            setInterviewData(selectedInterview);
        }

    }, []);

    // Open the model for scheduling an interview
    const addNewModel = (sr_no: number) => {
        setSelectedSrNo(sr_no);
        setShowDialog(true);
        setSelectedInterviewer(null);
        setSelectedDate(null);
    }

    // On Submit, Print in console and close the button
    const onSubmit = () => {
        if (showDialog) {
            console.log("Scheduled Interview Details:", {
                Date: selectedDate,
                Interviewer: selectedInterviewer
            });
            setShowDialog(false);
        } else if (showNoteDialog) {
            console.log("New Note Added:", {
                Note: newNote
            });
            setShowNoteDialog(false);
            setNewNote('');
        }
    };



    // Date And Rating handle
    const handleChange = (field: string, value: any) => {
        if (field === "selectedDate") {
            setSelectedDate(value as Date | null);
        } else {
            setRatings(prevRatings => ({
                ...prevRatings,
                [field]: value ?? 0
            }));
        }
    };


    // Custom marker for timeline 
    const customizedMarker = (item: any) => {
        return (
            <div className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
                style={{ backgroundColor: '#673AB7', fontSize: '1.2rem' }}
            >
                {item.stage}
            </div>
        );
    };

    // Custom content inside the timeline card
    const customizedContent = (item: any) => {
        return (
            <Card title={item.name} subTitle={item.date} >
                <p><strong>Interviewer:</strong> {item.interviewer_name}</p>
                <Button label="Schedule An Interview" onClick={() => addNewModel(interviewData?.sr_no)} />
            </Card>
        );
    };

    // Custom content inside the Note card
    const TaskNoteContent = (item: any) => {
        return (
            <Card title={item.name}>
                <p><strong>Note:</strong> {item.note}</p>
            </Card>
        );
    };
    // This is my rating card
    const RatingCard = () => {
        return (
            <Card title="Rate the Candidate">
                {ratingCategories.map((category, index) => (
                    <div key={index} className="p-mb-3" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ marginRight: "10px", minWidth: "150px" }}>
                            <strong>{category.label}:</strong>
                        </p>
                        <Rating
                            value={ratings[category.label]}
                            cancel={false}
                            onChange={(e) => handleChange(category.label, e.value)}
                        />
                    </div>
                ))}
                <Button label="Submit Ratings" className="p-mt-3" onClick={() => console.log("Ratings:", ratings)} />
            </Card>
        );
    };


    return (
        <>
            <div className="page-leftheader">
                <div className="page-header-info">
                    <div className="main-content-breadcrumb">
                        <BreadCrumb model={items} home={home} />
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <h2>Interview Details</h2>
                    {interviewData ? (
                        <div>
                            <p><strong>Full Name:</strong> {interviewData.full_name}</p>
                            <p><strong>Job Role:</strong> {interviewData.job_role}</p>
                            <p><strong>Mobile:</strong> {interviewData.mobile}</p>
                        </div>
                    ) : (
                        <p>No Interview Listed</p>
                    )}
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <h3> Interview Process Timeline</h3>
                    <Timeline
                        value={interviewStages}
                        align="alternate"
                        className="customized-timeline"
                        marker={customizedMarker}
                        content={customizedContent} />
                </div>
            </div>
            <Dialog header="Schedule an Interview" visible={showDialog} style={{ width: '30vw' }} onHide={() => setShowDialog(false)}>

                <div>
                    <p>Schedule an interview for Sr. No: {selectedSrNo}</p>

                    <Calendar
                        id="calendar-24h"
                        value={selectedDate}
                        onChange={(e) => handleChange("selectedDate", e.value)}
                        showTime
                        hourFormat="24"
                    />

                    <Dropdown
                        value={selectedInterviewer}
                        options={interviewers}
                        onChange={(e) => setSelectedInterviewer(e.value)}
                        placeholder="Select Interviewer"
                        className="p-mt-3"
                    />
                    <Button label="Submit" className="p-mt-3" onClick={onSubmit} />
                    <Button label="Close" className="p-mt-3 ml-4" onClick={() => setShowDialog(false)} />
                </div>
            </Dialog>
            <div className="card">
                <div className="card-body">
                    <h3> Notes</h3>
                    <div className="card-body">
                        {NoteData.map((note, index) => (
                            <TaskNoteContent key={index} {...note} />
                        ))}
                        <Button label="Add New Note" className="p-mt-3" onClick={() => setShowNoteDialog(true)} />
                    </div>
                </div>
            </div>

            <Dialog header="Add a New Note" visible={showNoteDialog} style={{ width: '30vw' }} onHide={() => setShowNoteDialog(false)}>

                <div>
                    <p className="p-mt-3">Enter your note:</p>
                    <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="p-inputtext p-component"
                        placeholder="Write a note..."
                    />

                    <Button label="Submit" className="p-mt-3" onClick={onSubmit} />
                    <Button label="Close" className="p-mt-3 ml-4" onClick={() => setShowNoteDialog(false)} />
                </div>
            </Dialog>
            <div className="card">
                <div className="card-body">
                    <h3> Candidate Ratings</h3>
                    <div className="card-body">
                        <RatingCard />
                    </div>
                </div>
            </div>
        </>
    );
};
