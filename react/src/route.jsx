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
import UploadMatch from './views/uploadMatch';
import PublicLayout from './components/PublicLayout';
import LandingPage from './views/public/LandingPage';
// import PublicTeams from './views/public/PublicTeams';
// import PublicPlayers from './views/public/PublicPlayers';
// import PublicStandings from './views/public/PublicStandings';
// import PublicStatistics from './views/public/PublicStatistics';
// import PublicRules from './views/public/PublicRules';

const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            {
                path: '/',
                element: <LandingPage />
            },
            {
                path: '/public/teams',
                element: <Teams />
            },
            {
                path: '/public/players',
                element: <Players />
            },
            {
                path: '/public/standings',
                element: <Standings />
            },
            {
                path: '/public/statistics',
                element: <Statistics />
            },
            {
                path: '/public/rules',
                element: <Rules />
            }
        ]
    },
    {
        path: '/app',
        element: <DefaultLayout />,
        children: [
            {
                path: '/app',
                element: <Navigate to='/dashboard' />
            },
            {
                path: '/app/dashboard',
                element: <Dashboard />
            },
            {
                path: '/app/users',
                element: <Users />
            },
            {
                path: '/app/users/new',
                element: <UserForm key='userCreate' />
            },
            {
                path: '/app/users/:id',
                element: <UserForm key='userUpdate' />
            },
            {
                path: '/app/players',
                element: <Players />
            },
            {
                path: '/app/players/new',
                element: <PlayerForm key='playerCreate' />
            },
            {
                path: '/app/players/:id',
                element: <PlayerForm key='playerUpdate' />
            },
            {
                path: '/app/transfer',
                element: (
                    <DelayedProtectedComponent delay={4} >
                    <TransferForm />
                    </DelayedProtectedComponent>

                )
            },
            {
                path: '/app/about',
                element: <About />
            },
            {
                path: '/app/prode',
                element: <Prode />
            },
            {
                path: '/app/plantel',
                element: <Plantel />
            },
            {
                path: '/app/clausula_rescision',
                element: (
                    <ProtectedComponent>
                    <Announcement />
                    </ProtectedComponent>
                )
            },
            {
                path: '/app/clausula_rescision/:playerId',
                element: (
                    <ProtectedComponent>
                    <Announcement />
                    </ProtectedComponent>
                )
            },
            {
                path: '/app/teams',
                element: <Teams />
            },
            {
                path: '/app/teams/:id',
                element: <TeamForm key='playerUpdate' />
            },
            {
                path: '/app/offers',
                element: <OffersList />
            },
            {
                path: '/app/offers/:id',
                element: <PlayerOffers />
            },
            // {
            //     path: '/subastas',
            //     element: <AuctionConfirmation />
            // },
            {
                path: '/app/ofertas-confirmadas',
                element: <ConfirmedOffersList />,
            },
            {
                path: '/app/apuestas',
                element: <Bets />
            },
            {
                path: '/app/apuestas/new',
                element: <CreateBets />
            },
            {
                path: '/app/apuestas/:id',
                element: <ConfirmBets />
            },
            {
                path: '/app/apuestas/usuarios',
                element: <BetsConfirmation />
            },
            {
                path: '/app/misofertas',
                element: <OffersMade />
            },
            {
                path: '/app/crear_subasta',
                element: (
                    <DelayedProtectedComponent delay={4} >
                    <Auctions />
                    </DelayedProtectedComponent>
                )
            },
            {
                path: '/app/crear_subasta/:playerId',
                element: (
                    <DelayedProtectedComponent delay={4} >
                    <Auctions />
                    </DelayedProtectedComponent>
                )
            },
            {
                path: '*',
                element: <NotFound />
            },
            {
                path: '/app/fixture_primera',
                element: <FixtureFirstDivision />
            },
            {
                path: '/app/fixture_segunda',
                element: <FixtureSecondDivision />
            },
            {
                path: '/app/reglamento',
                element: <Rules />
            },
            {
                path: '/app/subastas/:id',
                element: <PlayerAuctions />
            },
            {
                path: '/app/subastas',
                element: <AuctionsList />
            },
            {
                path: '/app/transferencias',
                element: <TransferList />
            },
            {
                path: '/app/season-countdown',
                element: <SeasonCountdown />
            },
            {
                path: '/app/protected',
                element: <ProtectedComponent />
            },
            {
                path: '/app/chatbot',
                element: <Chatbot />
            },
            {
                path: '/app/partidos',
                element: <Matchs />
            },
            {
                path: '/app/partidos/:id',
                element: <SingleMatch />
            },
            {
                path: '/app/torneos',
                element: <Tournament />
            },
            {
                path: '/app/tablas',
                element: <Standings />
            },
            {
                path: '/app/estadisticas',
                element: <Statistics />
            },
            {
                path: '/app/estadisticas/:team_id',
                element: <TeamStatistics />
            },
            {
                path: '/app/premios',
                element: <ManagePrizes />
            },
            {
                path: '/app/crear-premios',
                element: <CreatePrizes />
            },
            {
                path: '/app/cargar-imagenes/:id',
                element: <UploadMatch />
            }
        ]
    },
    {
        path: '/auth',
        element: <GuestLayout />,
        children: [
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'signup',
                element: <Signup />
            },
        ]
    },
    {
        path: '/login',
        element: <Navigate to='/auth/login' />
    },
    {
        path: '/signup',
        element: <Navigate to='/auth/signup' />
    },
    {
        path: '/dashboard',
        element: <Navigate to='/app/dashboard' />
    },
    {
        path: '/players',
        element: <Navigate to='/app/players' />
    },
    {
        path: '/teams',
        element: <Navigate to='/app/teams' />
    },
    {
        path: '/users',
        element: <Navigate to='/app/users' />
    },
    {
        path: '*',
        element: <NotFound />
    },
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
                element: <Navigate to='/app/users/new' />
            },
            {
                path: '/users/:id',
                element: <Navigate to='/app/users/:id' />
            },
            {
                path: '/players/new',
                element: <Navigate to='/app/players/new' />
            },
            {
                path: '/players/:id',
                element: <Navigate to='/app/players/:id' />
            },
            {
                path: '/transfer',
                element: <Navigate to='/app/transfer' />
            },
            {
                path: '/about',
                element: <Navigate to='/app/about' />
            },
            {
                path: '/prode',
                element: <Navigate to='/app/prode' />
            },
            {
                path: '/plantel',
                element: <Navigate to='/app/plantel' />
            },
            {
                path: '/clausula_rescision',
                element: <Navigate to='app/clausula_rescision' />
            },
            {
                path: '/clausula_rescision/:playerId',
                element: <Navigate to='app/clausula_rescision/:playerId' />
            },
            {
                path: '/teams/:id',
                element: <Navigate to='/app/teams/:id' />
            },
            {
                path: '/offers',
                element: <Navigate to='/app/offers' />
            },
            {
                path: '/offers/:id',
                element: <Navigate to='/app/offers/:id' />
            },
            {
                path: '/ofertas-confirmadas',
                element: <Navigate to='/app/ofertas-confirmadas' />,
            },
            {
                path: '/apuestas',
                element: <Navigate to='/app/apuestas' />
            },
            {
                path: '/apuestas/new',
                element: <Navigate to='/app/apuestas/new' />
            },
            {
                path: '/apuestas/:id',
                element: <Navigate to='/app/apuestas/:id' />
            },
            {
                path: '/apuestas/usuarios',
                element: <Navigate to='/app/apuestas/usuarios' />
            },
            {
                path: '/misofertas',
                element: <Navigate to='/app/misofertas' />
            },
            {
                path: '/crear_subasta',
                element: <Navigate to='app/'>
            },
            {
                path: '/crear_subasta/:playerId',
                element: (
                    <DelayedProtectedComponent delay={4} >
                    <Auctions />
                    </DelayedProtectedComponent>
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
                path: '/cargar-imagenes/:id',
                element: <UploadMatch />
            }

]);

export default router

