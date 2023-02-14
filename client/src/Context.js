import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5002');
// const socket = io('https://cbc.shram.io');
// const socket = io('https://warm-wildwood-81069.herokuapp.com');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [test, setTest] = useState([]);

  const myVideo = useRef();
  const userVideo = useRef([]);
  const connectionRef = useRef();
  // useEffect(() => {
  //   console.log(223);
  //   socket.emit('callUserAdd', name);
  //   socket.on('callUserAdd', (a) => { console.log(a, 'lsl'); setTest(a); });
  //   // return () => socket.off('callUserAdd');
  // }, [socket, name]);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

    socket.on('me', (id) => { console.log(id); setMe(id); });
    socket.on('callUser', ({ from, name: callerName, signal, userName }) => {
      console.log({ from, name: callerName, signal, userName });
      setCallAccepted(false);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
    console.log(call, 'call');
  }, []);

  const x = () => {
    // const peer = new Peer({ initiator: false, trickle: false, stream });
    // peer.on('signal', (data) => {
    console.log('data', name);
    socket.emit('callUserAdd', name);
    // });
    socket.on('callUserAdd', (a) => { console.log(a, 'lsls'); setTest(a); });
    console.log(1);
  };
  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      console.log(call.from);
      socket.emit('answerCall', { signal: data, to: call.from });
    });
    peer.on('stream', (currentStream) => {
      setAllUsers([...allUsers, currentStream]);
      console.log(currentStream);
      // setAllUsers(allUsers + 1);
      // userVideo.current[allUsers.length] = currentStream;
      userVideo.current.push(currentStream);
    });
    console.log(allUsers);

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = async (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name, userName: name });
      console.log('callUser', { userToCall: id, signalData: data, from: me, name, userName: name });
    });
    socket.on('callUser', ({ from, name: callerName, signal, userName }) => {
      console.log({ from, name: callerName, signal, userName });
      setCallAccepted(false);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
    peer.on('stream', (currentStream) => {
      const arr = allUsers;
      arr.push({ name: 'abc', class: 10 });
      console.log(arr);
      setAllUsers(arr);
      socket.emit('callUserAdd', arr);
      console.log(currentStream);
      // setAllUsers(allUsers + 1);
      // userVideo.current[allUsers.length] = currentStream;
      userVideo.current.push(currentStream);
    });
    socket.on('callUserAdd', (userToCall) => {
      console.log(userToCall, 'userToCall');
    });
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      allUsers,
      me,
      test,
      setTest,
      x,
      callUser,
      leaveCall,
      answerCall,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext, socket };
