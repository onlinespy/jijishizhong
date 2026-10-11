const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const COLLECTION = 'health_profiles'

function sanitizeSnapshot(snapshot) {
  const safe = Object.assign({}, snapshot || {})
  delete safe._id
  delete safe._openid
  delete safe._createdAt
  delete safe._updatedAt
  return safe
}

async function findUserDocument(openid) {
  const result = await db.collection(COLLECTION)
    .where({ _openid: openid })
    .limit(1)
    .get()
  return result.data[0] || null
}

async function getSnapshot(openid) {
  const document = await findUserDocument(openid)
  if (!document) {
    return {
      ok: true,
      data: null
    }
  }
  const data = Object.assign({}, document)
  delete data._id
  delete data._openid
  return {
    ok: true,
    data
  }
}

async function saveSnapshot(openid, snapshot) {
  const existing = await findUserDocument(openid)
  const payload = sanitizeSnapshot(snapshot)
  payload._updatedAt = db.serverDate()

  if (existing) {
    await db.collection(COLLECTION).doc(existing._id).update({
      data: payload
    })
  } else {
    payload._openid = openid
    payload._createdAt = db.serverDate()
    await db.collection(COLLECTION).add({
      data: payload
    })
  }

  return {
    ok: true
  }
}

async function clearSnapshot(openid) {
  const existing = await findUserDocument(openid)
  if (!existing) {
    return {
      ok: true
    }
  }

  await db.collection(COLLECTION).doc(existing._id).update({
    data: {
      fastingRecords: [],
      dietRecords: [],
      exerciseRecords: [],
      weightRecords: [],
      waterRecords: [],
      periodRecords: [],
      _updatedAt: db.serverDate()
    }
  })

  return {
    ok: true
  }
}

exports.main = async (event) => {
  const context = cloud.getWXContext()
  const openid = context.OPENID
  const action = event.action
  const payload = event.payload || {}

  if (!openid) {
    return {
      ok: false,
      message: '无法识别当前用户'
    }
  }

  try {
    if (action === 'getSnapshot') {
      return await getSnapshot(openid)
    }
    if (action === 'saveSnapshot') {
      return await saveSnapshot(openid, payload.snapshot)
    }
    if (action === 'clearSnapshot') {
      return await clearSnapshot(openid)
    }
    return {
      ok: false,
      message: '不支持的操作'
    }
  } catch (error) {
    console.error('health function error', error)
    return {
      ok: false,
      message: error.message || '云端数据处理失败'
    }
  }
}
