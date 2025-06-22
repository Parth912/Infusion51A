import axiosInstance from '../config/axiosInstance';

export default class CommonService {
  getAPICall = async (apiUrl: string) => {
    const response = await axiosInstance.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return response;
  };

  postAPICall = async (apiUrl: string, requestData: any) => {
    const response = await axiosInstance.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    return response;
  };
}
