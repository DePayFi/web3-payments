import fetchMock from 'fetch-mock'

let mockAssets = (blockchain, assets)=>{
  fetchMock.get({
      url: 'https://api.depay.pro/v1/assets?account=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&blockchain='+blockchain,
      headers: { 'X-Api-Key': 'Test123' },
      overwriteRoutes: true
    }, assets
  )
}

export {
  mockAssets
}
