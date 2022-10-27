import twtRequest from '../../service'

export const $login = {
  login: (data) => twtRequest.post({
    url: '/user/login',
    data
  })
}
