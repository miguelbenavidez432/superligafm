/* eslint-disable no-unused-vars */
import { Navigate, createBrowserRouter } from 'react-router-dom'

// Layouts
import PublicLayout from './components/PublicLayout';
import DefaultLayout from './components/DefaultLayout';
import GuestLayout from './components/GuestLayout';

// Vistas Públicas
import LandingPage from './views/public/LandingPage';

// Vistas Privadas (App)
import Dashboard from './views/Dashboard';
import Users from './views/Users';
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
import ReverseOffer from './views/ReverseOffer';
import NotFound from './views/NotFound';

// Auth
import Login from './views/Login';
import Signup from './views/Signup';

import PlayersList from './views/PlayersList';
import CancelSuspensionForm from './views/CancelSuspensionForm';

const router = createBrowserRouter([
    // --- RUTAS PÚBLICAS ---
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            { path: '/', element: <LandingPage /> },
            { path: '/public/teams', element: <Teams /> },
            { path: '/public/players', element: <Players /> },
            { path: '/public/standings', element: <Standings /> },
            { path: '/public/statistics', element: <Statistics /> },
            { path: '/public/rules', element: <Rules /> }
        ]
    },

    // --- RUTAS DE AUTENTICACIÓN ---
    {
        path: '/auth',
        element: <GuestLayout />,
        children: [
            { path: 'login', element: <Login /> },
            { path: 'signup', element: <Signup /> },
        ]
    },

    // --- RUTAS PRIVADAS (APP) ---
    {
        path: '/app',
        element: <DefaultLayout />,
        children: [
            { path: '/app', element: <Navigate to='/app/dashboard' /> },
            { path: '/app/dashboard', element: <Dashboard /> },
            { path: '/app/users', element: <Users /> },
            { path: '/app/users/new', element: <UserForm key='userCreate' /> },
            { path: '/app/users/:id', element: <UserForm key='userUpdate' /> },
            { path: '/app/players', element: <Players /> },
            { path: '/app/players/new', element: <PlayerForm key='playerCreate' /> },
            { path: '/app/players/:id', element: <PlayerForm key='playerUpdate' /> },

            // NUEVA RUTA: Lista General de Jugadores
            { path: '/app/jugadores-registrados', element: <PlayersList /> },

            { path: '/app/transfer', element: <DelayedProtectedComponent delay={4}><TransferForm /></DelayedProtectedComponent> },
            { path: '/app/about', element: <About /> },
            { path: '/app/prode', element: <Prode /> },
            { path: '/app/plantel', element: <Plantel /> },
            { path: '/app/clausula_rescision', element: <ProtectedComponent><Announcement /></ProtectedComponent> },
            { path: '/app/clausula_rescision/:playerId', element: <ProtectedComponent><Announcement /></ProtectedComponent> },
            { path: '/app/teams', element: <Teams /> },
            { path: '/app/teams/:id', element: <TeamForm key='playerUpdate' /> },
            { path: '/app/offers', element: <OffersList /> },
            { path: '/app/offers/:id', element: <PlayerOffers /> },
            { path: '/app/ofertas-confirmadas', element: <ConfirmedOffersList /> },
            { path: '/app/apuestas', element: <Bets /> },
            { path: '/app/apuestas/new', element: <CreateBets /> },
            { path: '/app/apuestas/:id', element: <ConfirmBets /> },
            { path: '/app/apuestas/usuarios', element: <BetsConfirmation /> },
            { path: '/app/misofertas', element: <OffersMade /> },
            { path: '/app/crear_subasta', element: <DelayedProtectedComponent delay={4}><Auctions /></DelayedProtectedComponent> },
            { path: '/app/crear_subasta/:playerId', element: <DelayedProtectedComponent delay={4}><Auctions /></DelayedProtectedComponent> },
            { path: '/app/fixture_primera', element: <FixtureFirstDivision /> },
            { path: '/app/fixture_segunda', element: <FixtureSecondDivision /> },
            { path: '/app/reglamento', element: <Rules /> },
            { path: '/app/subastas/:id', element: <PlayerAuctions /> },
            { path: '/app/subastas', element: <AuctionsList /> },
            { path: '/app/transferencias', element: <TransferList /> },
            { path: '/app/season-countdown', element: <SeasonCountdown /> },
            { path: '/app/protected', element: <ProtectedComponent /> },
            { path: '/app/chatbot', element: <Chatbot /> },
            { path: '/app/partidos', element: <Matchs /> },
            { path: '/app/partidos/:id', element: <SingleMatch /> },
            { path: '/app/torneos', element: <Tournament /> },
            { path: '/app/tablas', element: <Standings /> },
            { path: '/app/estadisticas', element: <Statistics /> },
            { path: '/app/estadisticas/:team_id', element: <TeamStatistics /> },
            { path: '/app/premios', element: <ManagePrizes /> },
            { path: '/app/crear-premios', element: <CreatePrizes /> },
            { path: '/app/cargar-imagenes', element: <UploadMatch /> },
            { path: '/app/reverse-offer', element: <ReverseOffer /> },
            { path: '/app/levantar-sancion', element: <CancelSuspensionForm /> },
        ]
    },

    // --- REDIRECCIONES DE RUTAS SUELTAS (CLEANUP) ---
    { path: '/login', element: <Navigate to='/auth/login' /> },
    { path: '/signup', element: <Navigate to='/auth/signup' /> },
    { path: '/dashboard', element: <Navigate to='/app/dashboard' /> },
    { path: '/players', element: <Navigate to='/app/players' /> },
    { path: '/players/new', element: <Navigate to='/app/players/new' /> },
    { path: '/players/:id', element: <Navigate to='/app/players/:id' /> },
    { path: '/teams', element: <Navigate to='/app/teams' /> },
    { path: '/teams/:id', element: <Navigate to='/app/teams/:id' /> },
    { path: '/users', element: <Navigate to='/app/users' /> },
    { path: '/users/new', element: <Navigate to='/app/users/new' /> },
    { path: '/users/:id', element: <Navigate to='/app/users/:id' /> },
    { path: '/subastas', element: <Navigate to='/app/subastas' /> },
    { path: '/transfer', element: <Navigate to='/app/transfer' /> },
    { path: '/about', element: <Navigate to='/app/about' /> },
    { path: '/prode', element: <Navigate to='/app/prode' /> },
    { path: '/plantel', element: <Navigate to='/app/plantel' /> },
    { path: '/clausula_rescision', element: <Navigate to='/app/clausula_rescision' /> },
    { path: '/clausula_rescision/:playerId', element: <Navigate to='/app/clausula_rescision/:playerId' /> },
    { path: '/offers', element: <Navigate to='/app/offers' /> },
    { path: '/offers/:id', element: <Navigate to='/app/offers/:id' /> },
    { path: '/ofertas-confirmadas', element: <Navigate to='/app/ofertas-confirmadas' /> },
    { path: '/apuestas', element: <Navigate to='/app/apuestas' /> },
    { path: '/apuestas/new', element: <Navigate to='/app/apuestas/new' /> },
    { path: '/apuestas/:id', element: <Navigate to='/app/apuestas/:id' /> },
    { path: '/apuestas/usuarios', element: <Navigate to='/app/apuestas/usuarios' /> },
    { path: '/misofertas', element: <Navigate to='/app/misofertas' /> },
    { path: '/crear_subasta', element: <Navigate to='/app/crear_subasta' /> },
    { path: '/fixture_primera', element: <Navigate to='/app/fixture_primera' /> },
    { path: '/fixture_segunda', element: <Navigate to='/app/fixture_segunda' /> },
    { path: '/reglamento', element: <Navigate to='/app/reglamento' /> },
    { path: '/subastas/:id', element: <Navigate to='/app/subastas/:id' /> },
    { path: '/transferencias', element: <Navigate to='/app/transferencias' /> },
    { path: '/season-countdown', element: <Navigate to='/app/season-countdown' /> },
    { path: '/protected', element: <Navigate to='/app/protected' /> },
    { path: '/chatbot', element: <Navigate to='/app/chatbot' /> },
    { path: '/partidos', element: <Navigate to='/app/partidos' /> },
    { path: '/partidos/:id', element: <Navigate to='/app/partidos/:id' /> },
    { path: '/torneos', element: <Navigate to='/app/torneos' /> },
    { path: '/tablas', element: <Navigate to='/app/tablas' /> },
    { path: '/estadisticas', element: <Navigate to='/app/estadisticas' /> },
    { path: '/estadisticas/:team_id', element: <Navigate to='/app/estadisticas/:team_id' /> },
    { path: '/premios', element: <Navigate to='/app/premios' /> },
    { path: '/crear-premios', element: <Navigate to='/app/crear-premios' /> },
    { path: '/cargar-imagenes', element: <Navigate to='/app/cargar-imagenes' /> },
    { path: '*', element: <NotFound /> },
]);

export default router
