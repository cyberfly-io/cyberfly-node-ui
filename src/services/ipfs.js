import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'

let heliaInstance = null
let fsInstance = null

export const ensureHelia = async () => {
  if (heliaInstance && fsInstance) return { helia: heliaInstance, fs: fsInstance }
  heliaInstance = await createHelia()
  fsInstance = unixfs(heliaInstance)
  return { helia: heliaInstance, fs: fsInstance }
}

export const addFileToIPFS = async (file) => {
  const { fs } = await ensureHelia()
  const bytes = new Uint8Array(await file.arrayBuffer())
  const cid = await fs.addBytes(bytes)
  return cid.toString()
}

export const addBlobToIPFS = async (blob, name='file') => {
  const { fs } = await ensureHelia()
  const bytes = new Uint8Array(await blob.arrayBuffer())
  const cid = await fs.addBytes(bytes)
  return cid.toString()
}
