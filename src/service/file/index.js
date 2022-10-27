import twtRequest from '../../service'

export const $file = {
  getFolderList: data => twtRequest.post({
    url: '/folder/getFolderList',
    data
  }),
  getNoteList: data => twtRequest.post({
    url: '/note/getNoteList',
    data
  }),
  getNote: data => twtRequest.post({
    url: '/note/getNote',
    data
  }),
  deleteNote: data => twtRequest.delete({
    url: '/note/deleteNote',
    data
  }),
  deleteFolder: data => twtRequest.delete({
    url: '/folder/deleteFolder',
    data
  }),
  addFolder: data => twtRequest.post({
    url: '/folder/addFolder',
    data
  }),
  updateFolder: data => twtRequest.put({
    url: '/folder/updateFolder',
    data
  }),
  addNote: data => twtRequest.post({
    url: '/note/addNote',
    data
  }),
  updateNote: data => twtRequest.put({
    url: '/note/updateNote',
    data
  })
}
