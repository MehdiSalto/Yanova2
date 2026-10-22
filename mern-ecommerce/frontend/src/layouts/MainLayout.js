import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useVisitorPresence from '../hooks/useVisitorPresence';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SiteBanners from '../components/SiteBanners';
import { SiteProvider } from '../context/SiteContext';
import { clickAPI } from '../services/api';
import { pageInstance, sessionId, trackingInfo } from '../services/tracking';
const MainLayout=()=>{
  const location=useLocation();
  useVisitorPresence(location.pathname);
  useEffect(()=>{
    const device=trackingInfo().device;
    clickAPI.registerVisit(device,location.pathname,`${sessionId()}_${pageInstance}_${location.key}`).catch(()=>{});
  },[location.key,location.pathname]);
  return <SiteProvider><div className="store-app min-h-screen bg-canvas flex flex-col"><Navbar/><main className="flex-1"><SiteBanners position="top"/><Outlet/></main><SiteBanners position="footer"/><Footer/></div></SiteProvider>;
};
export default MainLayout;

