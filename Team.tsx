import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

//Prime React Component Inbuilt
import { OrganizationChart } from 'primereact/organizationchart';

//Services
import PageService from '../../../service/PageService';

export const Team = () => {
    document.title = "Team | Venture Studio"

    //Navigate Another Route
    const navigate = useNavigate();
    const location = useLocation();

    const [data, setData] = useState<any>([
        {
            expanded: true,
            type: 'person',
            className: 'bg-indigo-500 text-white border-round-2xl',
            style: { borderRadius: '12px' },
            data: {
                image: 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png',
                name: 'Amy Elsner',
                title: 'CEO'
            },
            children: [
                {
                    expanded: true,
                    type: 'person',
                    className: 'bg-purple-500 text-white border-round-2xl',
                    style: { borderRadius: '12px' },
                    data: {
                        image: 'https://primefaces.org/cdn/primereact/images/avatar/annafali.png',
                        name: 'Anna Fali',
                        title: 'CMO'
                    },
                    children: [
                        {
                            label: 'Sales',
                            className: 'bg-purple-500 text-white border-round-2xl',
                            style: { borderRadius: '12px' }
                        },
                        {
                            label: 'Marketing',
                            className: 'bg-purple-500 text-white border-round-2xl',
                            style: { borderRadius: '12px' }
                        }
                    ]
                },
                {
                    expanded: true,
                    type: 'person',
                    className: 'bg-teal-500 text-white border-round-2xl',
                    style: { borderRadius: '12px' },
                    data: {
                        image: 'https://primefaces.org/cdn/primereact/images/avatar/stephenshaw.png',
                        name: 'Stephen Shaw',
                        title: 'CTO'
                    },
                    children: [
                        {
                            label: 'Development',
                            className: 'bg-teal-500 text-white border-round-2xl',
                            style: { borderRadius: '12px' }
                        },
                        {
                            label: 'UI/UX Design',
                            className: 'bg-teal-500 text-white border-round-2xl',
                            style: { borderRadius: '12px' }
                        }
                    ]
                }
            ]
        }
    ]);

    const nodeTemplate = (node: any) => {
        if (node.type === 'person') {
            return (
                <div className="flex flex-column">
                    <div className="flex flex-column align-items-center">
                        <img alt={node.data.name} src={node.data.image} className="mb-3 w-3rem h-3rem" />
                        <span className="font-bold mb-2">{node.data.name}</span>
                        <span>{node.data.title}</span>
                    </div>
                </div>
            );
        }

        return node.label;
    };

    useEffect(() => {
        
    }, []);

    return (
        <>
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card overflow-x-auto">
                        <div className='main-header'>
                            <h3>Team</h3>
                        </div>

                        <OrganizationChart value={data} nodeTemplate={nodeTemplate} />
                    </div>
                </div>
            </div>
        </>
    )
};