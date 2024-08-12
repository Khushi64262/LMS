
import Home from "./components/Home.js";
import login from "./components/login.js"
import register from "./components/register.js"
import librarian_home from "./components/librarian_home.js";
import section_management  from "./components/section_management.js";
import book_management from "./components/book_management.js";
import available_books from "./components/available_books.js";
import book_requests from "./components/book_requests.js";
import my_books from "./components/my_books.js";
import search_results from "./components/search_results.js";

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: login},
    { path: '/register', component: register},
    { path: '/librarian_home', component: librarian_home},
    { path: '/section_management', component: section_management},
    { path: '/book_management', component: book_management},
    { path: '/available_books', component: available_books},
    { path: '/book_requests', component: book_requests},
    { path: '/my_books', component: my_books},
    { path: '/search_results', component: search_results},
];


export default new VueRouter({routes,});
