import { Navigate, createBrowserRouter } from 'react-router-dom'
import Login from './views/Login';
import Signup from './views/Signup';
import Users from './views/Users';
import NotFound from './views/NotFound';
import DefaultLayout from './components/DefaultLayout';
import Dashboard from './views/Dashboard';
import GuestLayout from './components/GuestLayout';
import UserForm from './views/UserForm';
import Players from './views/Players';
import PlayerForm from './views/PlayerForm';
import TransferForm from './views/TransferForm';
import About from './components/About';
import Rules from './components/Rules';
import Prode from './views/Prode';

const router = createBrowserRouter ([
    {
        path: '/',
        element: <DefaultLayout/>,
        children: [
            {
                path: '/',
                element: <Navigate to='/dashboard'/>
            },
            {
                path: '/dashboard',
                element: <Dashboard/>
            },
            {
                path: '/users',
                element: <Users/>
            },
            {
                path: '/users/new',
                element: <UserForm key='userCreate'/>
            },
            {
                path: '/users/:id',
                element: <UserForm key='userUpdate'/>
            },
            {
                path: '/players',
                element: <Players/>
            },
            {
                path: '/players/new',
                element: <PlayerForm key='playerCreate'/>
            },
            {
                path: '/players/:id',
                element: <PlayerForm key='playerUpdate'/>
            },
            {
                path: '/transfer',
                element: <TransferForm/>
            },
            {
                path: '/about',
                element: <About/>
            },
            {
                path: '/reglamento',
                element: <Rules/>
            },
            {
                path: '/prode',
                element: <Prode/>
            },
        ]
    },
    {
        path: '/',
        element: <GuestLayout/>,
        children: [
            {
                path: '/login',
                element: <Login/>
            },
            {
                path: '/signup',
                element: <Signup/>
            },
        ]
    },
    {
        path: '*',
        element: <NotFound/>
    },
]);

export default router

