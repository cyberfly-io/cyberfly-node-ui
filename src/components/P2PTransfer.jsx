import React, { useEffect, useState, useCallback } from 'react'
import { Box, Card, CardContent, Typography, Stack, Button, LinearProgress, Chip, IconButton, Divider, TextField, Collapse } from '@mui/material'
import { CloudUpload, Download, ContentCopy, QrCode2 } from '@mui/icons-material'
import QRCode from 'react-qr-code'
import { useLibp2p } from '../contexts/Libp2pContext'
import { registerFileTransferHandler, sendFileToPeer, getEmitter, acceptIncoming, rejectIncoming } from '../services/p2pTransfer'
import { addBlobToIPFS } from '../services/ipfs'
import { multiaddr } from '@multiformats/multiaddr'

const P2PTransfer = () => {
  const { libp2pState } = useLibp2p()
  const [selectedPeer, setSelectedPeer] = useState('')
  const [file, setFile] = useState(null)
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [incoming, setIncoming] = useState([]) // {id,name,size,from,received,blob,cid,status,rateMbps}
  const [selfPeerId, setSelfPeerId] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [connectAttempts, setConnectAttempts] = useState([]) // {target, status, error}
  const [manualPeerInput, setManualPeerInput] = useState('')
  const [manualDialing, setManualDialing] = useState(false)
  const [manualError, setManualError] = useState('')
  const [urlPeerTarget, setUrlPeerTarget] = useState('')
  const [urlPeerAddr, setUrlPeerAddr] = useState('')
  const [urlPeerStatus, setUrlPeerStatus] = useState('idle') // idle | dialing | connected | error
  const [showQR, setShowQR] = useState(false)

  // init handler
  useEffect(() => {
    if (libp2pState) {
      registerFileTransferHandler(libp2pState)
      try { setSelfPeerId(libp2pState.peerId.toString()) } catch {}
      // build share link once multiaddrs ready
      try {
        const addrs = (libp2pState.getMultiaddrs?.() || []).filter(a => /webrtc|ws|wss/i.test(a.toString()))
        const primary = addrs[0] || (libp2pState.getMultiaddrs?.()[0])
        if (primary) {
          const url = new URL(window.location.href)
          url.hash = ''
          const base = url.origin + '/files'
          const link = `${base}#peer=${libp2pState.peerId.toString()}&addr=${encodeURIComponent(primary.toString())}`
          setShareLink(link)
        } else {
          const fallback = `${window.location.origin}/files#peer=${libp2pState.peerId.toString()}`
          setShareLink(fallback)
        }
      } catch {}
    }
  }, [libp2pState])

  // Parse URL hash once (no auto dial) so user can explicitly connect
  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
    if (!hash) return
    const params = new URLSearchParams(hash)
    const p = params.get('peer')
    const a = params.get('addr')
    if (p) {
      setUrlPeerTarget(p)
      if (a) setUrlPeerAddr(decodeURIComponent(a))
    }
  }, [])

  const connectUrlPeer = async () => {
    if (!libp2pState || !urlPeerTarget) return
    if (selfPeerId && urlPeerTarget === selfPeerId) return
    setUrlPeerStatus('dialing')
    try {
      if (urlPeerAddr) {
        try { await libp2pState.dial(multiaddr(urlPeerAddr)); setUrlPeerStatus('connected'); setConnectAttempts(prev => [...prev, { target: urlPeerTarget, status: 'connected (addr)' }]); return } catch (e) { console.warn('addr dial failed', e) }
      }
      await libp2pState.dial(urlPeerTarget)
      setUrlPeerStatus('connected')
      setConnectAttempts(prev => [...prev, { target: urlPeerTarget, status: 'connected' }])
      setSelectedPeer(urlPeerTarget)
    } catch (e) {
      setUrlPeerStatus('error')
      setConnectAttempts(prev => [...prev, { target: urlPeerTarget, status: 'error', error: e.message }])
    }
  }

  useEffect(() => {
    const emitter = getEmitter()
    const onOffer = offer => setIncoming(prev => [...prev, { id: offer.id, name: offer.name, size: offer.size, from: offer.from, received: 0, status: 'offer' }])
    const onAccepted = ({ id }) => setIncoming(prev => prev.map(it => it.id === id ? { ...it, status: 'receiving' } : it))
    const onProg = info => setIncoming(prev => prev.map(it => it.id === info.id ? { ...it, received: info.received, size: info.total, rateMbps: info.rateMbps } : it))
    const onComplete = info => setIncoming(prev => prev.map(it => it.id === info.id ? { ...it, received: it.size || it.received, blob: info.blob, status: 'done' } : it))
    const onRejected = ({ id }) => setIncoming(prev => prev.map(it => it.id === id ? { ...it, status: 'rejected' } : it))
    emitter.on('incoming-offer', onOffer)
    emitter.on('incoming-accepted', onAccepted)
    emitter.on('incoming-progress', onProg)
    emitter.on('incoming-complete', onComplete)
    emitter.on('incoming-rejected', onRejected)
    return () => {
      emitter.off('incoming-offer', onOffer)
      emitter.off('incoming-accepted', onAccepted)
      emitter.off('incoming-progress', onProg)
      emitter.off('incoming-complete', onComplete)
      emitter.off('incoming-rejected', onRejected)
    }
  }, [])

  const peers = (libp2pState?.getConnections() || []).map(c => c.remotePeer.toString())

  const manualDial = async () => {
    if (!libp2pState || !manualPeerInput.trim()) return
    setManualDialing(true)
    setManualError('')
    const target = manualPeerInput.trim()
    try {
      if (target.startsWith('/')) {
        // multiaddr path
        await libp2pState.dial(target)
      } else {
        await libp2pState.dial(target)
      }
      setConnectAttempts(prev => [...prev, { target, status: 'manual-connected' }])
      setSelectedPeer(target)
    } catch (e) {
      setManualError(e.message || 'Failed to connect')
      setConnectAttempts(prev => [...prev, { target, status: 'manual-error', error: e.message }])
    } finally {
      setManualDialing(false)
    }
  }

  const handleFileChange = e => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const send = useCallback(async () => {
    if (!libp2pState || !file || !selectedPeer) return
    setSending(true)
    setProgress(0)
    try {
      await sendFileToPeer(libp2pState, selectedPeer, file, (sent, total) => {
        setProgress(Math.min(100, (sent / total) * 100))
      })
    } catch (e) {
      console.error('P2P send failed', e)
    } finally {
      setSending(false)
    }
  }, [libp2pState, file, selectedPeer])

  const saveIncoming = (item) => {
    if (!item.blob) return
    const url = URL.createObjectURL(item.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = item.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const pinIncomingToIPFS = async (item) => {
    try {
      if (item.blob) {
        const cid = await addBlobToIPFS(item.blob, item.name)
        setIncoming(prev => prev.map(it => it === item ? { ...it, cid } : it))
      }
    } catch (e) { console.error('IPFS add failed', e) }
  }

  const transferLink = shareLink || (selfPeerId ? `${window.location.origin}/files#peer=${selfPeerId}` : '')

  return (
    <Card elevation={4} sx={{ mt: 4 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>P2P Direct Transfer</Typography>
          <Typography variant="body2" color="text.secondary">Share your Peer ID or link so others can connect and send you files directly over the libp2p network.</Typography>
          {selfPeerId && (
            <Box>
              <Typography variant="caption" color="text.secondary">Your Peer ID</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography sx={{ fontFamily: 'monospace', fontSize: '0.65rem', wordBreak: 'break-all', flex:1, bgcolor:'action.hover', p:1, borderRadius:1 }}>{selfPeerId}</Typography>
                <IconButton size="small" onClick={() => navigator.clipboard.writeText(selfPeerId)}><ContentCopy fontSize="inherit"/></IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display:'block' }}>Shareable Connection Link</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <TextField size="small" fullWidth value={transferLink} InputProps={{ readOnly:true, sx:{ fontSize:'0.65rem', fontFamily:'monospace' } }} />
                <IconButton size="small" onClick={() => navigator.clipboard.writeText(transferLink)}><ContentCopy fontSize="inherit"/></IconButton>
              </Stack>
              <Button size="small" sx={{ mt: 0.5 }} variant="outlined" onClick={() => navigator.clipboard.writeText(transferLink)}>Copy Link</Button>
              <Button size="small" sx={{ mt: 0.5, ml:1 }} startIcon={<QrCode2/>} variant={showQR? 'contained':'outlined'} onClick={() => setShowQR(v=>!v)}>{showQR? 'Hide QR' : 'Show QR'}</Button>
              <Collapse in={showQR} timeout="auto" unmountOnExit>
                <Box sx={{ mt:1, p:1, display:'inline-block', bgcolor:'background.paper', border:'1px solid', borderColor:'divider', borderRadius:1 }}>
                  <QRCode value={transferLink} size={140} style={{ width:'140px', height:'140px' }} />
                </Box>
              </Collapse>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Chip size="small" label={peers.length + ' peers'} />
              </Stack>
            </Box>
          )}
          {connectAttempts.length > 0 && (
            <Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">Connection Attempts</Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                {connectAttempts.map((a,i) => (
                  <Typography key={i} variant="caption" sx={{ fontFamily:'monospace' }}>{a.target.slice(0,16)}… : {a.status}{a.error? ' - '+a.error: ''}</Typography>
                ))}
              </Stack>
            </Box>
          )}
          <Divider />
          {urlPeerTarget && (
            <Card variant="outlined" sx={{ p:2, bgcolor: 'action.hover' }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">Connect to Shared Peer</Typography>
                <Typography variant="body2" sx={{ fontFamily:'monospace', wordBreak:'break-all' }}>{urlPeerTarget}</Typography>
                {urlPeerAddr && <Typography variant="caption" color="text.secondary">Addr: {urlPeerAddr}</Typography>}
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="contained" disabled={urlPeerStatus==='dialing'||urlPeerStatus==='connected'} onClick={connectUrlPeer}>
                    {urlPeerStatus==='dialing' ? 'Dialing...' : (urlPeerStatus==='connected' ? 'Connected' : 'Connect')}
                  </Button>
                  {urlPeerStatus==='error' && <Chip size="small" color="error" label="Failed" />}
                  {urlPeerStatus==='connected' && <Chip size="small" color="success" label="Connected" />}
                </Stack>
              </Stack>
            </Card>
          )}
          <Stack direction={{ xs:'column', md:'row' }} spacing={2} alignItems={{ md:'flex-end' }}>
            <Box sx={{ flex:1 }}>
              <Typography variant="caption" color="text.secondary">Select Peer</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt:0.5 }}>
                {peers.length === 0 && <Chip size="small" label="No peers connected" />}
                {peers.map(p => (
                  <Chip key={p} label={p.slice(0,10)+'…'} color={selectedPeer===p?'primary':'default'} onClick={() => setSelectedPeer(p)} sx={{ cursor:'pointer' }} />
                ))}
              </Stack>
              <Stack direction={{ xs:'column', sm:'row' }} spacing={1} sx={{ mt:1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Enter peerId or multiaddr to dial"
                  value={manualPeerInput}
                  onChange={e => setManualPeerInput(e.target.value)}
                  InputProps={{ sx:{ fontSize:'0.7rem', fontFamily:'monospace' } }}
                />
                <Button size="small" variant="contained" disabled={!manualPeerInput.trim()||manualDialing} onClick={manualDial}>
                  {manualDialing? 'Dialing...' : 'Dial'}
                </Button>
              </Stack>
              {manualError && <Typography variant="caption" color="error" sx={{ mt:0.5 }}>{manualError}</Typography>}
            </Box>
            <Box>
              <Button component="label" variant="outlined" startIcon={<CloudUpload/>}>
                {file? file.name.substring(0,18): 'Select File'}
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>
            <Button variant="contained" disabled={!file||!selectedPeer||sending} onClick={send}>{sending? 'Sending...' : 'Send File'}</Button>
          </Stack>
          {sending && (
            <Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height:8, borderRadius:4 }} />
              <Typography variant="caption" color="text.secondary">{progress.toFixed(1)}%</Typography>
            </Box>
          )}
          {file && !sending && progress === 100 && (<Chip size="small" color="success" label="Send Complete" />)}
          <Divider />
          <Typography variant="subtitle1" fontWeight={600}>Incoming Transfers</Typography>
          <Stack spacing={1}>
            {incoming.length === 0 && <Typography variant="body2" color="text.secondary">No incoming transfers yet.</Typography>}
            {incoming.map((it, idx) => {
              const pct = it.size ? (it.received / it.size) * 100 : (it.blob?100:0)
              const rate = it.rateMbps ? `${it.rateMbps.toFixed(2)} Mbps` : ''
              const remainingBytes = it.size ? (it.size - it.received) : 0
              const eta = it.rateMbps && it.rateMbps > 0 ? `${Math.max(1, Math.round((remainingBytes * 8) / (it.rateMbps * 1024 * 1024)))}s` : ''
              return (
                <Card key={idx} variant="outlined" sx={{ p:1 }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontFamily:'monospace', maxWidth: '60%', overflow:'hidden', textOverflow:'ellipsis' }}>{it.name}</Typography>
                      <Chip size="small" label={(it.size||0) + ' bytes'} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">From: {it.from.slice(0,20)}… {rate && `| ${rate}`}{eta && ` | ETA ${eta}`}</Typography>
                    <LinearProgress variant="determinate" value={pct} sx={{ height:6, borderRadius:3 }} />
                    <Stack direction="row" spacing={1} sx={{ mt:0.5 }}>
                      {it.status === 'offer' && (
                        <>
                          <Button size="small" variant="contained" onClick={() => acceptIncoming(it.id)}>Accept</Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => rejectIncoming(it.id)}>Reject</Button>
                        </>
                      )}
                      {it.status === 'receiving' && <Chip size="small" label="Receiving" />}
                      {it.status === 'rejected' && <Chip size="small" color="warning" label="Rejected" />}
                      {it.status === 'done' && (
                        <>
                          <Button size="small" variant="outlined" startIcon={<Download/>} disabled={!it.blob} onClick={() => saveIncoming(it)}>Save</Button>
                          <Button size="small" variant="outlined" disabled={!it.blob||it.cid} onClick={() => pinIncomingToIPFS(it)}>{it.cid? 'Pinned' : 'Pin to IPFS'}</Button>
                          {it.cid && <Chip size="small" color="success" label={it.cid.slice(0,10)+'…'} />}
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              )
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default P2PTransfer
