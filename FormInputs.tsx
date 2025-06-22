import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import { Editor } from "primereact/editor";
import { FileUpload } from 'primereact/fileupload';
import { chooseOptions, emptyTemplate, headerTemplate } from '../components/ImageUploadComponent/ImageUploadSetting';
import { Button } from 'primereact/button';

const FormsInput = () => {
    const [dropdownItem, setDropdownItem] = useState<any>(null);
    const [selectedCities, setSelectedCities] = useState<any>(null);
    const [switchValue, setSwitchValue] = useState<boolean>(false);
    const [radioValue, setRadioValue] = useState<any>(null);
    const [checkboxValue, setCheckboxValue] = useState<any>([]);
    const [desc, setDesc] = useState<string>();
    const [image, setImage] = useState<any>();

    const fileUploadRef = useRef(null);

    const removeFile = useRef(null);

    const dropdownItems = [
        { name: 'Option 1', code: 'Option 1' },
        { name: 'Option 2', code: 'Option 2' },
        { name: 'Option 3', code: 'Option 3' }
    ];
    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];

    const onCheckboxChange = (e: any) => {
        let selectedValue: any[] = [...checkboxValue];
        if (e.checked) selectedValue.push(e.value);
        else selectedValue.splice(selectedValue.indexOf(e.value), 1);

        setCheckboxValue(selectedValue);
    };
    const itemTemplate = (file: any, props: any) => {
        setImage(file);
        removeFile.current = props.onRemove
        return (
            <>
                <div className="flex align-items-center flex-wrap">
                    <div className="flex align-items-center" style={{ width: '40%' }}>
                        <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                        <span className="flex flex-column text-left ml-3">
                            {file.name}
                        </span>
                        <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(props.onRemove)} />
                    </div>
                </div>
            </>
        );
    };

    const onTemplateRemove = (callback: any) => {
        callback();
    }

    return (
        <>
            <div className="col-12">
                <div className="card">
                    <h5>Advanced</h5>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="firstname2">Firstname</label>
                            <InputText id="firstname2" type="text" />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="lastname2">Lastname</label>
                            <InputText id="lastname2" type="text" />
                        </div>
                        <div className="field col-12">
                            <label htmlFor="address">Address</label>
                            <InputTextarea id="address" rows={4} />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="city">City</label>
                            <InputText id="city" type="text" />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="zip">Zip</label>
                            <InputText id="zip" type="text" />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="state">State</label>
                            <Dropdown id="state" filter value={dropdownItem} onChange={(e) => setDropdownItem(e.value)} options={dropdownItems} optionLabel="name" placeholder="Select One"></Dropdown>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="state">Country</label>
                            <MultiSelect value={selectedCities} onChange={(e) => setSelectedCities(e.value)} options={cities} optionLabel="name"
                                filter placeholder="Select Cities" />
                        </div>

                        <div className="field col-12 md:col-12">
                            <label htmlFor="desc">Description</label>
                            <Editor value={desc} name="description" onTextChange={(e: any) => setDesc(e.htmlValue)} />
                        </div>

                        <div className='field col-12 md:col-12'>
                            <label htmlFor="desc">Image</label>
                            <FileUpload ref={fileUploadRef} accept="image/*" name="demo[]" className='imageupload'
                                chooseOptions={chooseOptions}
                                emptyTemplate={emptyTemplate} headerTemplate={headerTemplate}
                                itemTemplate={itemTemplate} ></FileUpload>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 md:col-6">
                <div className="card">
                    <h5>RadioButton</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="field-radiobutton">
                                <RadioButton inputId="option1" name="option" value="Chicago" checked={radioValue === 'Chicago'} onChange={(e) => setRadioValue(e.value)} />
                                <label htmlFor="option1">Chicago</label>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field-radiobutton">
                                <RadioButton inputId="option2" name="option" value="Los Angeles" checked={radioValue === 'Los Angeles'} onChange={(e) => setRadioValue(e.value)} />
                                <label htmlFor="option2">Los Angeles</label>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field-radiobutton">
                                <RadioButton inputId="option3" name="option" value="New York" checked={radioValue === 'New York'} onChange={(e) => setRadioValue(e.value)} />
                                <label htmlFor="option3">New York</label>
                            </div>
                        </div>
                    </div>

                    <h5 style={{ marginTop: 0 }}>Checkbox</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="field-checkbox">
                                <Checkbox inputId="checkOption1" name="option" value="Chicago" checked={checkboxValue.indexOf('Chicago') !== -1} onChange={onCheckboxChange} />
                                <label htmlFor="checkOption1">Chicago</label>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field-checkbox">
                                <Checkbox inputId="checkOption2" name="option" value="Los Angeles" checked={checkboxValue.indexOf('Los Angeles') !== -1} onChange={onCheckboxChange} />
                                <label htmlFor="checkOption2">Los Angeles</label>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="field-checkbox">
                                <Checkbox inputId="checkOption3" name="option" value="New York" checked={checkboxValue.indexOf('New York') !== -1} onChange={onCheckboxChange} />
                                <label htmlFor="checkOption3">New York</label>
                            </div>
                        </div>
                    </div>

                    <h5 style={{ marginTop: 0 }}>Input Switch</h5>
                    <InputSwitch checked={switchValue} onChange={(e) => setSwitchValue(e.value)} />
                </div>
            </div>

        </>
    )
}

export default FormsInput;

