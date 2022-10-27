import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        meta: {
            title: ''
        },
        component: (resolve) => require(['../views/login/Login.vue'], resolve)
    },
    {
        path: '/main',
        meta: {
            title: 'main'
        },
        component: (resolve) => require(['../views/main/Main.vue'], resolve)
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
