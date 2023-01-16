//import './App.css';
import {useState, useEffect} from "react";
import { BiCopy } from "react-icons/bi";
import Note from '../Components/Note';
import { useNavigate } from 'react-router-dom';

const Home = ({relays}) => {

    const [notes, setNotes] = useState([]);
    let all_notes = new Set();
    const socketURL = "wss://nostr-pub.wellorder.net";
    let navigate = useNavigate();

    let sockets = [];
  
    useEffect(() => {
        relays.forEach(relay => {
            sockets.push(new WebSocket(relay));
            getNotes(sockets[sockets.length-1]);
        });

        return () => {
          for (let i = 0; i < sockets.length; i++) {
              sockets[i].close();
          }
      }
    }, []);

    const getNotes = (ws) => {
        ws.onopen = (event) => {
            const filter = {"kinds":[1], "limit":8};
            const subscription = ["REQ", "my-sub", filter];
            ws.send(JSON.stringify(subscription));
        };
  
        ws.onmessage = function (event) {
          var [ type, subId, message ] = JSON.parse( event.data );

          if(message != null && !all_notes.has(message.id)) {
              all_notes.add(message.id);
              setNotes(notes => [...notes, { note:message, relays:relays, id:message.id}]);
          }
        };
  
      return () => {
        ws.close();
      };
    }
  
    const getSorted = () => {
        return notes.sort(function(a, b) {
            return b.note.created_at - a.note.created_at;
          });
    }
    const noteComponents = getSorted().map(item => <Note key={item.id} relays={item.relays} note={item.note}/>);

      
  
    return (
      <>
        <div id="header">
          <h1>nostr client</h1>
          <p>public chat</p>
        </div>
  
        <div id="content">{noteComponents}</div>
      </>
    );
}

export default Home;