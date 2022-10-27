import axios from 'axios'
import $cache from '../../utils/cache'
import { Message } from "view-design";

class Request {
  constructor (config = {}) {
    this.instance = axios.create(config)
    this.interceptors = config.interceptors

    this.instance.interceptors.request.use(
      this.interceptors.requestInterceptors,
      this.interceptors.requestInterceptorsCatch
    )

    this.instance.interceptors.response.use(
      this.interceptors.responseInterceptors,
      this.interceptors.requestInterceptorsCatch
    )

    // 为所有的实例添加拦截器
    this.instance.interceptors.request.use(
      (config) => {
        return config
      },
      (err) => {
        console.log(err, '所有的实例 request')
        return err
      }
    )

    this.instance.interceptors.response.use(
      (res) => {
        const code = res.status
        if (code === 500) console.dir(res)
        if (code === 200) return res.data
        return res
      },
      (err) => {
        console.log(err, '所有的实例 response')
        return err
      }
    )
  }

  request (config) {
    return new Promise((resolve, reject) => {
      this.instance
        .request(config)
        .then((res) => {
          if (res.code !== 200 && res.code !== 401) {
            Message.error(res.message);
          }
          return resolve(res);
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  get (config) {
    const newConfig = Object.assign(config, { method: 'get' })
    return this.request(newConfig)
  }

  post (config) {
    let userId = $cache.getCache('userId');
    if (config.data !== undefined) {
      config.data.userId = userId;
    } else {
      config.data = Object.assign({userId});
    }
    const newConfig = Object.assign(config, { method: 'post' })
    return this.request(newConfig)
  }

  delete (config) {
    // let userId = $cache.getCache('userId');
    // if (config.data !== undefined) {
    //   config.data.userId = userId;
    // } else {
    //   config.data = Object.assign({userId});
    // }
    const newConfig = Object.assign(config, { method: 'delete' })
    return this.request(newConfig)
  }

  put (config) {
    let userId = $cache.getCache('userId');
    if (config.data !== undefined) {
      config.data.userId = userId;
    } else {
      config.data = Object.assign({userId});
    }
    const newConfig = Object.assign(config, { method: 'put' })
    return this.request(newConfig)
  }
}

export default Request
