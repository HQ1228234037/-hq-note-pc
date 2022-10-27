<template>
    <div class="layout">
        <Layout class="layout">
            <Header>
                <Menu mode="horizontal" theme="dark" active-name="1">
                    <div class="layout-logo">Note</div>
                    <div class="layout-nav">
                        <MenuItem name="4" style="font-size: 16px; line-height: 64px;">
                            <Dropdown>
                                <p>
                                    <Icon type="md-person"></Icon>
                                    {{ nickName }}
                                </p>
                                <DropdownMenu slot="list">
                                    <DropdownItem @click.native="showUpdatePassword">修改密码</DropdownItem>
                                    <DropdownItem divided @click.native="logout">退出</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Layout>
                <Split v-model="split1" style="padding: 0; margin: 0; height: 100%; width: 100%;">
                    <Sider slot="left" class="folderTree" hide-trigger>
                        <div style="height: 50px; width: 100%; line-height: 50px; margin-left: 10px;">
                            <Button class="addFolder" size="small" type="text" @click="showCreateFolder(0)">新建文件夹
                            </Button>
                        </div>
                        <div style="width:100%; height:0; border-top:1px rgba(117,117,117,0.3) dashed;"/>
                        <Tree :data="folderList" :load-data="loadData" @on-contextmenu="handleContextMenu"
                              @on-select-change="showNote" @on-toggle-expand="toggleExpand" empty-text=""
                              style="margin-left: 10px; margin-top: 10px;">
                            <template slot="contextMenu">
                                <DropdownItem @click.native="showUpdateFolder">重命名</DropdownItem>
                                <DropdownItem @click.native="showCreateNote">新建笔记</DropdownItem>
                                <DropdownItem @click.native="showCreateFolder">新建文件夹</DropdownItem>
                                <DropdownItem @click.native="deleteFolder" style="color: #ed4014">删除
                                </DropdownItem>
                            </template>
                        </Tree>
                    </Sider>

                    <Layout slot="right" style="height: 100%"
                            :style="{padding: '0 0px 0px', backgroundColor: '#FFFFFF'}">
                        <Content v-if="showNoteInfo"
                                 :style="{padding: '24px', minHeight: '280px', background: 'white', paddingTop: '0', width: 'inherit'}">
                            <div style="margin: 0; width: 100%; height: 50px; line-height: 50px;">
                                <Button type="text" @click="showNote">查看</Button>
                                <Button type="text" @click="editNote">编辑</Button>
                                <Button type="text" @click="deleteNote">删除</Button>
                                <Button type="text" @click="showUpdateNoteTitle">重命名</Button>
                            </div>
                            <div v-if="edit" class="markdown">
                                <mavon-editor ref="noteMarkdown" class="editNote" v-model="noteInfo.noteContent"
                                              :ishljs="true" @save="save(null, true)" @imgAdd="addImg"/>
                            </div>
                            <div class="showNoteParent" v-if="show">
                                <mavon-editor class="showNote" v-model="noteInfo.noteContent"
                                              :subfield="false"
                                              :defaultOpen="'preview'"
                                              :toolbarsFlag="false"
                                              :editable="false"
                                              :scrollStyle="true"
                                              :ishljs="true"/>
                            </div>
                        </Content>
                    </Layout>
                </Split>
            </Layout>
        </Layout>

        <Modal v-model="showCreateFolderBox" @on-ok="createFolder" :on-visible-change="false" draggable scrollable
               sticky :mask="false" title="添加文件夹" :loading="createFolderLoading" @submit.native.prevent>
            <Form ref="folderInfo" :model="folderInfo" :rules="folderInfoRuleInline">
                <FormItem prop="folderName">
                    <Input type="text" v-model="folderInfo.folderName" placeholder="文件夹名称"/>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="showUpdateFolderBox" @on-ok="updateFolder" :on-visible-change="false" draggable scrollable
               sticky :mask="false" title="重命名文件夹" :loading="updateFolderLoading" @submit.native.prevent>
            <Form ref="updateFolderInfo" :model="updateFolderInfo" :rules="updateFolderInfoRuleInline">
                <FormItem prop="folderName">
                    <Input type="text" v-model="updateFolderInfo.folderName" placeholder="文件夹名称"/>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="showCreateNoteBox" @on-ok="createNote" :on-visible-change="false" draggable scrollable
               sticky :mask="false" title="新建笔记" :loading="createNoteLoading" @submit.native.prevent>
            <Form ref="createNoteInfo" :model="createNoteInfo" :rules="createNoteInfoRuleInline">
                <FormItem prop="noteTitle">
                    <Input type="text" v-model="createNoteInfo.noteTitle" placeholder="笔记名称"/>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="showUpdateNoteTitleBox" @on-ok="updateNoteTitle" :on-visible-change="false" draggable scrollable
               sticky :mask="false" title="笔记重命名" :loading="updateNoteTitleLoading" @submit.native.prevent>
            <Form ref="updateNoteTitleInfo" :model="updateNoteTitleInfo" :rules="updateNoteTitleInfoRuleInline">
                <FormItem prop="noteTitle">
                    <Input type="text" v-model="updateNoteTitleInfo.noteTitle" placeholder="笔记名称"/>
                </FormItem>
            </Form>
        </Modal>
        <Modal v-model="showUpdatePasswordBox" @on-ok="updatePassword" :on-visible-change="false" draggable scrollable
               sticky :mask="false" title="修改密码" :loading="updatePasswordLoading" @submit.native.prevent>
            <Form ref="updatePasswordInfo" :model="updatePasswordInfo" :rules="updatePasswordInfoRuleInline">
                <FormItem prop="oldPassword">
                    <Input type="password" v-model="updatePasswordInfo.oldPassword" placeholder="旧密码"/>
                </FormItem>
                <FormItem prop="newPassword">
                    <Input type="password" v-model="updatePasswordInfo.newPassword" placeholder="新密码"/>
                </FormItem>
                <FormItem prop="confirmNewPassword">
                    <Input type="password" v-model="updatePasswordInfo.confirmNewPassword" placeholder="确认密码"/>
                </FormItem>
            </Form>
        </Modal>
    </div>
