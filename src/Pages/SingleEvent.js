import {useState, useEffect} from "react";
import '../Styles/App.css';
import { useParams, useNavigate } from "react-router-dom";
import BigNote from "../Components/BigNote";
import Note from "../Components/Note";
import { flushSync } from "react-dom";

const SingleEvent = ({relays}) => {

    const [note, setNote] = useState();
    let navigate = useNavigate();
    const socketURL = "wss://nostr-pub.wellorder.net";
    const [replies, setReplies] = useState([]);
    let all_replies = new Set();
    const { event_id } = useParams();

    useEffect(() => {
        relays.forEach(relay => {
            getNote(relay);
            getReplies(relay);
        });
      }, []);

      const getNote = (socket) => {
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            const filter = {"kinds":[1], "limit":10, "ids":[event_id]};
            const subscription = ["REQ", "my-sub", filter];
            ws.send(JSON.stringify(subscription));
        };
  
        ws.onmessage = function (event) {
          var [ type, subId, message ] = JSON.parse( event.data );
          //console.log(message);
          if(message != null && note==null) {
              setNote(<BigNote note={message} relays={relays} />);
          }
        };
  
      return () => {
        ws.close();
      };
      }

      const getReplies = (socket) => {
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            const filter = {"kinds":[1], "#e":[event_id]};
            const subscription = ["REQ", "my-sub", filter];//, "ids":["fcef4a917d49c6b3b7142a1f96c6c4e4b293b6f985ba0fc5f51576431d3bad64"]}];//, "authors":["35d26e4690cbe1","82341f882b6eab"]    , "authors":["35d26e4690cbe1","82341f882b6eab","32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245"]
            ws.send(JSON.stringify(subscription));
        };
  
        ws.onmessage = function (event) {
          var [ type, subId, message ] = JSON.parse( event.data );
          if(message != null && !all_replies.has(message.id)) {
              all_replies.add(message.id);
              setReplies(replies => [...replies, { note:message, relays:relays, id:message.id}]);

            //setReplies(replies => [...replies, <Note note={message} relays={relays} key={message.id} />]);
          }
        };
  
      return () => {
        ws.close();
      };
    }

    const getSorted = () => {
        return replies.sort(function(a, b) {
            return a.note.created_at - b.note.created_at;
          });
    }
    const replyComponents = getSorted().map(item => <Note key={item.id} relays={item.relays} note={item.note}/>);
    

    return (
        <>
        <div id="header">
            
            <p id="link" onClick={()=>{
                navigate("/");
            }}>Home</p>
        </div>

        <div id="content">{note}</div>
        <div id="content">{replyComponents}</div>

        </>
    );
}

export default SingleEvent;