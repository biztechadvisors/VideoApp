import React, { createContext, useState, useRef, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('https://192.168.1.15:5000/');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState([]);
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');


  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        document.querySelector('video').srcObject = currentStream;
        // myVideo.current.srcObject = currentStream;
      });

    socket.on('me', (id) => setMe(id));

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
      console.log("SetCall Work")
    });


  }, []);
  const answerCall = () => {
    console.log("ANSWER_CALL=" + callAccepted)
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
      console.log("signal= " + data, "calluser id to=" + call.from)
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;

    })
    peer.signal(call.signal);

    connectionRef.current = peer;
    console.log("ANSWER_CALL=" + callAccepted)
  };


  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
      console.log("userToCall= " + id, "signalData= " + data, "from= " + me, "name=" + name)

    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
      console.log("work calluser 1")
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      console.log("work calluser Accepted")
      peer.signal(signal);
    });

    connectionRef.current = peer;
    console.log("connectionRef.current" + connectionRef.current)
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };


  // let MediaRecord;
  // const StartRecording = () => {
  //   console.log("START VIDEO......?")
  //   MediaRecord = new MediaRecorder(stream, { MimeType: 'video/mp4' });
  //   MediaRecord.start();
  //   setRecording(MediaRecord);

  //   // var options = {mimeType: 'video/webm;codecs=vp9', bitsPerSecond: 100000};
  //   // try {
  //   //   const mediaRecorder = new MediaRecorder(stream, options);
  //   //   setRecording(mediaRecorder);
  //   // } catch (e0) {
  //   //   console.log('Unable to create MediaRecorder with options Object: ', options, e0);
  //   //   try {
  //   //     options = {mimeType: 'video/webm;codecs=vp8', bitsPerSecond: 100000};
  //   //     const mediaRecorder = new MediaRecorder(stream, options);
  //   //   } catch (e1) {
  //   //     console.log('Unable to create MediaRecorder with options Object: ', options, e1);
  //   //     try {
  //   //     const mediaRecorder = new MediaRecorder(stream);
  //   //     } catch (e2) {
  //   //       alert('MediaRecorder is not supported by this browser.');
  //   //       console.log('Unable to create MediaRecorder', e2);
  //   //       return;
  //   //     }
  //   //   }
  //   // }
  //   console.log("Start Recording:-" + Recording);
  // }

  // const StopRecording = () => {
  //   console.log("STOP VIDEO...?")
  //   // clearInterval(setRecording(0))
  //   Recording.stop();
  //   // Recording.controls = true;
  //   // console.log("recoding Stopped,data available");
  //   console.log("Recording Stop:-" + Recording);
  // }
  // const DownloadVideo = () => {

  //   console.log("DOWNLOAD VIDEO...?")
  //   // let blob = new Blob(["Hello, world!"], {type: 'text/plain'});
  //   // console.log("blob check:-"+blob)

  //   // a.href = URL.createObjectURL(blob);
  //   // var blob = new Blob([Recording], { type: 'video/webm' });
  //   // var url = window.URL.createObjectURL(blob);
  //   // var a = document.createElement('a');
  //   // a.style.display = 'none';
  //   // a.href = url;
  //   // document.body.appendChild(a);
  //   // a.click();
  //   // setTimeout(function () {
  //   //   document.body.removeChild(a);
  //   //   window.URL.revokeObjectURL(url);
  //   // }, 100);

  //   var blob = new Blob([Recording], {
  //     'type': 'video/mp4'
  //     // 'type': 'text/plain'
  //   });
  //   console.log("BLOB:-" + blob)
  //   var url = URL.createObjectURL(blob);
  //   console.log("URL:-" + url)
  //   var a = document.createElement('a');
  //   console.log("A:-" + a)
  //   document.body.appendChild(a);
  //   a.href = url;
  //   a.download = 'test.mp4';
  //   a.click();
  // }




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
      me,
      callUser,
      leaveCall,
      answerCall,
      // Identity,
      // StartRecording,
      // StopRecording,
      // DownloadVideo
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };