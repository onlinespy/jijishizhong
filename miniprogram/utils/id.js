function createId(prefix) {
  const stamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix || 'id'}_${stamp}_${random}`
}

module.exports = {
  createId
}
