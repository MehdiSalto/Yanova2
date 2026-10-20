import ThemeToggle from '../components/ThemeToggle.jsx';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid,FiPackage,FiTag,FiImage,FiMail,FiSettings,FiLogOut,FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ErrorNotice, { errorMessage } from '../components/ErrorNotice';
const nav=[['/','Dashboard',FiGrid],['/products','Products',FiPackage],['/offers','Offers',FiTag],['/banners','Banners',FiImage],['/contacts','Contacts',FiMail],['/sponsorships','Sponsorships',FiBriefcase],['/settings','Settings',FiSettings]];
const AdminLayout=()=>{
  const {admin,logout}=useAuth();const {liveUsers}=useSocket();const navigate=useNavigate();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const signOut=async()=>{setBusy(true);try{await logout();navigate('/login');}catch(err){setError(errorMessage(err));}finally{setBusy(false);}};
  return <div className="min-h-screen bg-dark-950"><aside className="md:fixed md:w-64 md:h-full bg-dark-900 border-b md:border-r border-dark-800 p-4 md:p-5 flex flex-col"><div className="mb-4"><h1 className="text-2xl font-black text-gold-400">YANOBEN</h1><p className="text-xs text-dark-400">Admin panel</p><div className="mt-3"><ThemeToggle /></div></div><nav className="grid grid-cols-3 md:grid-cols-1 gap-1 md:flex-1">{nav.map(([to,label,Icon])=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`flex items-center gap-2 px-3 py-3 rounded-lg text-xs md:text-sm ${isActive?'bg-gold-500 text-dark-950 font-bold':'text-dark-300 hover:bg-dark-800'}`}><Icon className="shrink-0"/>{label}</NavLink>)}</nav><div className="pt-4 md:border-t border-dark-800 space-y-2"><p className="text-xs text-dark-400">{liveUsers ?? '—'} active visitors · last 2 min</p><div className="flex items-center justify-between gap-2"><p className="text-xs truncate">{admin?.email}</p><button disabled={busy} aria-label="Log out" title="Log out" onClick={signOut}><FiLogOut/></button></div><ErrorNotice message={error}/></div></aside><main className="md:ml-64 p-4 sm:p-6 lg:p-8"><Outlet/></main></div>;
};
export default AdminLayout;

