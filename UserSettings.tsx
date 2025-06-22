import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';

//Services
import PageService from '../../service/PageService';

import { profileImageValidate } from '../../config/Validate';
import { chooseOptions, emptyTemplate, headerTemplate } from '../../components/ImageUploadComponent/ImageUploadSetting';

export const UserSettings = () => {
    document.title = "Settings | Venture Studio"

    //Navigate Another Route
    const navigate = useNavigate();

    //Set Toast/ Filter Properties
    const toast = useRef<any>(null);
    const hasFetchedData = useRef(false);

    // Page service
    const pageService = new PageService();

    // File Upload Details
    const fileUploadRef = useRef(null);
    const removeFile = useRef(null);

    const [errors, setErrors] = useState<any>({});
    const [profileImg, setProfileImg] = useState<any>("");
    const [updateProfileImg, setUpdateProfileImg] = useState<any>("");
    const [profileImgLoading, setProfileImgLoading] = useState<boolean>(false);
    const [updateProfileImgModal, setUpdateProfileImgModal] = useState<boolean>(false);

    // use effect method
    useEffect(() => {
        if (hasFetchedData.current) return;
        hasFetchedData.current = true;

        setProfileImg(localStorage.getItem("profile_img"));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // for remove company logo
    const onTemplateRemoveCompanyLogo = (callback: any) => {
        setUpdateProfileImg({});
        callback();
    };

    // for upload profile image
    const itemProfileImageTemplate = (file: any, props: any) => {
        setUpdateProfileImg(file);
        removeFile.current = props.onRemove;
        return (
            <>
                <div className="flex align-items-center flex-wrap">
                    <div className="flex align-items-center" style={{ width: '40%' }}>
                        <img
                            alt={file.name}
                            role="presentation"
                            src={file.objectURL}
                            width={100}
                        />
                        <div className="flex" style={{ alignItems: "center" }}>
                            <span className="mr-3">{file.name}</span>
                            <Button
                                type="button"
                                icon="pi pi-times"
                                className="p-button-outlined p-button-rounded p-button-danger ml-auto"
                                onClick={() => onTemplateRemoveCompanyLogo(props.onRemove)}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    // Hide update profile image modal
    const hideUpdateProfileImgModal = () => {
        setUpdateProfileImg("");
        setUpdateProfileImgModal(false);
        setProfileImgLoading(false);
    };

    // Update profile image api call
    const updateProfileImageApiCall = () => {
        const { errors, isError } = profileImageValidate(updateProfileImg);
        setErrors(errors);

        if (!isError) {
            setProfileImgLoading(true);

            // request data
            let formData = new FormData();
            formData.append('profile_img', updateProfileImg);

            // call api
            pageService.updateProfileImg(formData).then((response) => {
                // Get response
                if (response) {
                    setProfileImgLoading(false);
                    setUpdateProfileImgModal(false);
                    localStorage.setItem("profile_img", response.url);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Success',
                        detail: response.message,
                    });
                    window.location.reload();
                } else {
                    setProfileImgLoading(false);
                    setUpdateProfileImgModal(true);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong, Please try again.',
                    });
                }
            });
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-12 md:col-3 col-offset-4">
                    <div className="card">
                        <div className="card-profile">
                            <div className="user-detail-content">
                                <div className="user-profile-img">
                                    {profileImg == "" || profileImg == null || profileImg == "null" ?
                                        <img className="user-image" src="/assets/images/avatar.jpg" alt="Profile Image" onClick={() => setUpdateProfileImgModal(true)} />
                                        :
                                        <img className="user-image" src={profileImg} alt="Profile Image" onClick={() => setUpdateProfileImgModal(true)} />
                                    }
                                    <div className="user-profile-edit" onClick={() => setUpdateProfileImgModal(true)}><i className="pi pi-camera"></i></div>
                                </div>
                                <div className="user-name">{localStorage.getItem("full_name")}</div>
                            </div>
                            <Toast ref={toast} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Profile Image Dialog */}
            <Dialog
                visible={updateProfileImgModal}
                style={{ width: '450px' }}
                className="p-fluid"
                header="Update Profile Image"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            className="p-button-secondary"
                            onClick={hideUpdateProfileImgModal}
                        />
                        <Button
                            label="Submit"
                            className="p-button-primary"
                            onClick={() => updateProfileImageApiCall()}
                            loading={profileImgLoading}
                        />
                    </>
                }
                onHide={hideUpdateProfileImgModal}
            >
                <div className="formgrid grid">
                    <div className="field col-6">
                        <label htmlFor="profile_img">Profile Image <span style={{ color: "red" }}>*</span></label>
                        <FileUpload
                            ref={fileUploadRef}
                            accept="image/*"
                            name="profile_img[]"
                            className="imageupload"
                            chooseOptions={chooseOptions}
                            emptyTemplate={emptyTemplate}
                            headerTemplate={headerTemplate}
                            itemTemplate={itemProfileImageTemplate}
                        ></FileUpload>
                        <small className="p-invalid-txt">{errors['profile_img']}</small>
                    </div>
                </div>
            </Dialog>
        </>
    )
};