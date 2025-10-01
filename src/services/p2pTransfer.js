// Minimal event emitter (browser friendly)
class SimpleEmitter {
  constructor () { this.l = {} }
  on (e, fn) { (this.l[e] = this.l[e] || new Set()).add(fn); return this }
  off (e, fn) { this.l[e]?.delete(fn); return this }
  emit (e, ...a) { this.l[e]?.forEach(fn => { try { fn(...a) } catch (err) { console.error(err) } }) }
}

// Protocol constant (distinct namespace from video)
export const FILE_TRANSFER_PROTOCOL = '/cyberfly/file-transfer/2.0.0'

// Simple singleton to avoid re-registering handler
const state = {
  registered: false,
  emitter: new SimpleEmitter(),
  libp2p: null,
  incoming: new Map() // id -> { meta, stream, reader, received, chunks, status }
}

export const getEmitter = () => state.emitter

// Helper: frame builder (length-prefixed)
const encodeFrame = (u8) => {
  const lenBuf = new Uint8Array(4)
  new DataView(lenBuf.buffer).setUint32(0, u8.length, false)
  const out = new Uint8Array(4 + u8.length)
  out.set(lenBuf, 0); out.set(u8, 4)
  return out
}

// Frame reader builder (pull-based)
function createFrameReader (sourceAsyncIterable) {
  let buffer = new Uint8Array(0)
  const iterator = sourceAsyncIterable[Symbol.asyncIterator]()
  async function readFrame () {
    while (true) {
      if (buffer.length >= 4) {
        const len = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength).getUint32(0, false)
        if (buffer.length >= 4 + len) {
          const frame = buffer.slice(4, 4 + len)
            buffer = buffer.slice(4 + len)
            return frame
        }
      }
      const { value, done } = await iterator.next()
      if (done) return null
      if (value instanceof Uint8Array) {
        const merged = new Uint8Array(buffer.length + value.length)
        merged.set(buffer, 0); merged.set(value, buffer.length)
        buffer = merged
      }
    }
  }
  return { readFrame }
}

export const registerFileTransferHandler = (libp2p) => {
  if (state.registered && state.libp2p === libp2p) return
  state.libp2p = libp2p
  libp2p.handle(FILE_TRANSFER_PROTOCOL, async ({ stream, connection }) => {
    const id = `${connection.remotePeer.toString()}-${Date.now()}-${Math.random().toString(36).slice(2)}`
    let reader
    try {
      reader = createFrameReader(stream.source)
      const metaFrame = await reader.readFrame()
      if (!metaFrame) { await stream.close?.(); return }
      let meta
      try { meta = JSON.parse(new TextDecoder().decode(metaFrame)) } catch { await stream.close?.(); return }
      state.incoming.set(id, { meta, stream, reader, received: 0, chunks: [], status: 'offer', from: connection.remotePeer.toString(), start: Date.now() })
      state.emitter.emit('incoming-offer', { id, ...meta, from: connection.remotePeer.toString() })
    } catch (e) {
      state.emitter.emit('incoming-error', e)
      try { await stream.close?.() } catch {}
    }
  })
  state.registered = true
}

export const sendFileToPeer = async (libp2p, peerId, file, onProgress) => {
  const { stream } = await libp2p.dialProtocol(peerId, FILE_TRANSFER_PROTOCOL)
  const fileReader = file.stream().getReader()
  let sent = 0
  // send metadata first
  const meta = { name: file.name, size: file.size, type: file.type || 'application/octet-stream', ts: Date.now() }
  const metaFrame = encodeFrame(new TextEncoder().encode(JSON.stringify(meta)))
  // create a duplex adapter: we manually write using sink after building iterable
  const frames = []
  frames.push(metaFrame)
  // send frames lazily via async generator
  const pull = (async function * () {
    // metadata
    yield frames.shift()
    // wait for approval response
    const reader = createFrameReader(stream.source)
    const approval = await reader.readFrame()
    if (!approval || approval.length === 0 || approval[0] !== 1) {
      // rejected or invalid
      state.emitter.emit('send-rejected', { peerId: peerId.toString?.() || peerId, name: file.name })
      return
    }
    // approved -> start streaming
    let done, value
    while (true) {
      ({ done, value } = await fileReader.read())
      if (done) break
      const u8 = value instanceof Uint8Array ? value : new Uint8Array(value)
      sent += u8.length
      if (onProgress) onProgress(sent, file.size)
      yield encodeFrame(u8)
    }
  })()
  await stream.sink(pull)
  return { bytesSent: sent }
}

// Accept incoming offer
export const acceptIncoming = async (id) => {
  const item = state.incoming.get(id)
  if (!item || item.status !== 'offer') return
  try {
    // send approval
    await item.stream.sink((async function * () { yield encodeFrame(Uint8Array.of(1)) })())
  } catch {}
  item.status = 'receiving'
  state.emitter.emit('incoming-accepted', { id })
  // start reading frames
  ;(async () => {
    try {
      while (true) {
        const frame = await item.reader.readFrame()
        if (!frame) break
        item.received += frame.length
        item.chunks.push(frame)
        state.emitter.emit('incoming-progress', { id, name: item.meta.name, from: item.from, received: item.received, total: item.meta.size, rateMbps: calcRate(item) })
        if (item.meta.size && item.received >= item.meta.size) break
      }
      const blob = new Blob(item.chunks, { type: item.meta.type || 'application/octet-stream' })
      item.status = 'done'
      state.emitter.emit('incoming-complete', { id, ...item.meta, from: item.from, blob })
      try { await item.stream.close?.() } catch {}
    } catch (e) {
      item.status = 'error'
      state.emitter.emit('incoming-error', { id, error: e.message })
      try { await item.stream.close?.() } catch {}
    }
  })()
}

// Reject incoming offer
export const rejectIncoming = async (id) => {
  const item = state.incoming.get(id)
  if (!item || item.status !== 'offer') return
  try { await item.stream.sink((async function * () { yield encodeFrame(Uint8Array.of(0)) })()) } catch {}
  item.status = 'rejected'
  state.emitter.emit('incoming-rejected', { id })
  try { await item.stream.close?.() } catch {}
}

function calcRate (item) {
  const secs = (Date.now() - item.start) / 1000
  if (secs <= 0) return 0
  return (item.received * 8) / (secs * 1024 * 1024) // Mbps
}

