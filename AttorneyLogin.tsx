import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Component Inbuilt
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

//Services
import axiosInstance from '../../../config/axiosInstance';
import { AttorneyLoginValidate, OTPValidate } from '../../../config/Validate';
import { ATTORNEY_LOGIN, OTP_VERIFY } from '../../../config/ApiConstant';

export const AttorneyLogin = () => {
    document.title = 'Attorney Login | Venture Studio';

    const navigate = useNavigate();
    const toast = useRef<any>(null);

    const [errors, setErrors] = useState<any>({});
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [mobile, setMobile] = useState<any>("");
    const [otp, setOtp] = useState<any>("");
    const [isOtpOpen, setIsOtpOpen] = useState<boolean>(false);
    const [attorneyData, setAttorneyData] = useState<any>({});

    const onSubmit = async () => {
        const { errors, isError } = AttorneyLoginValidate(mobile);
        setErrors(errors);

        if (!isError) {
            setButtonLoading(true);
            
            let formData: any = new FormData();
            formData.append('mobile', mobile);

            //API Call
            try {
                const response = await axiosInstance.post(ATTORNEY_LOGIN, formData);
                setIsOtpOpen(true);
                setButtonLoading(false);
                setAttorneyData(response?.data?.data);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response?.data?.message,
                });
            } catch (error: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: 'Entered mobile number is incorrect.',
                });
                setButtonLoading(false);
            }
        }
    };

    const onOtpSubmit = async () => {
        const { errors, isError } = OTPValidate(otp);
        setErrors(errors);

        if (!isError) {
            setButtonLoading(true);

            let formData: any = new FormData();
            formData.append('otp', otp);
            formData.append('mobile', mobile);

            //API Call
            try {
                const response = await axiosInstance.post(OTP_VERIFY, formData);
                setButtonLoading(false);
                localStorage.setItem("attorney_data", JSON.stringify(attorneyData));
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response?.data?.message,
                });
                setTimeout(() => {
                    navigate("/attorney/docs");
                }, 1500);
            } catch (error: any) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Message',
                    detail: 'Entered OTP is incorrect.',
                });
                setButtonLoading(false);
            }
        }
    };

    // Go back to login
    const goBackToLogin = () => {
        setMobile("");
        setOtp("");
        setIsOtpOpen(false);
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="login-body flex">
                <div className="login-form-shapes">
                    <img className="login-form-shapes-bg login-form-shapes-bg-1 login-anim-shape1" src="/assets/images/icon/login-svg-shape1.svg" alt="Login Element" />
                    <img className="login-form-shapes-bg login-form-shapes-bg-2 login-anim-shape2" src="/assets/images/icon/login-svg-shape2.svg" alt="Login Element" />
                    <img className="login-form-shapes-bg login-form-shapes-bg-3 login-anim-shape3" src="/assets/images/icon/login-svg-shape3.svg" alt="Login Element" />
                    <img className="login-form-shapes-bg login-form-shapes-bg-4 login-anim-shape4" src="/assets/images/icon/login-svg-shape4.svg" alt="Login Element" />
                    <img className="login-form-shapes-bg login-form-shapes-bg-5 login-anim-shape5" src="/assets/images/icon/login-svg-shape5.svg" alt="Login Element" />
                </div>
                <div className="login-panel w-full">
                    <div className="p-fluid min-h-screen bg-auto md:bg-contain bg-no-repeat text-center w-full flex align-items-center md:align-items-center justify-content-center flex-column bg-auto md:bg-contain bg-no-repeat">
                        <Toast ref={toast} />
                        <div className="login-wrapper">
                            <div className="logo-container">
                                <img className="login-logo" src="/assets/images/logo-wh.png" alt="login-logo" />
                            </div>
                            <div className="login-form">
                                <div className="field">
                                    {
                                        isOtpOpen === false ?
                                            <>
                                                <label className="form-label">Mobile Number</label>
                                                <InputText value={mobile} name="mobile" autoComplete="off" placeholder="Enter Mobile Number" onChange={(e) => setMobile(e.target.value)} className={errors['mobile'] && 'p-invalid'} />
                                                <small className="p-invalid-txt d-flex">{errors['mobile']}</small>
                                            </>
                                        :
                                            <>
                                                <label className="form-label">OTP</label>
                                                <InputText value={otp} name="otp" autoComplete="off" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} className={errors['otp'] && 'p-invalid'} />
                                                <small className="p-invalid-txt d-flex">{errors['otp']}</small>
                                                <a href="#" onClick={() => goBackToLogin()} className='forgot-text'>Go Back To Login Page</a>
                                            </>
                                    }
                                    
                                </div>
                                <div className="button-container">
                                    <Button type="button" label={isOtpOpen === false ? "Submit" : "Login"} loading={buttonLoading} onClick={isOtpOpen === false ? onSubmit : onOtpSubmit} className="p-button-info"></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}