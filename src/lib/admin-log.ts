import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'data', 'admin-logs.json')

type LogEntry = {
  id: string
  action: string
  details: string
  ip: string
  timestamp: string
}

export async function addLog(action: string, details = '', ip = '') {
  try {
    await mkdir(path.dirname(LOG_FILE), { recursive: true })
    let logs: LogEntry[] = []
    try {
      const existing = await readFile(LOG_FILE, 'utf-8')
      logs = JSON.parse(existing)
    } catch { /* no existing file */ }

    logs.unshift({
      id: crypto.randomUUID(),
      action,
      details,
      ip,
      timestamp: new Date().toISOString(),
    })

    if (logs.length > 500) logs = logs.slice(0, 500)
    await writeFile(LOG_FILE, JSON.stringify(logs, null, 2))
  } catch (e) {
    console.error('Failed to write admin log:', e)
  }
}

export async function getLogs(limit = 50): Promise<LogEntry[]> {
  try {
    const data = await readFile(LOG_FILE, 'utf-8')
    const logs: LogEntry[] = JSON.parse(data)
    return logs.slice(0, limit)
  } catch {
    return []
  }
}
