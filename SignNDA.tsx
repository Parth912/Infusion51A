import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import NDAPDFViewer from '../../../components/NDAPDFViewer';

export const SignNDA = () => {
    document.title = "Sign NDA | Venture Studio"

    return(
        <>
            <NDAPDFViewer/>
        </>
    );
}