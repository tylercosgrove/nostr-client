import {useState, useEffect} from "react";
import '../Styles/Note.css';
import {CgClose} from "react-icons/cg";
import { BiCopy } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const Note = ({note, relays, meta}) => {

    const [metaData,setMeta] = useState();
    const [replyData,setReply] = useState();
    const [showReply, setShowReply] = useState(false);
    const socketURL = "wss://nostr-pub.wellorder.net";
    let navigate = useNavigate();

    let time_since = Math.floor(Date.now() / 1000) - note.created_at;
    const replyEventKey = note.tags.find(tag => tag[0] === 'e')!=null ? note.tags.find(tag => tag[0] === 'e')[1] : null;

    let sockets = [];

    useEffect(() => {

        if(meta===undefined) {
            relays.forEach(relay => {
                sockets.push(new WebSocket(relay));
                getMetaData(sockets[sockets.length-1]);
            });
        }

        return () => {
            for (let i = 0; i < sockets.length; i++) {
                sockets[i].close();
            }
        }
        
    },[]);


    useEffect(() => {
        setMeta(meta);
    }, [meta]);



    const getMetaData = (ws) => {
        try {
            ws.onopen = (event) => {
                var subscription2 = ["REQ", "my-sub", {"kinds":[0], "limit":1, "authors":[note.pubkey]}];
                ws.send(JSON.stringify(subscription2));
            }

            ws.onmessage = function (event) {
                const [ type, subId, message ] = JSON.parse( event.data );
                const {content} = message || {}

                if(message != null && metaData == null) {
                    const metaData = JSON.parse(content);
                    setMeta(metaData);
                    for (let i = 0; i < sockets.length; i++) {
                        sockets[i].close();
                      }
                    return;
                }
            }

            ws.onerror = (error) => {
                ws.close();
                error.preventDefault();
                //console.log(error);
            }
              

            /*return () => {
                ws.close();
            }*/
            
        } catch (error) {
        console.error(error);
        }
    }



    const getReplyTo = () => {
        for(const tag of note.tags) {
            if(tag[0]==='e'){
              return <p id="replying">replying to <span id="other-user" onClick={() => {
                  navigate('/posts/' + tag[1]);
              }} >{tag[1].substring(0,14)}...</span></p>;
            }
        }
    }


    const getName = () => {
        if(metaData != null && metaData.name != null) {
            return <><span id="author" onClick={()=> {
                navigate('/users/' + note.pubkey);
            }}>{metaData.name}</span> <span id="pubkey">{note.pubkey.substring(0,14)}...</span> <BiCopy id="copy-button" onClick={() => {navigator.clipboard.writeText(note.pubkey)}}/> <span id="timestamp">∙ {getTime()}</span></>;
        } else {
            return <><span id="author" onClick={()=> {
                navigate('/users/' + note.pubkey);
            }}>{note.pubkey.substring(0,14)}...</span> <BiCopy id="copy-button" onClick={() => {navigator.clipboard.writeText(note.pubkey)}}/> <span id="timestamp">∙ {getTime()}</span></>;
        }
    }

    const getTime = () => {
        if(time_since < 0)  { return `0s`;}
        if(time_since < 60) { return `${Math.floor(time_since)}s`; }
        time_since /= 60;
        if(time_since < 60) { return `${Math.floor(time_since)}m`; }
        time_since /= 60;
        if(time_since < 24) { return `${Math.floor(time_since)}h`; }
        time_since /= 24;
        return `${Math.floor(time_since)}d`;
    }

    const getPicture = (data) => {
        if(data!=null && data.picture != null) {
          return data.picture;
        } else {
          return "";
        }
    }
  
    const replaceImage = (error) => {
        error.target.src = 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg'; 
    }


    const getContent = () => {
        let imageRegex = /https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp)[^\s]*/gi;
        let tempContent = note.content.replace(imageRegex, "");
        if(tempContent.length > 2000){
            return tempContent.substring(0,2000) + "...";
        }
        return tempContent;
    }

    const getContentImage = () => {
        var imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
        var match = note.content.match(imageRegex);
        if (match) {
            return <><img src={match[0]} id="content-image"/></>;
        } else {
            return <></>;
        }
    }

    return (
        <>
            <div className="message-container">
                <img id="profile-pic" src={getPicture(metaData)} alt="Image error" onError={replaceImage} />
                <div>
                    <p>{getName()}</p>
                    {getReplyTo()}
                    <p id="message-content"  onClick={()=> {
                navigate('/posts/' + note.id);
                navigate(0);
            }}>{getContent()}</p>
            {getContentImage()}
                </div>
            </div>
            
        </>
    );
}

export default Note;