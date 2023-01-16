import Home from './Pages/Home';
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SingleEvent from './Pages/SingleEvent';
import Profile from './Pages/Profile';

function App() {

  let all_relays = [
    "wss://nostr-pub.wellorder.net",
    //"wss://nostr-relay.untethr.me",
    "wss://relay.damus.io",
    "wss://nostr-verified.wellorder.net",
    "wss://relay.nostr.ch",
    //"wss://nostr.developer.li"
  ];
 
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home relays={all_relays}/>}/>
          <Route path="/users/:author" element={<Profile relays={all_relays} />} />
          <Route path="/posts/:event_id" element={<SingleEvent relays={all_relays}/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );

}

export default App;
