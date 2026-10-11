const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const errors = []
const stats = {
  js: 0,
  json: 0,
  pages: 0,
  cloudFunctions: 0
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') {
        return []
      }
      return walk(target)
    }
    return [target]
  })
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/')
}

const files = walk(ROOT)

files.filter((file) => file.endsWith('.json')).forEach((file) => {
  stats.json += 1
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    errors.push(`${relative(file)} JSON 解析失败: ${error.message}`)
  }
})

files.filter((file) => file.endsWith('.js')).forEach((file) => {
  stats.js += 1
  try {
    const source = fs.readFileSync(file, 'utf8')
    new Function('require', 'module', 'exports', '__filename', '__dirname', source)
  } catch (error) {
    errors.push(`${relative(file)} JavaScript 语法失败: ${error.message}`)
  }
})

const appJsonPath = path.join(ROOT, 'miniprogram', 'app.json')
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))

appJson.pages.forEach((pagePath) => {
  stats.pages += 1
  const base = path.join(ROOT, 'miniprogram', pagePath)
  ;['.js', '.json', '.wxml', '.wxss'].forEach((extension) => {
    if (!fs.existsSync(base + extension)) {
      errors.push(`页面 ${pagePath} 缺少 ${extension} 文件`)
    }
  })
})

;((appJson.tabBar && appJson.tabBar.list) || []).forEach((item) => {
  if (!appJson.pages.includes(item.pagePath)) {
    errors.push(`TabBar 页面未注册: ${item.pagePath}`)
  }
})

if (appJson.tabBar && appJson.tabBar.custom) {
  const customTabRoot = path.join(ROOT, 'miniprogram', 'custom-tab-bar')
  ;['index.js', 'index.json', 'index.wxml', 'index.wxss'].forEach((filename) => {
    if (!fs.existsSync(path.join(customTabRoot, filename))) {
      errors.push(`自定义 TabBar 缺少 ${filename}`)
    }
  })
  ;[
    'home.png',
    'home-active.png',
    'records.png',
    'records-active.png',
    'articles.png',
    'articles-active.png',
    'profile.png',
    'profile-active.png'
  ].forEach((filename) => {
    if (!fs.existsSync(path.join(ROOT, 'miniprogram', 'assets', 'tabbar', filename))) {
      errors.push(`自定义 TabBar 缺少图标 ${filename}`)
    }
  })
}

const cloudRoot = path.join(ROOT, 'cloudfunctions')
fs.readdirSync(cloudRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .forEach((entry) => {
    stats.cloudFunctions += 1
    const functionRoot = path.join(cloudRoot, entry.name)
    if (!fs.existsSync(path.join(functionRoot, 'index.js'))) {
      errors.push(`云函数 ${entry.name} 缺少 index.js`)
    }
    if (!fs.existsSync(path.join(functionRoot, 'package.json'))) {
      errors.push(`云函数 ${entry.name} 缺少 package.json`)
    }
  })

const forbidden = [
  '快速瘦',
  '减脂神器',
  '7天瘦身',
  '治疗骨盆前倾',
  '根治驼背',
  '可以瘦',
  '瘦XX斤'
]
const allowedColors = new Set([
  '#2F7257',
  '#E6F1ED',
  '#FFFFFF',
  '#EEEEEE',
  '#333333',
  '#777777',
  '#999999',
  '#4C7FA3',
  '#D99A3D',
  '#D26E5B',
  '#E8F2F8',
  '#FBF4E7',
  '#E5E5E5',
  '#F5F5F5',
  '#206C54'
])

files
  .filter((file) => file.startsWith(path.join(ROOT, 'miniprogram')))
  .filter((file) => /\.(js|json|wxml|wxss)$/.test(file))
  .forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    forbidden.forEach((term) => {
      if (content.includes(term)) {
        errors.push(`${relative(file)} 出现禁止话术: ${term}`)
      }
    })
    if (/\.(wxss|wxml|js)$/.test(file)) {
      const colors = content.match(/#[0-9a-fA-F]{6}/g) || []
      colors.forEach((color) => {
        if (!allowedColors.has(color.toUpperCase())) {
          errors.push(`${relative(file)} 出现规范外颜色: ${color}`)
        }
      })
    }
    if (file.endsWith('.wxss') && /font-weight:\s*(700|800|900|bold)/.test(content)) {
      errors.push(`${relative(file)} 出现规范外字重`)
    }
    if (file.endsWith('.wxss')) {
      const fixedWidths = content.matchAll(/(?:min-)?width\s*:\s*(\d+)(rpx|px)/g)
      for (const match of fixedWidths) {
        const value = Number(match[1])
        const limit = match[2] === 'rpx' ? 750 : 375
        if (value > limit) {
          errors.push(`${relative(file)} 固定宽度超出屏幕: ${match[0]}`)
        }
      }
      if (/width\s*:\s*max-content/.test(content)) {
        errors.push(`${relative(file)} 使用了可能撑宽页面的 max-content`)
      }
    }
    if (file.endsWith('.wxml') && /scroll-x\s*=\s*["']true["']/.test(content)) {
      errors.push(`${relative(file)} 存在未受限的横向滚动容器`)
    }
  })

if (errors.length) {
  console.error('校验失败：')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log('校验通过')
console.log(`JavaScript: ${stats.js}`)
console.log(`JSON: ${stats.json}`)
console.log(`页面: ${stats.pages}`)
console.log(`云函数: ${stats.cloudFunctions}`)
