import {useState, useEffect, useRef,useContext, React} from "react";
import '../Styles/App.css';
import CustomHeader from "../Components/CustomHeader";
import { RelayContext,UserContext } from "../Extras/UserContext";
import '../Styles/UserProfile.css';
import * as elliptic from 'elliptic';
import { sha256 } from "js-sha256";
import '../Styles/Default.css';
 


const UserProfile = () => {
    const {user, setUser} = useContext(UserContext);
    const {relays} = useContext(RelayContext);

    const ec = new elliptic.ec('secp256k1');

    const [pubkey, setPubkey] = useState("");
    const [privkey, setPrivkey] = useState("");

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
        if(user && user.meta==null && user.pubkey != null) {
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
            if(message != null && user.meta == null) {
                const userObj = {...user, "meta":JSON.parse(content)};
                setUser(userObj);
                localStorage.setItem('context', JSON.stringify(userObj));
                console.log(JSON.parse(content));
                ws.close();
                return;
            }
        }

        return () => {
            ws.close();
        }
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
                    <div class="card">
                    <img class="profile-pic extra-large-pic" src={getPicture()} alt="Image error" onError={replaceImage} />
                        <p>{getName()}</p>
                        <p>{getAbout()}</p>
                    </div>




                    <p>Public key: {user.pubkey}</p>
                    <p>Private key: {user.privkey}</p>
                    <button onClick={() => {
                        const storedContext = localStorage.getItem('context');
                        if (storedContext) {
                            console.log(JSON.parse(storedContext));
                        }
                    }}>Click me</button>


                    <button class="classic-button">Logout</button>
                </>
                }
            </div>
            
        </>
    );
}



export default UserProfile;