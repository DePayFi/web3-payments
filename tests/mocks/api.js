import fetchMock from 'fetch-mock'

let mockAssets = ({ blockchain, account, assets })=>{
  fetchMock.get({
      url: `https://public.depay.fi/accounts/${blockchain}/${account}/assets`,
      overwriteRoutes: true
    }, assets
  )
}

export {
  mockAssets
}
