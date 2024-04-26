


const getHost = ()=>{
  let hostname = window.location.hostname
  if(hostname.includes('runonflux')){
    var name = hostname.split('.')[0]
    var newname = name+'_31003'
    return hostname.replace(name, newname)
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
  const url = `${protocol}//${host}/sysinfo`;
    const res =await fetch(url)
    const data = await res.json()
  return data
}

export const getNodeInfo = async()=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/`;
  const res =await fetch(url)
  const data = await res.json()
   return data
}

export const getDBInfo = async(dbaddress)=>{
  const host = getHost(); // Get the host without protocol
  const protocol = window.location.protocol; // Get the current protocol

  // Construct the URL using the current protocol and the retrieved host
  const url = `${protocol}//${host}/dbinfo`;
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
  const url = `${protocol}//${host}/read`;
  const res =await fetch(url, {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddress:dbaddress})})
  const data = await res.json()
return data
}


