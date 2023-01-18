import {useState, useEffect, React} from "react";
import '../Styles/App.css';
import { useNavigate } from "react-router-dom";
import '../Styles/Profile.css';


const CustomHeader = ({title}) => {

    let navigate = useNavigate();

    return (
        <>
        <div id="header">
            {title}
            <p id="link" onClick={()=>{
                navigate("/");
            }}>Home</p>

            <p id="link" onClick={()=>{
                navigate("/profile");
            }}>Profile</p>

            <p id="link" onClick={()=>{
                navigate("/settings");
            }}>Settings</p>
        </div>


        </>
    );
}



export default CustomHeader;