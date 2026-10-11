const fs = require('fs')
const path = require('path')

const bundleRoot = 'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
const lucide = require(path.join(bundleRoot, 'lucide'))
const sharp = require(path.join(bundleRoot, 'sharp'))

const outputDir = path.resolve(__dirname, '..', 'miniprogram', 'assets', 'tabbar')
const icons = {
  home: lucide.House,
  records: lucide.ClipboardList,
  articles: lucide.BookOpen,
  profile: lucide.UserRound
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function renderChildren(children) {
  return children.map(([tag, attributes]) => {
    const attrText = Object.keys(attributes)
      .map((key) => `${key}="${escapeAttribute(attributes[key])}"`)
      .join(' ')
    return `<${tag} ${attrText} />`
  }).join('')
}

function createSvg(children, color, strokeWidth) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"',
    ' fill="none"',
    ` stroke="${color}"`,
    ` stroke-width="${strokeWidth}"`,
    ' stroke-linecap="round"',
    ' stroke-linejoin="round">',
    renderChildren(children),
    '</svg>'
  ].join('')
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })

  for (const [name, children] of Object.entries(icons)) {
    await sharp(Buffer.from(createSvg(children, '#777777', 2.2)))
      .png()
      .toFile(path.join(outputDir, `${name}.png`))
    await sharp(Buffer.from(createSvg(children, '#2F7257', 2.7)))
      .png()
      .toFile(path.join(outputDir, `${name}-active.png`))
  }

  console.log(`Generated ${Object.keys(icons).length * 2} tab icons`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
