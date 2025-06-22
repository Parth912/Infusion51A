import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';

export const CampaignDetails = () => {
    document.title = "Campaign Details | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Campaigns</span>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Campaign Details</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' };

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    // Page service
    const pageService = new PageService();

    const hasFetchedData = useRef(false);

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [campaignId, setCampaignId] = useState<any>(null);
    const [campaignDetails, setCampaignDetails] = useState<any>({});

    // useEffect
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        if (location.state) {
            const state = location.state;
            setCampaignId(state);
            getInstantlyCampaignDetailsFromAPI(state);
        }
    }, []);

    const getInstantlyCampaignDetailsFromAPI = (state: any) => {
        setPageLoad(true);
        // Api call
        pageService
            .getCampaignDetails(state.campaign_id)
            .then((response) => {
                // Get response
                if (response) {
                    setCampaignDetails(response);
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                }
            });
    };
    
    return(
        <>
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title"><Button icon="pi pi-arrow-left" className="link-prev-btn" onClick={() => navigate(-1)} /> {!window.cn(campaignDetails) && campaignDetails?.summary !== undefined ? <>{campaignDetails?.summary?.campaign_name}{!window.cn(campaignDetails?.status) && campaignDetails?.status?.status == "active" ? <Badge value="Active" severity='success'></Badge> : <Badge value="Paused" severity='warning'></Badge>}</> : ""}</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
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
                                    <div className="viewcard-title">Total leads</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) && campaignDetails?.summary !== undefined ? campaignDetails?.summary?.total_leads : "0"}</div>
                                </div>
                            </div>
                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Bounced leads</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) && campaignDetails?.summary !== undefined ? campaignDetails?.summary?.bounced : "0"}</div>
                                </div>
                            </div>

                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Emails Sent</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) && campaignDetails?.count !== undefined && campaignDetails?.count.length ? campaignDetails?.count[0]?.emails_sent : "0"}</div>
                                </div>
                            </div>

                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Emails Read</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) && campaignDetails?.count !== undefined && campaignDetails?.count.length > 0 ? campaignDetails?.count[0]?.emails_read : "0"}</div>
                                </div>
                            </div>

                            <div className="field col-4 flex flex-column">
                                <div className="viewcard-box">
                                    <div className="viewcard-title">Leads Who Replied</div>
                                    <div className="viewcard-text">{!window.cn(campaignDetails) &&campaignDetails?.count !== undefined && campaignDetails?.count.length > 0 ? campaignDetails?.count[0]?.leads_replied : "0"}</div>
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