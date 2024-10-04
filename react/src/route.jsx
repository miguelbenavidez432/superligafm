/* eslint-disable no-unused-vars */
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
import Prode from './views/Prode';
import Plantel from './views/Plantel';
import Announcement from './views/Announcement';
import Teams from './views/Teams';
import TeamForm from './views/TeamForm';
import OffersList from './views/OffersList';
import PlayerOffers from './views/PlayerOffers';
//import AuctionConfirmation from './views/AuctionConfirmation';
import Bets from './views/Bets';
import CreateBets from './views/CreateBets';
import ConfirmBets from './views/ConfirmBets';
import BetsConfirmation from './views/BetsConfirmation';
import OffersMade from './views/OffersMade';
import Rules from './views/Rules';
import FixtureFirstDivision from './views/FixtureFirstDivision';
import FixtureSecondDivision from './views/FixtureSecondDivision';
import Auctions from './views/Auctions';
import PlayerAuctions from './views/AuctionsByPlayer';
import AuctionsList from './views/AuctionsList';
import TransferList from './views/TransferList';
import SeasonCountdown from './components/SeasonCountDown';
import ProtectedComponent from './components/ProtectedComponent';
import TransferCountDown from './components/TransferCountDown';

const router = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: '/',
                element: <Navigate to='/dashboard' />
            },
            {
                path: '/dashboard',
                element: <Dashboard />
            },
            {
                path: '/users',
                element: <Users />
            },
            {
                path: '/users/new',
                element: <UserForm key='userCreate' />
            },
            {
                path: '/users/:id',
                element: <UserForm key='userUpdate' />
            },
            {
                path: '/players',
                element: <Players />
            },
            {
                path: '/players/new',
                element: <PlayerForm key='playerCreate' />
            },
            {
                path: '/players/:id',
                element: <PlayerForm key='playerUpdate' />
            },
            {
                path: '/transfer',
                element: (
                    <TransferForm />
                )
            },
            {
                path: '/about',
                element: <About />
            },
            {
                path: '/prode',
                element: <Prode />
            },
            {
                path: '/plantel',
                element: <Plantel />
            },
            {
                path: '/clausula_rescision',
                element: (

                    <Announcement />

                )
            },
            {
                path: '/teams',
                element: <Teams />
            },
            {
                path: '/teams/:id',
                element: <TeamForm key='playerUpdate' />
            },
            {
                path: '/offers',
                element: <OffersList />
            },
            {
                path: '/offers/:id',
                element: <PlayerOffers />
            },
            // {
            //     path: '/subastas',
            //     element: <AuctionConfirmation />
            // },
            {
                path: '/apuestas',
                element: <Bets />
            },
            {
                path: '/apuestas/new',
                element: <CreateBets />
            },
            {
                path: '/apuestas/:id',
                element: <ConfirmBets />
            },
            {
                path: '/apuestas/usuarios',
                element: <BetsConfirmation />
            },
            {
                path: '/misofertas',
                element: <OffersMade />
            },
            {
                path: '/crear_subasta',
                element: (

                    <Auctions />
                )
            },
            {
                path: '*',
                element: <NotFound />
            },
            {
                path: '/fixture_primera',
                element: <FixtureFirstDivision />
            },
            {
                path: '/fixture_segunda',
                element: <FixtureSecondDivision />
            },
            {
                path: '/reglamento',
                element: <Rules />
            },
            {
                path: '/subastas/:id',
                element: <PlayerAuctions />
            },
            {
                path: '/subastas',
                element: <AuctionsList />
            },
            {
                path: '/transferencias',
                element: <TransferList />
            },
            {
                path: '/season-countdown',
                element: <SeasonCountdown />
            },
            {
                path: '/protected',
                element: <ProtectedComponent />
            },
        ]
    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/signup',
                element: <Signup />
            },
        ]
    },

]);

export default router

