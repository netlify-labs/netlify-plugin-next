/**
 * Next.js pluginAssign target to serverless
 */
module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    target: 'serverless'
  }
}
