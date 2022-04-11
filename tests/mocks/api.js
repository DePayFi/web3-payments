import fetchMock from 'fetch-mock'

let mockAssets = ({ blockchain, delay, account, assets })=>{
  fetchMock.get({
      url: `https://public.depay.fi/accounts/${blockchain}/${account}/assets`,
      overwriteRoutes: true,
      delay
    }, assets
  )
}

export {
  mockAssets
}
