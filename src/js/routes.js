
import HomePage from '../pages/home.svelte';
import LoginPage from '../pages/login.svelte';
import Register from '../pages/register.svelte'
import NotFoundPage from '../pages/404.svelte';
import { authStore } from '../lib/pocketbase';
import { app } from 'framework7-svelte';

var routes = [
  {
    path: '/',
    options: {
      transition: 'f7-dive',
    },
    component: HomePage,
  },
    {
    path: '/login',
    options: {
      transition: 'f7-dive',
    },
    component: LoginPage,
  },
    {
    path: '/register',
    options: {
      transition: 'f7-dive',
    },
    component: Register,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
