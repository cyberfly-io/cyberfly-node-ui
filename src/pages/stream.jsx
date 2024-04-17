import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

const Stream = () => {
  const [myStream, setMyStream] = useState(null);
  const [myPeerId, setMyPeerId] = useState('');
  const [peerId, setPeerId] = useState('');
  const [peerStream, setPeerStream] = useState(null);
  const myVideoRef = useRef();
  const peerVideoRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setMyStream(stream);
      myVideoRef.current.srcObject = stream;
    });
  }, []);

  useEffect(() => {
    if (peerId) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: myStream,
      });
      peer.on('signal', (data) => {
        peerVideoRef.current.srcObject = null;
        peerVideoRef.current.srcObject = new MediaStream();
        peer.addStream(myStream);
        peer.on('stream', (stream) => {
          setPeerStream(stream);
          peerVideoRef.current.srcObject = stream;
        });
      });

      peer.on('error', (err) => {
        console.error(err);
      });

      peer.signal(myPeerId);
    }
  }, [peerId, myStream]);

  return (
    <div>
      <video ref={myVideoRef} autoPlay muted />
      <video ref={peerVideoRef} autoPlay />
      <input type="text" value={peerId} onChange={(e) => setPeerId(e.target.value)} />
      <button onClick={() => setPeerId(myPeerId)}>Connect</button>
    </div>
  );
};

export default Stream;