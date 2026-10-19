import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SiteBanners from '../components/SiteBanners';
import { SiteProvider } from '../context/SiteContext';
import { clickAPI } from '../services/api';
import { sessionId, trackingInfo } from '../services/tracking';
const MainLayout=()=>{
  const location=useLocation();
  useEffect(()=>{
    const device=trackingInfo().device;
    clickAPI.registerVisit(device,location.pathname,`${sessionId()}_${location.key}`).catch(()=>{});
  },[location.key,location.pathname]);
  useEffect(()=>{
    const socketUrl=(process.env.REACT_APP_SOCKET_URL||process.env.REACT_APP_API_URL||window.location.origin).replace(/\/api\/?$/,'').replace(/\/$/,'');
    const socket=io(socketUrl,{withCredentials:true,auth:{role:'visitor',sessionId:sessionId()}});
    return()=>socket.disconnect();
  },[]);
  return <SiteProvider><div className="min-h-screen bg-white flex flex-col"><Navbar/><main className="flex-1"><SiteBanners position="top"/><Outlet/></main><SiteBanners position="footer"/><Footer/></div></SiteProvider>;
};
export default MainLayout;
