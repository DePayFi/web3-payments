import fetchMock from 'fetch-mock'

let mockAssets = ({ blockchain, account, assets })=>{
  fetchMock.get({
      url: `https://api.depay.fi/v2/accounts/${blockchain}/${account}/assets`,
      headers: { 'X-Api-Key': 'Test123' },
      overwriteRoutes: true
    }, assets
  )
}

export {
  mockAssets
}
