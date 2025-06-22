import { useEffect, useRef, useState } from 'react';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css"

export const TestExcel = () => {
    const [sheetData, setSheetData] = useState<any>(null);

    const settings = {
        data: [{ name: 'Sheet1', celldata: [{ r: 0, c: 0, v: null }] }],
        onChange: (data: any) => setSheetData(data),
    }

    return(
        <>
            <Workbook {...settings} />
        </>
    )
};