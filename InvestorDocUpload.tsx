import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';

//Services
import PageService from '../../../service/PageService';
import { Loader } from '../../../components/Loader/Loader';

export const InvestorDocUpload = () => {
    document.title = 'Investor Document Upload | Venture Studio';

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Investor Document Upload</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    // Page Service
    const pageService = new PageService();

    //Navigate Another Route
    const navigate = useNavigate();

    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [convertingDocuments, setConvertingDocuments] = useState<any>([]);

    // useEffect
    useEffect(() => {

    }, []);

    return(
        <>
            <Toast ref={toast} />
            <div className="page-header">
                <div className="page-leftheader">
                    <div className="page-header-info">
                        <div className="page-title">Investor Document Upload</div>
                        <div className="main-content-breadcrumb">
                            <BreadCrumb model={items} home={home} />
                        </div>
                    </div>
                </div>
                <div className="page-rightheader">
                    <div className="btn-icon-list">
                    </div>
                </div>
            </div>
        </>
    )
};