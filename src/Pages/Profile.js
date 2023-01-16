import {useState, useEffect, React} from "react";
import '../Styles/App.css';
import { useParams, useNavigate } from "react-router-dom";
import '../Styles/Profile.css';
import Note from "../Components/Note";
import { BiCopy } from "react-icons/bi";
import { Tooltip } from 'react-tooltip';

const Profile = ({relays}) => {

    const [metaData,setMeta] = useState();
    let navigate = useNavigate();
    let all_notes = new Set();
    const [replies, setReplies] = useState([]);
    const { author } = useParams();

    const [copyMessage, setMessage]= useState("Click pubkey");



    useEffect(() => {
        relays.forEach(relay => {
            getMetaData(relay);
            getNotes(relay);
        });
    }, []);

    const getNotes = (socket) => {
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            const filter = {"kinds":[1], "limit": 100,"authors":[author]};
            const subscription = ["REQ", "my-sub", filter];
            ws.send(JSON.stringify(subscription));
        };
  
        ws.onmessage = function (event) {
          var [ type, subId, message ] = JSON.parse( event.data );
          if(message != null && !all_notes.has(message.id)) {
            all_notes.add(message.id);
            setReplies(replies => [...replies, { note:message, relays:relays, meta:metaData, id:message.id}]);
          }
        };
  
      return () => {
        ws.close();
      };
    }
    
    
    

    const getMetaData = (socket) => {
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            var subscription2 = ["REQ", "my-sub", {"kinds":[0], "limit":1, "authors":[author]}];
            ws.send(JSON.stringify(subscription2));
        }

        ws.onmessage = function (event) {
            const [ type, subId, message ] = JSON.parse( event.data );
            const {content} = message || {}

            if(message != null && metaData == null) {
                setMeta(JSON.parse(content));
                ws.close();
                return;
            }
        }

        return () => {
            ws.close();
        }
    }


    const getPicture = () => {
        if(metaData!=null && metaData.picture != null) {
          return metaData.picture;
        } else {
          return "";
        }
    }

    const replaceImage = (error) => {
        error.target.src = 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg'; 
    }


    const getName = () => {
        if(metaData != null && metaData.name != null) {
            return <><span id="profile-name">{metaData.name}</span></>;
        } else {
            return <><span id="profile-name">{author.substring(0,14)}...</span></>;
        }
    }

    const getPubkey = () => {
        if(metaData != null && metaData.name != null) {
            return <>
                    <Tooltip anchorId="profile-pubkey" content={copyMessage} place="top" className="profile-tooltip" classNameArrow="profile-tooltip-arrow"/>
                    <p id="profile-pubkey" onClick={() => {
                        navigator.clipboard.writeText(author);
                        setMessage("Copied!");
                    }} onMouseEnter={() => {
                        setMessage("Copy Pubkey");
                    }}>{author.substring(0,64)}</p>
                    </>;
        } else {
            return <></>;
        }
    }

    const getBio = () => {
        if(metaData != null && metaData.about != null) {
            return <><p id="profile-about">{metaData.about}</p></>;
        } else {
            return <></>;
        }
    }


    const getSorted = () => {
        return replies.sort(function(a, b) {
            return b.note.created_at - a.note.created_at;
          });
    }
    const noteComponents = getSorted().map(item => <Note key={item.id} meta={metaData} relays={item.relays} note={item.note}/>);

    return (
        <>
        <div id="header">
            <h1>{(metaData != null && metaData.name != null) ? metaData.name : author.substring(0,14) + "..."}'s profile</h1>
            <p id="link" onClick={()=>{
                navigate("/");
            }}>Home</p>
        </div>

        <div id="profile-container">
            <img id="profile-large-pic" src={getPicture()} alt="Image error" onError={replaceImage}/>
            <p>{getName()}</p>
            {getPubkey()}
            {getBio()}
        </div>

        <div id="content">{noteComponents}</div> 
            
            


        </>
    );
}



export default Profile;