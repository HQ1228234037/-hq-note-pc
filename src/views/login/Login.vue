<template>
    <div class="form-login">
        <div>
            笔记：一毛钱一天
        </div>
        <br/>
        <Form ref="user" :model="user" :rules="ruleInline" @keydown.enter.native="login('user')" style="margin: auto">
            <FormItem prop="phone">
                <Input type="text" v-model="user.phone" placeholder="手机号">
                    <Icon type="ios-person-outline" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem prop="password">
                <Input type="password" v-model="user.password" placeholder="密码">
                    <Icon type="ios-lock-outline" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem>
                <Button type="primary" @click="login('user')" style="width: 100%">登录</Button>
            </FormItem>
        </Form>
    </div>
</template>

<script>
import {$login} from '@/service/login'
import md5 from 'js-md5'

export default {
    name: "login",
    data() {
        return {
            user: {
                phone: '',
                password: ''
            },
            ruleInline: {
                phone: [
                    {required: true, message: '手机号不能为空', trigger: 'blur'}
                ],
                password: [
                    {required: true, message: '密码不能为空', trigger: 'blur'},
                    {type: 'string', min: 6, message: '密码不能少于6位', trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        login(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    const password = md5(this.user.password)
                    const newUser = Object.assign({phone: this.user.phone}, {password})
                    $login.login(newUser).then(res => {
                        if (res.code === 200) {
                            this.$cache.setCache('token', res.data.token)
                            this.$cache.setCache('userId', res.data.userId)
                            this.$cache.setCache('nickName', res.data.nickName)
                            this.$cache.setCache('phone', res.data.phone)
                            this.$router.push('/main')
                        }
                    }).catch(err => {
                        this.$Message.error(err);
                        console.log(err)
                    })
                }
            })
        }
    }
}
</script>

<style scoped>
.form-login {
    width: 320px;
    height: 250px;
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
    /*background-color: rgba(0, 0, 0, .1);*/
    padding: 20px;
    border-radius: 10px;
    border: 2px solid #cccccc;
    text-align: center;
}
</style>
