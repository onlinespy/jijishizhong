function pad(value) {
  return String(value).padStart(2, '0')
}

function toDate(input) {
  if (input instanceof Date) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate())
  }

  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const parts = input.split('-').map(Number)
    return new Date(parts[0], parts[1] - 1, parts[2])
  }

  const date = input ? new Date(input) : new Date()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDate(input) {
  const date = toDate(input)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function formatTime(input) {
  const date = input ? new Date(input) : new Date()
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function today() {
  return formatDate(new Date())
}

function addDays(input, offset) {
  const date = toDate(input)
  date.setDate(date.getDate() + offset)
  return formatDate(date)
}

function diffDays(start, end) {
  const startTime = toDate(start).getTime()
  const endTime = toDate(end).getTime()
  return Math.round((endTime - startTime) / 86400000)
}

function weekday(input) {
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return labels[toDate(input).getDay()]
}

function formatChineseDate(input) {
  const date = toDate(input)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekday(date)}`
}

function formatMonth(input) {
  const date = toDate(input)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function monthGrid(input) {
  const date = toDate(input)
  const year = date.getFullYear()
  const month = date.getMonth()
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const leading = first.getDay()
  const cells = []

  for (let index = 0; index < leading; index += 1) {
    cells.push({ key: `blank-${index}`, blank: true })
  }

  for (let day = 1; day <= days; day += 1) {
    const value = `${year}-${pad(month + 1)}-${pad(day)}`
    cells.push({
      key: value,
      date: value,
      day,
      today: value === today()
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}`, blank: true })
  }

  return {
    year,
    month: month + 1,
    label: formatMonth(date),
    cells
  }
}

function timeToMinutes(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return 0
  }
  const parts = value.split(':').map(Number)
  return parts[0] * 60 + parts[1]
}

function minutesToTime(total) {
  const normalized = ((total % 1440) + 1440) % 1440
  return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`
}

module.exports = {
  addDays,
  diffDays,
  formatChineseDate,
  formatDate,
  formatMonth,
  formatTime,
  minutesToTime,
  monthGrid,
  timeToMinutes,
  toDate,
  today,
  weekday
}
