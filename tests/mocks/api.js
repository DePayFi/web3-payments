import fetchMock from 'fetch-mock'

let mockBestRoute = ({ fromAccounts, accept, allow, deny, delay, route })=>{
  
  const body = {
    accounts: fromAccounts,
    accept,
  }

  if(allow){ body.allow = allow }
  if(deny){ body.deny = deny }

  fetchMock.post({
      url: `https://public.depay.com/routes/best`,
      body,
      matchPartialBody: true,
      overwriteRoutes: true,
      delay
    },
    route
  )
}

let mockAllRoutes = ({ fromAccounts, accept, allow, deny, delay, routes })=>{
  const body = {
    accounts: fromAccounts,
    accept,
  }

  if(allow){ body.allow = allow }
  if(deny){ body.deny = deny }

  fetchMock.post({
      url: `https://public.depay.com/routes/all`,
      body,
      matchPartialBody: true,
      overwriteRoutes: true,
      delay
    },
    routes
  )
}

export {
  mockBestRoute,
  mockAllRoutes,
}
