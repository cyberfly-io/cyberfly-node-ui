


const getHost = ()=>{
  let hostname = window.location.hostname

  if(hostname.includes('runonflux')){
    var name = hostname.split('.')[0]
    var newname = name+'_31003'
    return hostname.replace(name, newname)
  }
  return hostname
}



export const getPeers = async()=>{
    const res =await fetch("https://"+getHost()+"/peers")
    const data = await res.json()
  return data
}

export const getNodeInfo = async()=>{
  const res =await fetch("https://"+getHost()+"/nodeinfo")
  const data = await res.json()
   return data
}

export const getDBInfo = async(dbaddress)=>{
  const res =await fetch("https://"+getHost()+"/dbinfo", {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddress:dbaddress})})
  const data = await res.json()
return data
}

export const getReadDB = async(dbaddress)=>{
  const res =await fetch("https://"+getHost()+"/read", {method:'POST',  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },body:JSON.stringify({dbaddress:dbaddress})})
  const data = await res.json()
return data
}