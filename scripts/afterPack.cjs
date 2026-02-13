const { execSync } = require('child_process')
const path = require('path')

/**
 * Ad-hoc signs the macOS .app bundle after packing.
 * This fixes the "different Team IDs" crash by applying
 * a consistent ad-hoc signature to ALL binaries in the bundle.
 */
exports.default = async function (context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)

  console.log(`\n🔏 Ad-hoc signing: ${appPath}\n`)

  execSync(`codesign --force --deep --sign - "${appPath}"`, {
    stdio: 'inherit'
  })

  console.log(`✅ Ad-hoc signing complete\n`)
}
