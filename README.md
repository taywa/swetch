# @taywa/swetch 🛤️

> Switching fetch

Easily mock your real API data, simply by using your app.

## How to use it

Swetch replaces any `fetch`. Use the exported function to set up your swetch instance.

### Set up a server first

We need something that can save the request data.

```shell
npx @taywa/swetch
```

> Needs node 14+ for latest syntax. We recommend running this in a docker container.

### Get your fake fetch

```javascript
const fetch = swetch({ record: process.env.SWETCH_RECORD })
```

> When `record` is truthy, requests are passed through and response data is saved. When falsy, saved response data is returned instead.

### And pass it to your app

#### Plain old fetch

```javascript
const testFetch = swetch(/* swetch config */)

testFetch(
  'http://your.app/some/resource',
  {
    method: 'post',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'cool'
    })
  }
)
  .then(response => response.json())
  .then(json => {})
  .catch(error => {})
```

#### Apollo Client

```javascript
const testClient = new ApolloClient({
  link: new HttpLink({
    fetch: swetch(/* swetch config */)
  })
})
```

#### Axios

```javascript
const testInstance = axios.create()

testInstance.interceptors.request.use(
  axiosInterceptor(/* swetch config */)
)
```

> Configuring these clients might vary slightly when using versions made for specific frameworks.

## Package exports

This package doesn't provide a main entry point, since it provides separate server and browser modules (f.e. server uses `fs`, which isn't available in browsers and would brick browser imports). There are several exports for this package, pick the one that works best for you.

```javascript
// latest syntax es modules
import swetch from '@taywa/swetch/src/lib/swetch'
import axiosInterceptor from '@taywa/swetch/src/lib/axiosInterceptor'
import server from '@taywa/swetch/src/lib/server'

// transpiled es modules
import swetch from '@taywa/swetch/dist/mjs/swetch'
import axiosInterceptor from '@taywa/swetch/dist/mjs/axiosInterceptor'
import server from '@taywa/swetch/dist/mjs/server'

// transpiled common js
const swetch = require('@taywa/swetch/dist/cjs/swetch')
const axiosInterceptor = require('@taywa/swetch/dist/cjs/axiosInterceptor')
const server = require('@taywa/swetch/dist/cjs/server')
```

### Hit record

When you're recording, run the parts of your app you want to mock (f.e. visit the pages you want to test) and you should see swetch saving the responses (in [`.swetch`](.swetch) by default).

When not recording, that data is used instead of passing the request on.

> Note that only exact same requests will return the same data. Passing different variables in the post body of a request to the same URL will result in a 404 response, if not specifically recorded.

# API reference

## Server

| Property | Default | Info |
| --- | --- | --- |
| port | `8008` | The port the server should listen on |
| dataDirectory | `'.swetch'` | The directory to save data to |
| getRequestHash | [server:33](src/lib/server.mjs) | A function taking a request URL string & an init object, and returning a string identifying that request. Allows for customization if requests contain timestamped data. _Not available via cli/npx._ |
| getRelativeResourceDirectory | [server:44](src/lib/server.mjs) | A function taking a URL string & an init object, and returning a directory path string. Allows for customization of subfolders. _Not available via cli/npx._ |

```javascript
server({
  port: 8009,
  dataDirectory: '.responses',
  getRequestHash: (resource, init) => resource.replace(/\/+/g, '-'),
  getRelativeResourceDirectory: (resource, init) => '/'
})
```

## Swetch

| Property | Default | Info |
| --- | --- | --- |
| server | `'http://localhost:8008'` | The swetch server address |
| record | `false` | Whether to save requests made by this instance |
| origin |  | The host where your data resides (falls back onto `location.host`). Only required if swetch server doesn't run on the origin, f.e. if it runs in a docker container. |

```javascript
const testFetch = swetch({
  server: 'http://localhost:8009',
  record: !process.env.IS_CI,
  origin: 'http://mycontainer',
})

const testInterceptor = axiosInterceptor({
  server: 'http://localhost:8009',
  record: !process.env.IS_CI,
  origin: 'http://mycontainer',
})
```

## How it works

Swetch stands between your app and your API. Whenever your app would make a request, swetch sends that request's details to the swetch server instead, which then makes that request and returns the result to swetch, which in turn returns it to your app. Swetch is basically a proxy.

What this enables you to do is record these requests with the swetch server and at another time return them directly, removing the need for real infrastructure.

Swetch unintrusively ties into your preferred API client. Just replace your fetch with what's returned from the swetch setup function.

> Swetch uses [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) and can be used on server and client side.

> Requests are identified by the hash of the arguments passed to the "fetch" replacement.

# Important notes

## Don't use swetch in production environments

It's exclusively intended for real-world-data mocking during testing and doesn't guarantee performance or security.
