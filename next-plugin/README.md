# Netlify Next.js Build Plugin

Enable Next.js dynamic routes on Netlify.

## Installation and Usage

1. Install the dependency from `npm`

    ```bash
    npm install @netlify/plugin-next
    ```

2. Then add the following lines to your `netlify.toml` file:

    ```toml
    [[plugins]]
      package = "@netlify/plugin-next"
    ```

3. Ensure that your `next.config.js` has the `target` set to `serverless`

    ```js
    // next.config.js
    module.exports = {
      // Target must be serverless
      target: 'serverless'
    };
    ```

4. Ensure the following values in `netlify.toml`.

    build `command` is `next build`, or running it under the hood.

    `function` dir is set to `out_functions`

    `publish` dir is set to `out_publish`

    ```toml
    [build]
      command = "next build"
      functions = "out_functions"
      publish   = "out_publish"
    ```

---

Config should ultimately look something like:

```toml
[build]
  command = "npm run build"
  functions = "out_functions"
  publish   = "out_publish"

[[plugins]]
  package = "@netlify/plugin-next"
```
