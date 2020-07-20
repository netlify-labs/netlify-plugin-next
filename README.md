# Next + Netlify Build Plugin

Plugin source code can be [found here](./next-plugin)

## How to use

1. Must set target to `serverless`

```js
module.exports = {
  // Target must be serverless
  target: 'serverless'
}
```

2. Must set `functions` and `publish` directories to `out_functions` and `out_publish`


```toml
[build]
  command = "npm run build"
  functions = "out_functions"
  publish   = "out_publish"

[[plugins]]
  package = "./next-plugin"
```
