


export const getHost = ()=>{
  let hostname = window.location.hostname
  if(hostname.includes('runonflux')){
    return hostname
  }
  else if(hostname==="node.cyberfly.io"){
  return hostname
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

export const getDBInfo = async(dbaddress)=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/api/dbinfo`;
  const res =await fetch(url, {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddress:dbaddress})})
  const data = await res.json()
return data
}

export const getReadDB = async(dbaddress)=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/api/read`;
  const res =await fetch(url, {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddress:dbaddress})})
  const data = await res.json()
return data
}


