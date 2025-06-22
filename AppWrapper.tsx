import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import App from './App';
import { Login } from './pages/login/Login';
import { AttorneyLogin } from './pages/Admin/Attorney/AttorneyLogin';
import { AttorneyDocsList } from './pages/Admin/Attorney/AttorneyDocsList';


const AppWrapper = (props: any) => {
    const [colorScheme, setColorScheme] = useState('light');

    let location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);


    const onColorSchemeChange = (scheme: boolean) => {
        let changeScheme: any = "";
        {
            scheme == true ? changeScheme = "dark" : changeScheme = "light"
        }

        changeStyleSheetUrl('layout-css', 'layout-' + changeScheme + '.css', 1);
        changeStyleSheetUrl('theme-css', 'theme-' + changeScheme + '.css', 1);
        setColorScheme(changeScheme);
    };

    const changeStyleSheetUrl = (id: any, value: any, from: any) => {
        const element = document.getElementById(id) as HTMLInputElement;
        const urlTokens = (element.getAttribute('href') as String).split('/');

        if (from === 1) {
            // which function invoked this function - change scheme
            urlTokens[urlTokens.length - 1] = value;
        } else if (from === 2) {
            // which function invoked this function - change color
            urlTokens[urlTokens.length - 2] = value;
        }

        const newURL = urlTokens.join('/');

        replaceLink(element, newURL);
    };

    const replaceLink = (linkElement: any, href: string, callback?: any) => {
        const id = linkElement.getAttribute('id');
        const cloneLinkElement = linkElement.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            linkElement.remove();
            const _linkElement = document.getElementById(id);
            _linkElement && _linkElement.remove();
            cloneLinkElement.setAttribute('id', id);

            if (callback) {
                callback();
            }
        });
    };

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/attorney/login" element={<AttorneyLogin />} />
            <Route path="/attorney/docs" element={<AttorneyDocsList />} />
            <Route path="*" element={<App colorScheme={colorScheme} onColorSchemeChange={onColorSchemeChange} />} />
        </Routes>
    );
};

export default AppWrapper;
