const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { ncp } = require('ncp')
const { addRules } = require('gitignore-utils')
const copyFile = promisify(fs.copyFile)

const getCacheDirs = (constants) => [
  path.normalize(`${constants.PUBLISH_DIR}/../.next`),
]

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
    const cacheDirs = getCacheDirs(constants);
    console.log('run thing', constants)
    const cwd = process.cwd()

    const subprocess = utils.run(`next-on-netlify`, {
      cwd: cwd,
      shell: true,
      preferLocal: true,
      localDir: path.resolve(__dirname)
    })
    subprocess.stdout.pipe(process.stdout, { end: true })
    try {
      const { stdout } = await subprocess
    } catch (err) {
      throw new Error(err)
    }
    console.log('Copy')
    const nodeModulesPath = path.resolve(__dirname, 'node_modules')
    const pkg = path.resolve(__dirname, 'package.json')
    console.log('pkg', pkg)
    const functionsPath = path.resolve(cwd, 'out_functions')
    const functionsModulesPath = path.resolve(cwd, 'out_functions', 'node_modules')
    await copyDir(nodeModulesPath, functionsModulesPath)
    // await copyFile(pkg, path.resolve(functionsPath, 'package.json'))
    console.log('Copy done')
    if (await utils.cache.save(cacheDirs)) {
      console.log('Stored the Next cache to speed up future builds.');
    }
  },
}

function copyDir(source, destination) {
  return new Promise((resolve, reject) => {
    ncp(source, destination, function (err) {
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