</template>

<script>
import {$file} from '@/service/file'
import {$user} from '@/service/user'
import md5 from "js-md5";
import {mavonEditor} from "mavon-editor";
import axios from 'axios';

export default {
    name: "main",
    data() {
        const validateConfirmPassword = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('确认密码不能为空'));
            } else if (value !== this.updatePasswordInfo.newPassword) {
                callback(new Error('两个密码不一致'));
            } else {
                callback();
            }
        };
        return {
            nickName: '',
            folderList: [],
            split1: 0.1,
            hljsCss: 'agate',
            noteInfo: {
                noteId: 0,
                noteTitle: '',
                noteContent: ''
            },
            showNoteInfo: false,
            show: true,
            edit: false,

            showCreateFolderBox: false,
            createFolderLoading: true,
            folderParentId: 0,
            folderInfo: {
                folderName: ''
            },
            folderInfoRuleInline: {
                folderName: [
                    {required: true, message: '文件夹名称不能为空', trigger: 'blur'}
                ]
            },

            showUpdateFolderBox: false,
            updateFolderLoading: true,
            updateFolderInfo: {
                folderId: 0,
                folderName: ''
            },
            updateFolderInfoRuleInline: {
                folderName: [
                    {required: true, message: '文件夹名称不能为空', trigger: 'blur'}
                ]
            },

            showCreateNoteBox: false,
            createNoteLoading: true,
            createNoteInfo: {
                noteTitle: ''
            },
            createNoteInfoRuleInline: {
                noteTitle: [
                    {required: true, message: '笔记名称不能为空', trigger: 'blur'}
                ]
            },

            showUpdateNoteTitleBox: false,
            updateNoteTitleLoading: true,
            updateNoteTitleInfo: {
                noteTitle: ''
            },
            updateNoteTitleInfoRuleInline: {
                noteTitle: [
                    {required: true, message: '笔记名称不能为空', trigger: 'blur'}
                ]
            },

            showUpdatePasswordBox: false,
            updatePasswordLoading: true,
            updatePasswordInfo: {
                oldPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            },
            updatePasswordInfoRuleInline: {
                oldPassword: [
                    {required: true, message: '旧密码不能为空', trigger: 'blur'},
                    {type: 'string', min: 6, message: '密码不能少于6位', trigger: 'blur'}
                ],
                newPassword: [
                    {required: true, message: '新密码不能为空', trigger: 'blur'},
                    {type: 'string', min: 6, message: '密码不能少于6位', trigger: 'blur'}
                ],
                confirmNewPassword: [
                    {required: true, message: '确认密码不能为空', trigger: 'blur'},
                    {type: 'string', min: 6, message: '密码不能少于6位', trigger: 'blur'},
                    {validator: validateConfirmPassword, trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        /**
         * 异步加载笔记列表
         * @param item 文件夹信息
         * @param callback 回调显示笔记列表使用
         */
        loadData(item, callback) {
            let noteList = [];
            if (item.noteCount > 0) {
                $file.getNoteList({'folderId': item.folderId}).then(res => {
                    if (res.code === 200) {
                        let notes = res.data;
                        notes.forEach(note => {
                            let returnNote = {
                                noteId: note.noteId,
                                title: note.noteTitle,
                                contextmenu: false,
                                render: (h, {root, note, data}) => {
                                    return h('span', {
                                        style: {
                                            display: 'inline-block',
                                            width: '100%'
                                        }
                                    }, [
                                        h('span', [
                                            h('Icon', {
                                                props: {
                                                    type: 'ios-paper-outline'
                                                },
                                                style: {
                                                    marginRight: '6px',
                                                    lineHeight: '21px'
                                                }
                                            }),
                                            h('span', data.title)
                                        ]),
                                        h('span', {
                                            style: {
                                                display: 'inline-block',
                                                float: 'right',
                                                marginRight: '32px'
                                            }
                                        }, [])
                                    ]);
                                }
                            }
                            noteList.push(returnNote);
                        })
                        item.currentNoteCount = notes.length;
                        callback(noteList);
                    }
                }).catch(err => {
                    this.$Message.error(err);
                });
            }
        },
        /**
         * 切换树节点展开/隐藏状态
         */
        toggleExpand(item) {
            if (item.noteCount > 0 && item.currentNoteCount === 0) {
                item.loadData = true;

                let noteList = item.children;
                $file.getNoteList({'folderId': item.folderId}).then(res => {
                    if (res.code === 200) {
                        let notes = res.data;
                        notes.forEach(note => {
                            let returnNote = {
                                noteId: note.noteId,
                                title: note.noteTitle,
                                contextmenu: false,
                                render: (h, {root, note, data}) => {
                                    return h('span', {
                                        style: {
                                            display: 'inline-block',
                                            width: '100%'
                                        }
                                    }, [
                                        h('span', [
                                            h('Icon', {
                                                props: {
                                                    type: 'ios-paper-outline'
                                                },
                                                style: {
                                                    marginRight: '6px',
                                                    lineHeight: '21px'
                                                }
                                            }),
                                            h('span', data.title)
                                        ]),
                                        h('span', {
                                            style: {
                                                display: 'inline-block',
                                                float: 'right',
                                                marginRight: '32px'
                                            }
                                        }, [])
                                    ]);
                                }
                            }
                            noteList.push(returnNote);
                        })
                        item.children = noteList;
                        item.currentNoteCount = notes.length;
                        item.loadData = false;
                    }
                }).catch(err => {
                    item.loadData = false;
                    this.$Message.error(err);
                });
            }
        },
        handleContextMenu(data) {
            this.contextData = data;
        },
        /**
         * 保存笔记
         * @param val 笔记内容
         */
        save: function (val, hint) {
            if (this.showNoteInfo && this.edit) {
                let noteTitle = this.noteInfo.noteTitle;
                let noteId = this.noteInfo.noteId;
                let noteContent = this.noteInfo.noteContent;
                let params = Object.assign({noteTitle}, {noteId}, {noteContent});
                $file.updateNote(params).then(res => {
                    if (res.code === 200) {
                        if (hint) {
                            this.$Message.success("保存成功");
                        }
                    }
                }).catch(err => {
                    this.$Message.error(err);
                })
            }
        },
        /**
         * 查看笔记
         */
        showNote: function (data) {
            if (data !== undefined && data.length > 0) {
                let treeInfo = data[0];
                if (treeInfo.folderId !== undefined) {
                    if (!treeInfo.expand) {
                        // 若笔记未加载则加载笔记
                        this.toggleExpand(treeInfo);
                    }
                    // 展开/隐藏节点
                    treeInfo.expand = !treeInfo.expand;
                    // 去除选中，否则下一次点击不会改变节点展开状态
                    treeInfo.selected = false;
                    return;
                } else {
                    // 获取笔记信息
                    let params = Object.assign({'noteId': treeInfo.noteId});
                    $file.getNote(params).then(res => {
                        if (res.code === 200) {
                            this.noteInfo = res.data;
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                    })
                }
            }
            this.showNoteInfo = true;
            this.edit = false;
            this.show = true;
        },
        /**
         * 创建笔记
         */
        createNote() {
            this.$refs['createNoteInfo'].validate((valid) => {
                if (valid) {
                    this.createFolderLoading = true;
                    let noteTitle = this.createNoteInfo.noteTitle;
                    let folderId = this.contextData.folderId;
                    let params = Object.assign({noteTitle}, {folderId}, {'noteContent': ''});
                    $file.addNote(params).then(res => {
                        if (res.code === 200) {
                            this.createNoteInfo.noteTitle = '';
                            this.getFolderList();
                            this.showCreateNoteBox = false;
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                        this.showCreateNoteBox = false;
                    })
                } else {
                    this.createNoteLoading = false;
                }
            })
        },
        /**
         * 编辑笔记
         */
        editNote: function () {
            this.show = false;
            this.edit = true;
        },
        /**
         * 删除笔记
         */
        deleteNote: function () {
            this.$Modal.confirm({
                title: '删除笔记',
                content: '确定删除笔记 ‘' + this.noteInfo.noteTitle + '’ 吗？',
                onOk: () => {
                    let params = Object.assign({'noteId': this.noteInfo.noteId});
                    $file.deleteNote(params).then(res => {
                        if (res.code === 200) {
                            this.$Message.success('成功删除：' + this.noteInfo.noteTitle);
                            this.showNoteInfo = false;
                            this.noteInfo = {};
                            this.getFolderList();
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                    })
                }
            });
        },
        /**
         * 显示重命名笔记对话框
         */
        showUpdateNoteTitle: function () {
            this.updateNoteTitleInfo.noteTitle = this.noteInfo.noteTitle;
            this.showUpdateNoteTitleBox = true;
        },
        /**
         * 重命名笔记
         */
        updateNoteTitle: function () {
            this.$refs['updateNoteTitleInfo'].validate((valid) => {
                if (valid) {
                    this.updateNoteTitleLoading = true;
                    let noteTitle = this.updateNoteTitleInfo.nodeTitle;
                    let nodeId = this.nodeInfo.nodeId;
                    let nodeContent = this.nodeInfo.nodeContent;
                    let params = Object.assign({nodeTitle}, {nodeId}, {nodeContent});
                    $file.updateNode(params).then(res => {
                        if (res.code === 200) {
                            this.nodeInfo.nodeTitle = nodeTitle;
                            this.showUpdateNodeTitleBox = false;
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                        this.showUpdateNodeTitleBox = false;
                    })
                } else {
                    this.updateNodeTitleLoading = false;
                }
            })
        },
        /**
         * 获取文件夹列表
         */
        getFolderList() {
            $file.getFolderList().then(res => {
                if (res.code === 200) {
                    let folders = res.data.folderList;
                    this.folderList = this.handlerFolderList(folders);
                }
            }).catch(err => {
                this.$Message.error(err);
            })
        },
        /**
         * 处理文件夹列表
         * @param folders 文件夹列表
         * @returns {*[]} 处理后文件夹列表，直接给tree使用
         */
        handlerFolderList(folders) {
            let folderList = [];

            folders.forEach(folder => {
                let returnFolder = {
                    folderId: folder.folderId,
                    title: folder.folderName,
                    noteCount: folder.noteCount,
                    currentNoteCount: 0,
                    contextmenu: true,
                    children: folder.folderList.length > 0 ? this.handlerFolderList(folder.folderList) : [],
                    render: (h, {root, node, data}) => {
                        return h('span', {
                            style: {
                                display: 'inline-block',
                                width: '100%'
                            }
                        }, [
                            h('span', [
                                h('Icon', {
                                    props: {
                                        type: 'ios-folder-open-outline'
                                    },
                                    style: {
                                        marginRight: '6px',
                                        lineHeight: '21px'
                                    }
                                }),
                                h('span', data.title)
                            ]),
                            h('span', {
                                style: {
                                    display: 'inline-block',
                                    float: 'right',
                                    marginRight: '32px'
                                }
                            }, [])
                        ]);
                    },
                }
                if (folder.noteCount > 0) {
                    returnFolder.loading = false;
                }
                // expand: folder.folderList.length > 0 || folder.nodeCount === 0,
                if (folder.folderList.length > 0) {
                    returnFolder.expand = folder.noteCount === 0;
                } else {
                    returnFolder.expand = false;
                }
                folderList.push(returnFolder);
            })

            return folderList;
        },
        /**
         * 显示创建文件夹对话框
         */
        showCreateFolder() {
            if (this.contextData === undefined) {
                this.folderParentId = 0;
            } else {
                this.folderParentId = this.contextData.folderId;
            }
            this.showCreateFolderBox = true;
        },
        /**
         * 创建文件夹
         */
        createFolder(item) {
            this.$refs['folderInfo'].validate((valid) => {
                if (valid) {
                    this.createFolderLoading = true;
                    let folderName = this.folderInfo.folderName;
                    let params = Object.assign({folderName}, {'parentId': this.folderParentId});
                    $file.addFolder(params).then(res => {
                        if (res.code === 200) {
                            this.folderParentId = 0;
                            this.folderInfo.folderName = '';
                            this.getFolderList();
                            this.showCreateFolderBox = false;
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                        this.showCreateFolderBox = false;
                    })
                } else {
                    this.createFolderLoading = false;
                }
            })
        },
        /**
         * 显示更新文件夹对话框
         */
        showUpdateFolder() {
            this.updateFolderInfo.folderId = this.contextData.folderId;
            this.updateFolderInfo.folderName = this.contextData.title;
            this.showUpdateFolderBox = true;
        },
        /**
         * 更新文件夹
         */
        updateFolder() {
            this.$refs['updateFolderInfo'].validate((valid) => {
                if (valid) {
                    this.updateFolderLoading = true;
                    let folderName = this.updateFolderInfo.folderName;
                    let params = Object.assign({folderName}, {'folderId': this.updateFolderInfo.folderId});
                    $file.updateFolder(params).then(res => {
                        if (res.code === 200) {
                            this.updateFolderInfo.folderId = 0;
                            this.updateFolderInfo.folderName = '';
                            this.getFolderList();
                            this.showUpdateFolderBox = false;
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                        this.showUpdateFolderBox = false;
                    })
                } else {
                    this.updateFolderLoading = false;
                }
            })
        },
        /**
         * 删除文件夹
         */
        deleteFolder() {
            this.$Modal.confirm({
                title: '删除文件夹',
                content: '确定删除文件夹 ‘' + this.contextData.title + '’ 吗？',
                onOk: () => {
                    $file.deleteFolder({'folderId': this.contextData.folderId}).then(res => {
                        if (res.code === 200) {
                            this.$Message.success('成功删除：' + this.contextData.title);
                            this.getFolderList();
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                    })
                }
            });
        },
        /**
         * 显示创建笔记对话框
         */
        showCreateNote() {
            this.showCreateNoteBox = true;
        },
        /**
         * 退出登陆
         */
        logout() {
            console.log("退出登录")
            this.$cache.clearCache();
            this.$router.push("/");
        },
        /**
         * 显示修改密码对话框
         */
        showUpdatePassword() {
            this.showUpdatePasswordBox = true;
        },
        /**
         * 修改密码
         */
        updatePassword() {
            this.$refs['updatePasswordInfo'].validate((valid) => {
                if (valid) {
                    let oldPassword = md5(this.updatePasswordInfo.oldPassword);
                    let newPassword = md5(this.updatePasswordInfo.newPassword);
                    let params = Object.assign({oldPassword}, {newPassword});
                    $user.updatePassword(params).then(res => {
                        if (res.code === 200) {
                            this.$Message.success('修改密码成功');
                            this.showUpdatePasswordBox = false;
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                        this.showUpdatePasswordBox = false;
                    })
                } else {
                    this.updateFolderLoading = false;
                }
            })
        },
        /**
         * 添加图片
         */
        addImg(pos, $file){
            // 获取用户id
            const userId = this.$cache.getCache('userId');
            const token = this.$cache.getCache('token');

            // 将图片上传到服务器.
            let formData = new FormData();
            formData.append('file', $file);
            formData.append('userId', userId);
            axios({
                url: '/api/note/file/uploadImage',
                method: 'post',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': token },
            }).then(res => {
                if (res.status !== 200) {
                    this.$Message.error(res.statusText);
                    return;
                }

                const data = res.data;
                if (data.code === 401) {
                    this.$router.push("/");
                    return;
                }
                if (data.code !== 200) {
                    this.$Message.error(data.message);
                    return;
                }

                // 替换图片url
                this.$refs.noteMarkdown.$img2Url(pos, data.data);
            })
        }
    },
    mounted() {
        this.getFolderList();
        this.nickName = this.$cache.getCache("nickName");
        const _this = this;
        this.timer = setInterval(function () {
            _this.save(undefined, false)
        }, 20000);

        // 通过$once来监听定时器，在beforeDestroy钩子可以被清除。
        this.$once('hook:beforeDestroy', () => {
            clearInterval(timer);
        })
    },
    beforeDestroy() {
        clearInterval(this.timer);
    }
}
</script>

<style scoped>
.layout {
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    border-radius: 4px;
    overflow: hidden;
    height: 100%;
    width: 100%;
}

.layout-logo {
    width: 100px;
    height: 30px;
    border-radius: 3px;
    float: left;
    color: #fff;
    text-align: center;
    font-size: 20px;
    line-height: 64px;
}

.layout-nav {
    width: 100px;
    right: 20px;
    margin: 0 0 0 auto;
}

.folderTree {
    height: 100% !important;
    width: 100% !important;
    min-width: 100px;
    max-width: none !important;
    background: #fff;
    overflow-y: scroll;
}

.ivu-btn-text:hover {
    background-color: #fff !important;
}

.markdown {
    color: #2c3e50;
    height: calc(100% - 65px);
    box-shadow: 5px 5px 20px rgba(0, 0, 0, .3), -5px -5px 20px rgba(0, 0, 0, .1);
    position: absolute;
    width: calc(100% - 40px);
}

.editNote {
    height: 100%;
    width: 100%;
    border-radius: 8px;
    z-index: 9;
}

.showNoteParent {
    height: calc(100% - 60px);
    overflow-y: scroll !important;
    overflow-x: hidden;
    position: absolute;
    width: 100%;
    max-width: 1000px;
    left: 50%;
    transform: translateX(-50%);
}

.showNote {
    height: 100%;
}

/deep/ .ivu-layout-content {
    overflow: hidden;
    position: relative;
}

::-webkit-scrollbar {
    display: none;
}
</style>
