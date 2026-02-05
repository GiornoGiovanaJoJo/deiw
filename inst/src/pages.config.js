/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AnfrageForm from './pages/AnfrageForm';
import Anfragen from './pages/Anfragen';
import Aufgaben from './pages/Aufgaben';
import Benutzer from './pages/Benutzer';
import BenutzerLogin from './pages/BenutzerLogin';
import Dashboard from './pages/Dashboard';
import Kategorien from './pages/Kategorien';
import Kunden from './pages/Kunden';
import LagerBenutzer from './pages/LagerBenutzer';
import LagerDashboard from './pages/LagerDashboard';
import LagerKassa from './pages/LagerKassa';
import ProjektBearbeiten from './pages/ProjektBearbeiten';
import ProjektDetail from './pages/ProjektDetail';
import ProjektNeu from './pages/ProjektNeu';
import Projekte from './pages/Projekte';
import Protokoll from './pages/Protokoll';
import Subunternehmer from './pages/Subunternehmer';
import Support from './pages/Support';
import SupportForm from './pages/SupportForm';
import Terminal from './pages/Terminal';
import Waren from './pages/Waren';
import Home from './pages/Home';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import SuperUserTest from './pages/SuperUserTest.jsx';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AnfrageForm": AnfrageForm,
    "Anfragen": Anfragen,
    "Aufgaben": Aufgaben,
    "Benutzer": Benutzer,
    "BenutzerLogin": BenutzerLogin,
    "Dashboard": Dashboard,
    "Kategorien": Kategorien,
    "Kunden": Kunden,
    "LagerBenutzer": LagerBenutzer,
    "LagerDashboard": LagerDashboard,
    "LagerKassa": LagerKassa,
    "ProjektBearbeiten": ProjektBearbeiten,
    "ProjektDetail": ProjektDetail,
    "ProjektNeu": ProjektNeu,
    "Projekte": Projekte,
    "Protokoll": Protokoll,
    "Subunternehmer": Subunternehmer,
    "Support": Support,
    "SupportForm": SupportForm,
    "Terminal": Terminal,
    "Waren": Waren,
    "Home": Home,
    "Login": Login,
    "Register": Register,
    "Profile": Profile,
    "superusertest": SuperUserTest,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};