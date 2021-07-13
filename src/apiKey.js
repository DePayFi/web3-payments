import { setApiKey as setCryptoWalletApiKey } from 'depay-crypto-wallets'

let apiKey = undefined

function setApiKey(key) {
  apiKey = key
  setCryptoWalletApiKey(apiKey)
}

function getApiKey() {
  if (apiKey === undefined) {
    throw 'PaymentRouting: No apiKey set. Please set an apiKey with setApiKey (see documentation)!'
  }
  return apiKey
}

export { setApiKey, getApiKey }
