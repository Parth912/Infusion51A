import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BreadCrumb } from 'primereact/breadcrumb';

//Prime React Component Inbuilt
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

//Services
import PageService from '../../../service/PageService';
import { Badge } from 'primereact/badge';
import { kanbanColumns } from '../../../appconfig/Settings';
import { Loader } from '../../../components/Loader/Loader';

export const KanbanViewLeads = () => {
    document.title = "Kanban View Leads  | Venture Studio"

    //BreadCrumb
    const items = [
        {
            label: 'InputText',
            template: () => <Link className="p-breadcrumb-item" to="/investors">Investors</Link>
        },
        {
            label: 'InputText',
            template: () => <span className="p-breadcrumb-item active">Kanban View Leads</span>
        }
    ];
    const home = { icon: 'pi pi-home', url: '/dashboard' }

    //Navigate Another Route
    const navigate = useNavigate();

    const hasFetchedData = useRef(false);
    const toast = useRef<any>(null);

    // Page service
    const pageService = new PageService();

    const [pageLoad, setPageLoad] = useState<boolean>(false);
    const [kanbanCards, setKanbanCards] = useState<any>([]);
    const [dragedElement, setDragedElement] = useState<any>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const kanbanWrapperRef = useRef<HTMLDivElement>(null);

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        getKanbanViewLeadsFromAPI();
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("dragover", handleDragMove);
        } else {
            window.removeEventListener("dragover", handleDragMove);
        }

        return () => {
            window.removeEventListener("dragover", handleDragMove);
        };
    }, [isDragging]);


    // Get kanban view leads from api
    const getKanbanViewLeadsFromAPI = () => {
        setPageLoad(true);

        // api call
        pageService
            .kanbanLeadsData("personal_broker")
            .then((response) => {
                // Get response
                if (response) {
                    const DataList = response;
                    if (DataList.length == 0) {
                        setKanbanCards([]);
                    } else {
                        setKanbanCards(DataList);
                    }
                    setPageLoad(false);
                } else {
                    setPageLoad(false);
                    setKanbanCards([]);
                }
            });
    };

    // Scroll when card is being dragged towards the edge
    const handleDragMove = (e: DragEvent) => {
        if (!kanbanWrapperRef.current || !isDragging) return;

        const { clientX } = e;
        const wrapper = kanbanWrapperRef.current;
        const { left, right } = wrapper.getBoundingClientRect();

        const scrollSpeed = 10; // Adjust speed as needed

        // Scroll left when near the left edge
        if (clientX < left + 50) {
            wrapper.scrollBy({ left: -scrollSpeed });
        }

        // Scroll right when near the right edge
        if (clientX > right - 50) {
            wrapper.scrollBy({ left: scrollSpeed });
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // On drag card
    const onDragCard = (card_id: any, column_id: any) => {
        setDragedElement({
            dragged_card_id: card_id,
            dragged_column_id: column_id
        });
    };

    // On drop card
    const onDropCard = (column_id: any) => {
        if (dragedElement?.dragged_card_id) {
            setKanbanCards([
                ...kanbanCards.map((item: any) => {
                    if (dragedElement?.dragged_card_id == item.id) {
                        item.column_id = column_id;

                        // Api call to change lead stage in zoho
                        let formData = new FormData();
                        formData.append('id', item.id);
                        formData.append('lead_stage', item.column_id);

                        pageService.kanbanLeadStageChange(formData).then((response) => {
                            // Get response
                            if (response) {
                                toast.current?.show({
                                    severity: 'success',
                                    summary: 'Success',
                                    detail: response.message,
                                });
                            }
                        });
                    }
                    return item;
                }),
            ]);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <div className='main-header'>
                                <h3><Button
                                    icon="pi pi-arrow-left"
                                    className="p-button-secondary mr-2"
                                    onClick={() => navigate(-1)}
                                /> Kanban View Leads</h3>
                            </div>

                            <div className="kanban-wrapper" ref={kanbanWrapperRef}>
                                {
                                    kanbanColumns.map((item: any, index: any) => {
                                        return (
                                            <>
                                                <div key={item.id} className='kanban-card'>
                                                    <div className="kanban-head">
                                                        <div className="kanban-head-area">
                                                            <div className="kanban-head-title">{item.text}</div>
                                                            {/* <div className="kanban-head-text">$1,23,456.98</div> */}
                                                        </div>
                                                        <div className="kanban-head-tools">
                                                            <Badge className="p-badge p-badge-help" value={kanbanCards.length}></Badge>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="kanban-body"
                                                        onDragOver={(e) => {
                                                            e.preventDefault();
                                                        }}
                                                        onDrop={() => onDropCard(item.id)}
                                                    >
                                                        {
                                                            kanbanCards.map((card_item: any, card_index: any) => {
                                                                return (
                                                                    <>
                                                                        {
                                                                            item.id === card_item.column_id && (
                                                                                <div
                                                                                    className='kanban-task-card'
                                                                                    draggable
                                                                                    onDragStart={handleDragStart}
                                                                                    onDragEnd={handleDragEnd}
                                                                                    onDrag={() => onDragCard(card_item.id, card_item.column_id)}
                                                                                >
                                                                                    <div className="kanban-task-title">{card_item.full_name}</div>
                                                                                    <div className="kanban-task-text">{card_item.email}</div>
                                                                                    <div className="kanban-task-text">{card_item.phone}</div>
                                                                                    {/* <div className="kanban-task-status status-warning">Contact in Future</div> */}
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    })
                                }
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
};