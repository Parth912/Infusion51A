import React, { useState, useRef, useEffect } from 'react';

//Services
import PageService from '../service/PageService';

//Buffer
import { Buffer } from "buffer";

//Prime React Component Inbuilt
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

//Validatetion
import { ChangePasswordFormValidate } from '../config/Validate';

export const ChangePassword = () => {
    document.title = "Change Password";

    //Blog Crud Object
    const [changePasswordData, setChangePasswordData] = useState<any>({})

    //Loading/Page Loading
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

    //Other Related Properties
    const [errors, setErrors] = useState<any>({});

    //Set Toast/File Properties
    const toast = useRef<any>(null);

    useEffect(() => {
        //Get Params Id Exist or not
        if (!localStorage.hasOwnProperty("token")) {
            window.location.href = "/";
        }
    }, []);


    //onChange Input
    const onInputChange = (e: any, name: string) => {
        const val = (e.target && e.target.value) || '';
        setChangePasswordData({ ...changePasswordData, [name]: val })
    }

    const onSubmit = async () => {
        const { errors, isError } = ChangePasswordFormValidate(changePasswordData)
        setErrors(errors);

        //Check Error if no errords then call API
        if (!isError) {
            setSubmitLoading(true);

            //Get Change Password Data
            const { old_password, password, confirm_password } = changePasswordData;

            //Request object
            const formRequestData = {
                old_password: Buffer.from(old_password).toString("base64"),
                password: Buffer.from(password).toString("base64"),
                confirm_password: Buffer.from(confirm_password).toString("base64"),
            }

            //API Call Using Service
            const pageService = new PageService();
            pageService.changePassword(formRequestData).then(result => {
                // Work here with the result
                clearAllInput();
                setSubmitLoading(false);
                toast.current?.show({ severity: 'success', summary: 'Success', detail: result?.message });
            }).catch(error => {
                // Error Handling here
                if (error) {
                    //Spinner False and Set Toast
                    setSubmitLoading(false);
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: error.response.data.message });
                }
            })
        }
    }

    //Clear All Input
    const clearAllInput = () => {
        setChangePasswordData({ "old_password": "", "password": "", "confirm_password": "" });
        setErrors({});
    }

    return (

        <>
            <div className="col-12">
                <h4> Change Password </h4>
                <Toast ref={toast} />
                <div className="card">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Old Password</label>
                            <Password value={changePasswordData.old_password} name="old_password" autoFocus autoComplete='off' onChange={(e) => onInputChange(e, 'old_password')} feedback={false} toggleMask className={errors["old_password"] && "p-invalid"} />
                            <small className="p-invalid-txt">{errors["old_password"]}</small>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">New Password</label>
                            <Password value={changePasswordData.password} name="password" autoFocus autoComplete='off' onChange={(e) => onInputChange(e, 'password')} feedback={false} toggleMask className={errors["password"] && "p-invalid"} />
                            <small className="p-invalid-txt">{errors["password"]}</small>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="name">Confirm Password</label>
                            <Password value={changePasswordData.confirm_password} name="confirm_password" autoComplete='off' onChange={(e) => onInputChange(e, 'confirm_password')} feedback={false} toggleMask className={errors["confirm_password"] && "p-invalid"} />
                            <small className="p-invalid-txt">{errors["confirm_password"]}</small>
                        </div>

                        <div className="card-footer">
                            <div className="button-group">
                                <Button label="Cancel" icon="pi pi-times" className="p-button-secondary mr-4" />
                                <Button label="Save" icon="pi pi-check" loading={submitLoading} onClick={onSubmit} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

