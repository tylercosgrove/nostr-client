import {useState, useEffect, useRef,useContext, React} from "react";
import '../Styles/App.css';
import CustomHeader from "../Components/CustomHeader";
import { RelayContext,UserContext } from "../Extras/UserContext";
import '../Styles/UserProfile.css';
import * as elliptic from 'elliptic';
import { sha256 } from "js-sha256";
import '../Styles/Default.css';
import * as secp from '@noble/secp256k1';

 


const UserProfile = () => {
    const {user, setUser} = useContext(UserContext);
    const {relays} = useContext(RelayContext);

    const ec = new elliptic.ec('secp256k1');

    const [pubkey, setPubkey] = useState("");
    const [privkey, setPrivkey] = useState("");
    const [newMeta, setNewMeta] = useState({});
    const [viewingKeys, setViewing] = useState(false);

    useEffect(()=> {
        if(user == null || Object.keys(user).length === 0) {
            //console.log("null");
            const storedContext = localStorage.getItem('context');
            if (storedContext) {
                setUser(JSON.parse(storedContext));
            }
        }
    });

    useEffect(() => {
        
        if(user && user.pubkey != null) {
            relays.forEach(relay => {
                getMetaData(relay, user.pubkey);
            });
        }
    }, [user]);

    const getMetaData = (socket, author) => {
        console.log("looking!!!");
        const ws = new WebSocket(socket);
        ws.onopen = (event) => {
            var subscription2 = ["REQ", "my-sub", {"kinds":[0], "limit":1, "authors":[author]}];
            ws.send(JSON.stringify(subscription2));
        }

        ws.onmessage = function (event) {
            const [ type, subId, message ] = JSON.parse( event.data );
            const {content} = message || {}
            if(message != null ){//&& user.meta == null) {
                if(user.meta == null || !shallowEqual(user.meta, JSON.parse(content))){
                    const userObj = {...user, "meta":JSON.parse(content)};
                    setUser(userObj);
                    localStorage.setItem('context', JSON.stringify(userObj));
                    //console.log(JSON.parse(content));
                    console.log("new metaData!!!!1");
                }
                ws.close();
                return;
                
            }
        }

        return () => {
            ws.close();
        }
    }

    function shallowEqual(object1, object2) {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
          return false;
        }
        for (let key of keys1) {
          if (object1[key] !== object2[key]) {
            return false;
          }
        }
        return true;
      }


    const logIn = () => {
        const testPrivate = ec.keyFromPrivate(privkey, 'hex');
        const testPubkey = testPrivate.getPublic();
        const pubkeyFromPriv = testPubkey.encodeCompressed("hex").substring(2)

        if(pubkey === pubkeyFromPriv) {
            console.log("same!");
            const userObj = {
                "pubkey": pubkey,
                "privkey": privkey
            };
            setUser(userObj);
            localStorage.setItem('context', JSON.stringify(userObj));
        } else {
            console.log("not same");
        }
    }


    const generateKeys = () => {
        const key = ec.genKeyPair();
        const ecPriv = key.getPrivate('hex');
        const ecPub = key.getPublic().encodeCompressed("hex").substring(2);
        setPubkey(ecPub);
        setPrivkey(ecPriv);
    }


    const getName = () => {
        if(user.meta != null && user.meta.name != null) {
            return <><span class="extra-large-text bold">{user.meta.name}</span></>;
        } else {
            return <><span class="extra-large-text bold">{user.pubkey.substring(0,14)}...</span></>;
        }
    }

    const getAbout = () => {
        if(user.meta != null && user.meta.about != null) {
            return <><span id="user-about">{user.meta.about}</span></>;
        } else {
            return <><span class="gray" id="user-about">No bio yet...</span></>;
        }
    }

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

    const updateMeta = async () => {
        const currUserMeta = { ...user.meta, ...newMeta }
        const keypair = ec.keyFromPrivate(user.privkey, 'hex');

        var event = {
            "content"    : JSON.stringify(currUserMeta),
            "created_at" : Math.floor( Date.now() / 1000 ),
            "kind"       : 0,
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
            ws.send(JSON.stringify(["EVENT",eventData]));
            ws.close();
        }
    }

    const logOut = () => {
        setUser({});
        localStorage.clear();
    }

    const showKeys = () => {
        return viewingKeys ? <>
            <div id="overlay" onClick={()=>{
                setViewing(false);
            }}>
            </div>
            <div id="key-container">
                <div id="key-title-container">
                    <p class="bold larger-text">Your keys:</p>
                    <p class="link default-link" onClick={()=>{
                        setViewing(false);
                    }}>Close</p>
                </div>
                <p class="small-text">NEVER share your private key, and make sure you have it backed up elsewhere.</p>
                <p class="small-text">Public key:</p>
                <input class="display-key" disabled value={user.pubkey} />
                <p class="small-text">Private key:</p>
                <input class="display-key" disabled value={user.privkey} />
            </div> 
        </> : <></>;
    }


    return (
        <>
            <CustomHeader title={<h1>My profile</h1>}/>

            <div id="content">
                {Object.keys(user).length === 0 ? 
                <>
                    <p>You are not logged in.</p> 

                    <div id="login-form">
                        <label>Public Key:</label>
                        <input type="text" value={pubkey} onChange={(e) => {
                            setPubkey(e.target.value);
                            
                        }}/>
                        <button id="generate-key" onClick={() => {
                            generateKeys();
                        }}>Generate keys</button>
                        

                        <label>Private Key:</label>
                        <input type="text" value={privkey} onChange={(e) => setPrivkey(e.target.value)}/>
                        
                        <input type="submit" value="Login" onClick={() => {
                            logIn();
                        }}/>
                    </div>
                </> : 
                <>  
                    {showKeys()}
                    <div class="card">
                        <img class="profile-pic extra-large-pic" src={getPicture()} alt="Image error" onError={replaceImage} />
                        <p>{getName()}</p>
                        <p class="gray small-text">{user.pubkey}</p>
                        <p>{getAbout()}</p>
                    </div>

                    <div id="update-fields">
                        <input type="text" placeholder="Name" value={newMeta.name} onChange={(e) => setNewMeta({...newMeta, "name":e.target.value})}/>
                        
                        <input type="text" placeholder="About" value={newMeta.about} onChange={(e) => setNewMeta({...newMeta, "about":e.target.value})}/>

                        <input type="text" placeholder="Picture URL" value={newMeta.picture} onChange={(e) => setNewMeta({...newMeta, "picture":e.target.value})}/>
                    </div>
                        <button class="classic-button" onClick={updateMeta}>Save</button>
    
                    <div id="button-container">
                        <button id="view-keys" class="classic-button" onClick={() => {
                            setViewing(true);
                        }}>View keys</button>
                        <button id="logout" class="classic-button" onClick={logOut}>Logout</button>
                    </div>
                </>
                }
            </div>
            
        </>
    );
}



export default UserProfile;