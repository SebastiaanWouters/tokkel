
import HomePage from '../pages/home.svelte';
import LoginPage from '../pages/login.svelte';
import Register from '../pages/register.svelte'
import NotFoundPage from '../pages/404.svelte';
import Chat from '../pages/chat.svelte';

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
    path: '/:partnerId',
    options: {
      transition: 'f7-parallax',
    },
    component: Chat,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;
