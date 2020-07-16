# Next + Netlify Build Plugin

## How to use

1. Must set target to `serverless`

```
module.exports = {
  // Target must be serverless
  target: 'serverless'
}
```

2. Must set `functions` and `publish` directories to `out_functions` and `out_publish`


```toml
[build]
  command = "npm run build && npm run export"
  functions = "out_functions"
  publish   = "out_publish"

[[plugins]]
  package = "./plugins/next-plugin"
```
