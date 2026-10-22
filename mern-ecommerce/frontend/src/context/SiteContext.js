import useCatalogGeneration from '../hooks/useCatalogGeneration';
import { createContext, useContext, useEffect, useState } from 'react';
import { bannerAPI, settingsAPI } from '../services/api';
const SiteContext = createContext({ settings: null, banners: [], loading: true, error: '' });
export const SiteProvider = ({ children }) => {
  const catalogVersion = useCatalogGeneration();
  const [settings,setSettings]=useState(null);const [banners,setBanners]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [reload,setReload]=useState(0);
  useEffect(()=>{const abort=new AbortController();setLoading(true);
    settingsAPI.get({signal:abort.signal}).then(({data})=>{setSettings({...data,siteInfo:{...data.siteInfo,siteName:'YANOBEN'}});setError('');}).catch(()=>{if(!abort.signal.aborted)setError('Unable to load this page. Please try again.');}).finally(()=>{if(!abort.signal.aborted)setLoading(false);});
    bannerAPI.getAll({signal:abort.signal}).then(({data})=>setBanners(data.items)).catch(()=>{});
    return()=>abort.abort();
  },[reload,catalogVersion]);
  return <SiteContext.Provider value={{settings,banners,loading,error,retry:()=>setReload(value=>value+1)}}>{children}</SiteContext.Provider>;
};
export const useSite = () => useContext(SiteContext);
