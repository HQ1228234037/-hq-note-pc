import twtRequest from '../../service'

export const $user = {
  updatePassword: data => twtRequest.put({
    url: '/user/updatePassword',
    data
  })
}
