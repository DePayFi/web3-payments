import fetchMock from 'fetch-mock'

let mockAssets = ({ blockchain, account, assets })=>{
  fetchMock.get({
      url: `https://api.depay.pro/v1/assets?account=${account}&blockchain=${blockchain}`,
      headers: { 'X-Api-Key': 'Test123' },
      overwriteRoutes: true
    }, assets
  )
}

export {
  mockAssets
}
