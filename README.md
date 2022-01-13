# @taywa/swetch 🛤️

> Switching fetch

Easy mocking of your real API data, only by using your app.

## How to use it

Swetch replaces any `fetch`. Use the exported function to set up your swetch instance:

### Server

```javascript
import { server } from '@taywa/swetch'

server()
```

### Fetch

```javascript
import { swetch } from '@taywa/swetch'

const fetch = swetch({ server: 'http://localhost:8008' })
```

# API reference

## Server

| Property | Default |
| --- | --- |
| port | `8008` |
| dataDirectory | `".swetch"`

```javascript
server({
  port: 8008,
  dataDirectory: '.swetch',
})
```

## Swetch

| Property | Default | Description |
| --- | --- | --- |
| server | ! | The swetch server address |
| record | `false` | Whether to save requests made by this instance |
| origin |  | _Optional; only required when not requesting from a browser._ The host you want to request data from. |

> Properties with default values marked with _!_ are required.

```javascript
import { swetch } from '@taywa/swetch'

const fetch = swetch({
  server: 'http://localhost:8008',
  record: false,
  origin: 'http://localhost:8000',
})
```

## How it works

Swetch stands between your app and your API. Whenever your app would make a request, swetch sends that request's details to the swetch server instead, which then makes that request and returns the result to swetch, which in turn returns it to your app. Swetch is basically a proxy.

What this enables you to do is record these requests with the swetch server and at another time return them directly, removing the need for real infrastructure.

Swetch unintrusively ties into your preferred API client. Just replace your fetch with what's return from the swetch setup function.

# Important notes

## Don't use swetch in production environments

It's exclusively intended for real-world data mocking when testing your app.
