import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import AppWrapper from './AppWrapper';
import reportWebVitals from './reportWebVitals';

// Global Window Object

declare global {
    interface Window { helicore: any; cn: any; cb: any }
}

window.helicore = window.helicore || {};
window.cn = function (o: any) {
    return "undefined" === typeof o || null === o || "" === o.toString().trim()
};
window.cb = function (o: any) {
    if (o === 'true') {
        return true
    } else {
        return false
    }
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <BrowserRouter> 
            <AppWrapper></AppWrapper>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
