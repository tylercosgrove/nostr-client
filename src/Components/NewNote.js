import { BiCopy } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import {useState, useEffect, useRef, useContext} from "react";
import '../Styles/BigNote.css';
import { RelayContext,UserContext } from "../Extras/UserContext";
import useAutosizeTextArea from "../Extras/useAutosizeTextArea";


const NewNote = () => {

    const {user, setUser} = useContext(UserContext);
    const [value, setValue] = useState("");
    const textAreaRef = useRef(null);

    useAutosizeTextArea(textAreaRef.current, value);

    const handleChange = (event) => {
        const val = event.target?.value;
        setValue(val);
    };



    const getPicture = () => {
        if(user.meta!=null && user.meta.picture != null) {
          return user.meta.picture;
        } else {
          return "";
        }
    }
  
    const replaceImage = (error) => {
        error.target.src = 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg'; 
    }
  
    const getName = () => {
      if(user.meta != null && user.meta.name != null) {
          return <><span class="medium-text bold link" >{user.meta.name}</span>   <span class="small-text gray">{user.pubkey.substring(0,14)}...</span></>;
      } else {
          return <><span class="medium-text bold link" >{user.pubkey.substring(0,14)}...</span></>;
      }
    }


    return (
        <>
            {Object.keys(user).length === 0 ? <>
            <div class="card">
              <p id="login-note">You need to login in order to send notes.</p>
            </div>
          </> : <>
            <div class="card" id="message-container">
              <img id="note-pic" class="profile-pic small-pic" src={getPicture()} alt="Image error" onError={replaceImage} />
              <div id="main-new-note-area">
                <p>{getName()}</p>
                <textarea id="new-note" onChange={handleChange} placeholder="What's happening?" rows={1} value={value} ref={textAreaRef}/>

                <button id="publish-button" class="classic-button">Publish</button>
              </div>
            </div>
          </>}
        </>
    );
}

export default NewNote;