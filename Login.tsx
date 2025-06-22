import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

//Prime React Components
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';

//Buffer Storage
import { Buffer } from 'buffer';

//Custom Validation
import { LoginValidate } from '../../config/Validate';

//API Constant Settings
import { LOGIN } from '../../config/ApiConstant';
import axiosInstance from '../../config/axiosInstance';


export const Login = () => {
  //Document Title
  document.title = "Login | Infusion51a Venture Studio"

  //Navifate History
  const navigate = useNavigate();

  //Page Data
  const [loginData, setLoginData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  //Loading/Toast Components
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const toast = useRef<any>(null);

  const onSubmit = async () => {
    try {
      const { errors, isError } = LoginValidate(loginData);
      setErrors(errors);

      if (!isError) {
        setButtonLoading(true);

        //Login Data Value Trim
        const email = loginData.email.trim();

        //Password base64 convert
        let passwordBuff = Buffer.from(loginData.password).toString('base64');

        let formData = new FormData();
        formData.append('email', email);
        formData.append('password', passwordBuff);

        //API Call
        const response = await axiosInstance.post(LOGIN, formData);

        //Get API Reponse
        if (response.status == 200) {
          // get Data for localstorage
          const { token, user } = response.data.data;
          const usertoken = token;
          const full_name = user.full_name;
          const user_type = user.user_type;
          const profile_img = user.profile_img;

          //After Success Login Set Token in Common
          axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + usertoken;

          //set localstorage
          localStorage.setItem('token', usertoken);
          localStorage.setItem('id', user?.id);
          localStorage.setItem('full_name', full_name);
          localStorage.setItem('user_type', user_type);
          localStorage.setItem('profile_img', profile_img);

          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Login Successful',
          });

          setButtonLoading(false);
          navigate('/dashboard');
        } else if (response.status == 400) {
          toast.current?.show({
            severity: 'error',
            summary: 'Message',
            detail: 'Email ID or Password is incorrect. ',
          });
          setButtonLoading(false);
        }
      }
    } catch (error: any) {
      setButtonLoading(false);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response.data.error,
      });
    }
  };

  const _onHandleChange = (e: any, name: string) => {
    const val = (e.target && e.target.value) || '';
    setLoginData({ ...loginData, [name]: val });
  };

  return (
    <div className="login-body flex">
      <div className="login-form-shapes">
          <img className="login-form-shapes-bg login-form-shapes-bg-1 login-anim-shape1" src="/assets/images/icon/login-svg-shape1.svg" alt="Login Element" />
          <img className="login-form-shapes-bg login-form-shapes-bg-2 login-anim-shape2" src="/assets/images/icon/login-svg-shape2.svg" alt="Login Element" />
          <img className="login-form-shapes-bg login-form-shapes-bg-3 login-anim-shape3" src="/assets/images/icon/login-svg-shape3.svg" alt="Login Element" />
          <img className="login-form-shapes-bg login-form-shapes-bg-4 login-anim-shape4" src="/assets/images/icon/login-svg-shape4.svg" alt="Login Element" />
          <img className="login-form-shapes-bg login-form-shapes-bg-5 login-anim-shape5" src="/assets/images/icon/login-svg-shape5.svg" alt="Login Element" />
        </div>
      {/* <div className="login-image w-6 hidden h-screen md:block" style={{ maxWidth: "50%" }}>
        <div className='login-image-box'>
          <div className="login-left-logo">
            <img className="login-logo" src="/assets/images/logo-wh.png" alt="login-logo" />
          </div>
          <div className="login-left-content">
            <div className="login-left-title">Venture Studio, think venture Builder.</div>
          </div>
        </div>
      </div> */}
      <div className="login-panel w-full">
        <div className="p-fluid min-h-screen bg-auto md:bg-contain bg-no-repeat text-center w-full flex align-items-center md:align-items-center justify-content-center flex-column bg-auto md:bg-contain bg-no-repeat">
          <Toast ref={toast} />
          <div className="login-wrapper">
            <div className="logo-container">
              <img className="login-logo" src="/assets/images/logo-wh.png" alt="login-logo" />
            </div>
            {/* <div className="login-auth-content">
              <div className="login-auth-title">Log in to your account</div>
              <div className="login-auth-text">Enter your personal details and start journey with us.</div>
            </div> */}
            <div className="login-form">
              <div className="field">
                <label className="form-label">Email Address</label>
                <InputText value={loginData.email} name="email" autoComplete="off" placeholder="Email Address" onChange={(e) => _onHandleChange(e, 'email')} className={errors['email'] && 'p-invalid'} />
                <small className="p-invalid-txt d-flex">{errors['email']}</small>
              </div>
              <div className="field">
                <div className="flex align-items-center">
                  <label className="form-label">Password</label>
                  {/* <a href="#" className='forgot-text'>Forgot Password?</a> */}
                </div>
                <Password value={loginData.password} name="password" placeholder="Password" onChange={(e) => _onHandleChange(e, 'password')} feedback={false} toggleMask className={errors['password'] && 'p-invalid'} />
                <small className="p-invalid-txt d-flex">{errors['password']}</small>
              </div>
              <div className="button-container">
                <Button type="button" label="Login" loading={buttonLoading} onClick={onSubmit} className="p-button-info"></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
