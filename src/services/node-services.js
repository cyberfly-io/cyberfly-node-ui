
const getHost = ()=>{
    return window.location.hostname
}



export const getPeers = async()=>{
    const res =await fetch("http://"+getHost()+":3000/peers")
    const data = await res.json()
  return data
}

export const getNodeInfo = async()=>{
  const res =await fetch("http://"+getHost()+":3000/nodeinfo")
  const data = await res.json()
return data
}

export const getDBInfo = async(dbaddress)=>{
  const res =await fetch("http://"+getHost()+":3000/dbinfo", {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddress:dbaddress})})
  const data = await res.json()
return data
}

export const getReadDB = async(dbaddress)=>{
  const res =await fetch("http://"+getHost()+":3000/read", {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddress:dbaddress})})
  const data = await res.json()
return data
}