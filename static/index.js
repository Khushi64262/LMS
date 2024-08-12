import router from './router.js';
import navbar from './components/navbar.js'

router.beforeEach((to, from, next) => {
    // Check if the user is authenticated
    const isAuthenticated = localStorage.getItem('auth-token') !== null;

    if (!isAuthenticated && (to.path === '/login' || to.path === '/register')) {
        next(); // Proceed
    } else if (!isAuthenticated && to.name !== 'login') {
        next({ name: 'login' }); // Redirect to login if not authenticated
    } else {
        next(); // Proceed to the route
    }
});


new Vue({
    el: '#app',
    template: `<div> <navbar :key='has_changed' />
    <router-view /> </div>`,
    router,
    components:{navbar,},
    data:{
        has_changed : true,
    },
    watch:{
        $route(to, from){
            this.has_changed = !this.has_changed
        },

    }
    
})

