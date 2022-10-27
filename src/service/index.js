import Request from './request'
import Cache from '../utils/cache'
import router from '../router/index'
import { Message } from "view-design";

const twtRequest = new Request({
  baseURL: 'http://localhost:8080/note',
  timeout: 10000,
  interceptors: {
    requestInterceptors: (config) => {
      const token = Cache.getCache('token')
      if (token) config.headers.Authorization = token

      let userId = Cache.getCache('userId');
      if (config.data !== undefined) {
        config.data.userId = userId;
      } else {
        config.data = Object.assign({userId});
      }

      return config
    },
    requestInterceptorsCatch: (err) => {
      console.log('请求错误被拦截')
      return err
    },
    responseInterceptors: (res) => {
      // console.log('实例的response')
      if (res.data.code === 401) {
        Message.error('登录已过期，请重新登录')
        router.push('/')
      }
      return res
    },
    responseInterceptorsCatch: (err) => {
      console.log(err)
      return err
    }
  }
})

export default twtRequest
