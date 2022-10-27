class Cache {
  setCache (key, value, isLocal = true) {
    if (!isLocal) {
      sessionStorage.setItem(key, JSON.stringify(value))
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }

  getCache (key, isLocal = true) {
    let value

    if (!isLocal) {
      value = sessionStorage.getItem(key)
    } else {
      value = localStorage.getItem(key)
    }

    if (value) {
      value = JSON.parse(value)
    }

    return value
  }

  deleteCache (key, isLocal = true) {
    if (!isLocal) {
      sessionStorage.removeItem(key)
    } else {
      localStorage.removeItem(key)
    }
  }

  clearCache () {
    sessionStorage.clear()
    localStorage.clear()
  }
}

export default new Cache()
