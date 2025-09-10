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
import DelayedProtectedComponent from './components/DelayedProtectedComponent';
import Chatbot from './views/Chatbot';
import ConfirmedOffersList from './views/ConfirmedOffersList';
import Matchs from './views/Matchs';
import SingleMatch from './views/SingleMatch';
import Tournament from './views/Tournaments';
import Standings from './views/Standings';
import Statistics from './views/Statistics';
import TeamStatistics from './views/TeamStatistics';
import ManagePrizes from './views/ManagePrizes';
import CreatePrizes from './views/CreatePrizes';
import UploadMatch from './views/UploadMatch';

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
                    //<DelayedProtectedComponent delay={4} >
                    <TransferForm />
                    //</DelayedProtectedComponent>

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
                    //<ProtectedComponent>
                    <Announcement />
                    //</ProtectedComponent>
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
                path: '/ofertas-confirmadas',
                element: <ConfirmedOffersList />,
            },
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
                   //<DelayedProtectedComponent delay={4} >
                    <Auctions />
                    //</DelayedProtectedComponent>
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
            {
                path: '/chatbot',
                element: <Chatbot />
            },
            {
                path: '/partidos',
                element: <Matchs />
            },
            {
                path: '/partidos/:id',
                element: <SingleMatch />
            },
            {
                path: '/torneos',
                element: <Tournament />
            },
            {
                path: '/tablas',
                element: <Standings />
            },
            {
                path: '/estadisticas',
                element: <Statistics />
            },
            {
                path: '/estadisticas/:team_id',
                element: <TeamStatistics />
            },
            {
                path: '/premios',
                element: <ManagePrizes />
            },
            {
                path: '/crear-premios',
                element: <CreatePrizes />
            },
            {
                path: '/cargar-imagenes',
                element: <UploadMatch />
            }
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

