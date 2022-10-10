import featuresWorker from './features.worker?worker'

const pool: any = {}

export function executeTask(source: any, method: any, params: any) {
  return new Promise((resolve, reject) => {
    const worker = getWorker(source)
    worker.tasks.push({
      method,
      params,
      resolve,
      reject,
    })
    if (worker.tasks.length === 1) {
      resolveWorkerTasks(worker)
    }
  })
}

export function removeWorker(source: any) {
  if (pool[source]) {
    const removeSourceError = new Error()
    removeSourceError.name = 'AbortError'
    pool[source].tasks.forEach((t: any) => t.reject(removeSourceError))
    pool[source].worker.terminate()
    delete pool[source]
  }
}

function getWorker(source: any) {
  if (!pool[source]) {
    pool[source] = {
      worker: new featuresWorker(),
      tasks: [],
    }
    onmessage(pool[source])
    onerror(pool[source])
  }
  return pool[source]
}

function onmessage(w: any) {
  w.worker.onmessage = ({ data: { result } }: any) => {
    const task = w.tasks.shift()
    task.resolve(result)
    resolveWorkerTasks(w)
  }
}

function onerror(w: any) {
  w.worker.onerror = (err: any) => {
    const task = w.tasks.shift()
    resolveWorkerTasks(w)
    task.reject(err)
  }
}

function resolveWorkerTasks(w: any) {
  if (w.tasks.length > 0) {
    const { method, params } = w.tasks[0]
    w.worker.postMessage({ method, ...params })
  }
}
