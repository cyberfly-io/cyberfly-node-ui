


export const getHost = ()=>{
  let hostname = window.location.hostname
  if(hostname.includes('runonflux')){
    return hostname
  }
  else if(hostname.includes(".cyberfly.io")){
  return hostname
  }
  else if(hostname.includes(".vercel.app")) {
    return "node.cyberfly.io"
  }
  else{
    return hostname+":31003"
  }
}


export const getSysInfo = async()=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/api/sysinfo`;
    const res =await fetch(url, {headers:{ 'Accept': 'application/json',
    'Content-Type': 'application/json'}})
    const data = await res.json()
  return data
}

export const getNodeInfo = async()=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/api/`;
  const res =await fetch(url, {headers:{ 'Accept': 'application/json',
  'Content-Type': 'application/json'}})
  const data = await res.json()
   return data
}

export const getDBInfo = async(dbaddr)=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/api/dbinfo`;
  const res =await fetch(url, {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddr:dbaddr})})
  const data = await res.json()
return data
}

export const getReadDB = async(dbaddr)=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/api/read`;
  const res =await fetch(url, {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddr:dbaddr})})
  const data = await res.json()
return data
}


export const dialNode = async(multiAddr)=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol
  const url = `${protocol}//${host}/api/dial`;

  const res =await fetch(url, {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({multiAddr:multiAddr})})
  const data = await res.json()
return data
}

export const findPeer = async(peerId)=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol
  const url = `${protocol}//${host}/api/findpeer`;

  const res =await fetch(url, {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({peerId:peerId})})
  const data = await res.json()
return data
}