const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { ncp } = require('ncp')
const { addRules } = require('gitignore-utils')
const getCacheInfo = require('whats-in-the-cache')
const copyFile = promisify(fs.copyFile)
const readDirP = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const stat = promisify(fs.stat)

module.exports = {
  onPreBuild: async ({ constants, inputs, utils }) => {
    const { IS_LOCAL } = constants
    const cacheDirs = getCacheDirs(constants)
    const cwd = process.cwd()
    /* Ensure folders are gitignored */
    if (IS_LOCAL) {
      await ensureGitIgnore(cwd)
    }

    if (await utils.cache.restore(cacheDirs)) {
      console.log('Found a Next cache. We’re about to go FAST. ⚡️');
    } else {
      console.log('No Next cache found. Building fresh.');
    }
  },
  onBuild: async ({ constants, inputs, utils }) => {
    const { IS_LOCAL } = constants
    const cacheDirs = getCacheDirs(constants)
    const cwd = process.cwd()

    const subprocess = utils.run(`next-on-netlify`, {
      cwd: cwd,
      shell: true,
      preferLocal: true,
      localDir: path.resolve(__dirname)
    })
    // subprocess.stdout.pipe(process.stdout, { end: true })
    try {
      const { stdout } = await subprocess
    } catch (err) {
      throw new Error(err)
    }
    console.log('──────────────────────────────────────────────')
    console.log('Copy node_modules for next.js to functions...')

    const dir = (IS_LOCAL) ? path.resolve(__dirname, '../..') : __dirname
    const nodeModulesPath = (path.basename(dir) === 'node_modules') ? dir : path.resolve(dir, 'node_modules')
    const functionsPath = path.resolve(cwd, 'out_functions')
    const functionsModulesPath = path.resolve(cwd, 'out_functions', 'node_modules')
    await copyDir(nodeModulesPath, functionsModulesPath)
    console.log('✅ Copying complete.')
    console.log('──────────────────────────────────────────────')

    console.log('Modifying functions...')
    /* Tweak function contents */
    const files = await readDirP(functionsPath)
    const filesToEdit = files.filter((f) => {
      // Filter out api routes and node_modules
      return !f.match(/^next_api/) && f !== 'node_modules'
    }).map((f) => {
      // return full path to function wrapper
      return path.join(functionsPath, f, `${f}.js`)
    })
    // Read and update functions
    await Promise.all(filesToEdit.map((filePath) => {
      return readAndUpdate(filePath, inputs.debug)
    }))

    console.log('✅ Modify functions complete')

    const nextPath = path.resolve(cwd, '.next')
    const nextBuildIdPath = path.resolve(nextPath, 'BUILD_ID')
    const nextBuildId = await readFile(nextBuildIdPath, 'utf-8')

    console.log('──────────────────────────────────────────────')
    console.log('Next Build ID =', nextBuildId)
    console.log('──────────────────────────────────────────────')

    if (inputs.debug) {
      console.log('Debug enabled. Saving cache manifest...')
      // Output a manifest for cache defuallitng
      await getCacheInfo({
        cacheDirectory: constants.CACHE_DIR,
        outputPath: path.join(constants.PUBLISH_DIR, 'debug-next-cache.json') ,
      }).then(() => {
        console.log('✅ Cache manifest saved')
        console.log('──────────────────────────────────────────────')
      })
    }

    if (await utils.cache.save(cacheDirs)) {
      console.log('Stored the Next cache to speed up future builds.')
      console.log('──────────────────────────────────────────────')
    }
  }
}

function getCacheDirs(constants) {
  return [
    path.normalize(`${constants.PUBLISH_DIR}/../.next`),
  ]
}

async function readAndUpdate(filePath, debug) {
  const contents = await readFile(filePath, 'utf-8')
  if (contents.match(/__Re-write header for netlify__/)) {
    console.log('already written')
    return contents
  }
  let debugStart = ''
  if (debug) {
    debugStart = `
    console.log('───────────────────────')
    console.log(new Date())
    console.log('BEFORE response')
    console.log(response)
    `
  }
  let debugEnd = ''
  if (debug) {
    debugEnd = `
    console.log('AFTER response')
    console.log(response)
    console.log('───────────────────────')
    `
  }

  const newCode = `
  // __Re-write header for netlify__
  ${debugStart}

  // Fix next.js headers for Netlify
  Object.keys(response.multiValueHeaders).forEach((key) => {
    if (key === 'cache-control') {
      const cacheValue = response.multiValueHeaders[key]
      let value = Array.isArray(cacheValue) ? cacheValue[0]: cacheValue
      // Fix stale-while-revalidate
      if (value.match(/stale-while-revalidate$/)) {
        ${(debug) ? 'console.log("Replace stale-while-revalidate with stale-while-revalidate=60")' : ""}
        value = value.replace(/stale-while-revalidate$/, 'stale-while-revalidate=60')
      }
      // Fix default s-maxage
      if (value.match(/s-maxage=31536000/)) {
        ${(debug) ? "console.log('Replace s-maxage=31536000 with s-maxage=5')" : ""}
        value = value.replace(/s-maxage=31536000/, 's-maxage=5')
      }
      ${(debug) ? "console.log('new header value', value)" : ""}
      response.multiValueHeaders[key] = [ value ]
    }
  })

  ${debugEnd}
  // Invoke Callback`
  console.log(`Update ${path.basename(filePath)} code`)
  const newContents = contents.replace(/\/\/ Invoke callback/, newCode)
  await writeFile(filePath, newContents)
}

function copyDir(source, destination) {
  return new Promise((resolve, reject) => {
    ncp(source, destination, (err) => {
      if (err) reject(err)
      resolve()
    })
  })
}

async function ensureGitIgnore(cwd) {
  const gitIgnorePath = path.resolve(cwd, '.gitignore')
  await addRules(gitIgnorePath, [
    {
      comment: '# Next on Netlify',
      patterns: ['/out_publish', '/out_functions', '/404.html']
    }
  ])
}
