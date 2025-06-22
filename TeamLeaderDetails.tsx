import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';
import { Link } from 'react-router-dom';

export const TeamLeaderDetails = () => {
    document.title = "Team Leader Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/team-leaders">Team Leader Lists</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Team Leader Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    const [globalFilter, setGlobalFilter] = useState<any>(null);

    const pageService = new PageService();
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    const [pageLoad, setPageLoad] = useState(false);
    const [teamLeaderId, setTeamLeaderId] = useState<any>();
    const [teamLeaderData, setTeamLeaderData] = useState<any>({});

    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setTeamLeaderId(state);
            getTeamLeaderDetailsFromAPI(state);
        }
    }, []);

    // Get Team Leader Details
    const getTeamLeaderDetailsFromAPI = async (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getSingleClientDetails(state.teamleader_id)
            .then((response) => {
                // Get response
                if (response) {
                    const responseData = response;
                    setTeamLeaderData(responseData);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                    setTeamLeaderData({});
                }
            });
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> Team Leader Details {!window.cn(teamLeaderData) && teamLeaderData?.status == 0 ? <><Badge value="Pending" severity="warning"></Badge></> : teamLeaderData?.status == 1 ? <><Badge value="Active" severity="success"></Badge></> : <><Badge value="Access Revoked" severity="danger"></Badge></>}</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                        <div className="page-header-search">

                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body">
                    <div className="field col">
                        <div className="grid">
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Full Name</div>
                                    <div className="viewcard-text">{!window.cn(teamLeaderData) ? teamLeaderData?.first_name + " " + teamLeaderData?.last_name : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Email</div>
                                    <div className="viewcard-text">{!window.cn(teamLeaderData) ? teamLeaderData?.email : ""}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Mobile No.</div>
                                    <div className="viewcard-text">{!window.cn(teamLeaderData) ? "+" + teamLeaderData?.country?.phonecode + " " + teamLeaderData?.mobile : ""}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Loader Start */}
            {
                pageLoad && <Loader />
            }
            {/* Loader End */}
        </>
    )
}