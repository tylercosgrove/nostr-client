import {useState, useEffect, React} from "react";
import '../Styles/App.css';
import { useParams, useNavigate } from "react-router-dom";
import '../Styles/Profile.css';
import Note from "../Components/Note";
import { BiCopy } from "react-icons/bi";
import { Tooltip } from 'react-tooltip';
import CustomHeader from "../Components/CustomHeader";


const Settings = () => {

    return (
        <>
            <CustomHeader title={<h1>Settings</h1>}/>
        </>
    );
}



export default Settings;