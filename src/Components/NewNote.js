import { BiCopy } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import {useState, useEffect, useRef, useContext} from "react";
import '../Styles/BigNote.css';
import { RelayContext,UserContext } from "../Extras/UserContext";
import useAutosizeTextArea from "../Extras/useAutosizeTextArea";
import * as elliptic from 'elliptic';
import { sha256 } from "js-sha256";
import * as secp from '@noble/secp256k1';


const NewNote = () => {

    const {relays} = useContext(RelayContext);
    const {user, setUser} = useContext(UserContext);
    const [value, setValue] = useState("");
    const textAreaRef = useRef(null);
    const ec = new elliptic.ec('secp256k1');


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

    const publish = async () => {
        if(value=="") {
            return;
        }
        setValue("");
        const keypair = ec.keyFromPrivate(user.privkey, 'hex');

        var event = {
            "content"    : value,
            "created_at" : Math.floor( Date.now() / 1000 ),
            "kind"       : 1,
            "tags"       : [],
            "pubkey"     : user.pubkey,
        }

        var eventData = JSON.stringify([
            0,
            event['pubkey'],
            event['created_at'],
            event['kind'],
            event['tags'],
            event['content']
        ])

        event.id  = sha256( eventData ).toString( 'hex' );
        const signature2 = await secp.schnorr.sign(event.id, user.privkey);
        event.sig = secp.utils.bytesToHex(signature2);

        relays.forEach(relay => {
            sendEvent(relay, event);
        });
    }

    const sendEvent = (socket, eventData) => {
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            console.log(eventData);
            ws.send(JSON.stringify(["EVENT",eventData]));
            ws.close();
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

                <button id="publish-button" class="classic-button" onClick={publish}>Publish</button>
              </div>
            </div>
          </>}
        </>
    );
}

export default NewNote;