const {describe,it,before,after,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const http=require('http');
const fs=require('fs/promises');
const os=require('os');
const path=require('path');
const jwt=require('jsonwebtoken');
const sharp=require('sharp');
const {io:socketClient}=require('socket.io-client');
process.env.NODE_ENV='test';process.env.JWT_ACCESS_SECRET='isolated-tests-only-secret-not-for-production-0123456789';process.env.JWT_ACCESS_EXPIRES='15m';process.env.CLIENT_URLS='http://localhost:3000,http://localhost:5174';
const {createDatabase}=require('./helpers/database');
const Admin=require('../models/Admin');const Product=require('../models/Product');const Click=require('../models/Click');
const createApp=require('../app');const attachSockets=require('../socket');const {generateAccessToken}=require('../utils/generateTokens');
const PASSWORD='Only-for-local-tests-9471';let db,server,io,url,admin,jar,uploadDir;
const cookieHeader=store=>Object.entries(store).map(([key,value])=>`${key}=${value}`).join('; ');
const receive=(response,store)=>{for(const cookie of response.headers.getSetCookie()){const [pair]=cookie.split(';');const index=pair.indexOf('=');store[pair.slice(0,index)]=pair.slice(index+1);}};
const request=async(route,{method='GET',data,store=jar,csrf=true,headers={}}={})=>{
  if(!['GET','HEAD'].includes(method)&&csrf){const response=await fetch(url+'/api/csrf-token',{headers:{cookie:cookieHeader(store)}});receive(response,store);headers['X-CSRF-Token']=(await response.json()).csrfToken;}
  const form=data instanceof FormData;
  const response=await fetch(url+route,{method,headers:{cookie:cookieHeader(store),...(!form&&data!==undefined?{'Content-Type':'application/json'}:{}),...headers},...(data===undefined?{}:{body:form?data:JSON.stringify(data)})});
  receive(response,store);let body;const text=await response.text();try{body=JSON.parse(text);}catch{body=text;}
  return {status:response.status,body,headers:response.headers};
};
const product=(overrides={})=>({name:'Fixture product',description:'A description for testing',price:25,discount:10,imageUrl:'https://example.invalid/product.png',buyLink:'https://example.invalid/buy',category:'general',status:'draft',gallery:[],colors:['gold'],sizes:['M'],stock:3,...overrides});
const tracking=(id='a'.repeat(32))=>({device:'desktop',sessionId:'s'.repeat(32),eventId:id});
describe('YANOBEN contracts and security',()=>{
  before(async()=>{uploadDir=await fs.mkdtemp(path.join(os.tmpdir(),'yanoben-upload-test-'));process.env.UPLOAD_DIR=uploadDir;db=await createDatabase();console.log(`Database test mode: ${db.mode}`);const app=createApp();server=http.createServer(app);io=attachSockets(server,app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));url=`http://127.0.0.1:${server.address().port}`;});
  beforeEach(async()=>{await db.reset();admin=await Admin.create({email:'audit@example.invalid',password:PASSWORD,role:'superadmin'});jar={accessToken:generateAccessToken(admin)};});
  after(async()=>{if(io)await new Promise(resolve=>io.close(resolve));if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}await db?.close();if(uploadDir)await fs.rm(uploadDir,{recursive:true,force:true});});
  it('logs in using the real password hook; cookie expiry matches JWT',async()=>{
    const store={};const result=await request('/api/auth/login',{method:'POST',store,data:{email:'audit@example.invalid',password:PASSWORD}});assert.equal(result.status,200);assert(!result.body.admin.password);assert(result.headers.getSetCookie().some(c=>c.includes('HttpOnly')));
    const decoded=jwt.decode(decodeURIComponent(store.accessToken));assert.equal(decoded.exp-decoded.iat,900);
    assert.equal((await request('/api/auth/me',{store})).status,200);
    const bad=await request('/api/auth/login',{method:'POST',store,data:{email:'audit@example.invalid',password:'wrong'}});assert.equal(bad.status,401);
  });
  it('blocks anonymous writes and requires signed CSRF for an authenticated write',async()=>{
    assert.equal((await request('/api/products',{method:'POST',store:{},data:product(),csrf:false})).status,401);
    assert.equal((await request('/api/products',{method:'POST',data:product(),csrf:false})).status,403);
    assert.equal((await request('/api/products',{method:'POST',data:product(),csrf:false,headers:{'X-CSRF-Token':'a'.repeat(64)+'.'+'b'.repeat(64)}})).body.code,'INVALID_CSRF');
  });
  it('binds CSRF tokens to the current login cookie',async()=>{
    const guest={};const response=await request('/api/csrf-token',{store:guest});guest.accessToken=jar.accessToken;
    const result=await request('/api/products',{method:'POST',store:guest,data:product(),csrf:false,headers:{'X-CSRF-Token':response.body.csrfToken}});assert.equal(result.status,403);
  });
  it('supports draft → publish → edit → delete without leaking drafts',async()=>{
    const created=await request('/api/products',{method:'POST',data:product()});assert.equal(created.status,201);const id=created.body._id;
    assert.equal(created.body.stock,3);assert.deepEqual(created.body.colors,['gold']);
    assert.equal((await request('/api/products',{store:{}})).body.items.length,0);
    assert.equal((await request(`/api/products/${id}`,{store:{}})).status,404);
    assert.equal((await request('/api/products/manage')).body.items.length,1);
    const published=await request(`/api/products/${id}`,{method:'PUT',data:product({status:'published',price:30})});assert.equal(published.status,200);
    assert.equal((await request('/api/products',{store:{}})).body.items[0].price,30);
    assert.equal((await request(`/api/products/${id}`,{method:'DELETE'})).status,200);
    assert.equal((await request(`/api/products/${id}`,{store:{}})).status,404);
  });
  it('validates canonical fields, URLs, IDs and ignores injected counters',async()=>{
    assert.equal((await request('/api/products',{method:'POST',data:{name:'Old form',price:2,images:['x'],status:'active'}})).status,400);
    assert.equal((await request('/api/products',{method:'POST',data:product({buyLink:'javascript:alert(1)'})})).status,400);
    assert.equal((await request('/api/products/not-an-id',{store:{}})).status,400);
    const result=await request('/api/products',{method:'POST',data:product({clickCount:9000,rogue:true})});assert.equal(result.body.clickCount,0);assert.equal(result.body.rogue,undefined);
  });
  it('creates offers and enforces publication, start and expiry dates',async()=>{
    const offer={title:'Test offer',description:'Offer details',imageUrl:'https://example.invalid/offer.png',offerLink:'https://example.invalid/deal',discountPercentage:20,ctaText:'Shop now',status:'published',expiresAt:'2020-01-01T00:00:00Z'};
    let result=await request('/api/offers',{method:'POST',data:offer});assert.equal(result.status,201);const id=result.body._id;
    assert.equal((await request('/api/offers',{store:{}})).body.items.length,0);
    assert.equal((await request('/api/offers/manage')).body.items.length,1);
    result=await request(`/api/offers/${id}`,{method:'PUT',data:{...offer,expiresAt:null}});assert.equal(result.status,200);
    assert.equal((await request('/api/offers',{store:{}})).body.items.length,1);
    const clicked=await request(`/api/offers/${id}/click`,{method:'POST',store:{},data:tracking()});assert.equal(clicked.status,201);
  });
  it('keeps inactive banners in management and filters the public list',async()=>{
    const data={title:'Hero test',imageUrl:'https://example.invalid/banner.png',linkUrl:'/products',position:'hero',active:false,order:2};
    const created=await request('/api/banners',{method:'POST',data});assert.equal(created.status,201);
    assert.equal((await request('/api/banners',{store:{}})).body.items.length,0);assert.equal((await request('/api/banners/manage')).body.items.length,1);
    assert.equal((await request(`/api/banners/${created.body._id}`,{method:'PUT',data:{...data,active:true}})).status,200);
    assert.equal((await request('/api/banners',{store:{}})).body.items[0].title,'Hero test');
  });
  it('receives a contact message, marks it read, and updates unread stats',async()=>{
    const submitted=await request('/api/contacts',{method:'POST',store:{},data:{fullName:'Test Customer',email:'customer@example.invalid',subject:'Product question',message:'A sufficiently long test message'}});assert.equal(submitted.status,201);
    assert.equal((await request('/api/contacts',{store:{}})).status,401);
    const messages=(await request('/api/contacts')).body.items;assert.equal(messages[0].fullName,'Test Customer');
    assert.equal((await request('/api/dashboard/stats')).body.newContacts,1);
    const changed=await request(`/api/contacts/${messages[0]._id}/read`,{method:'PATCH'});assert.equal(changed.status,200);assert.equal(changed.body.isRead,true);
    assert.equal((await request('/api/dashboard/stats')).body.newContacts,0);
    assert.equal((await request(`/api/contacts/${messages[0]._id}/status`,{method:'PATCH',data:{status:'invalid'}})).status,400);
  });
  it('persists companyStory, all policy fields and site identity',async()=>{
    let result=await request('/api/settings/about',{method:'PUT',data:{aboutUs:{companyStory:'Real company story',mission:'Mission',vision:'Vision',contactInfo:'Morocco'}}});assert.equal(result.status,200);
    result=await request('/api/settings/policies',{method:'PUT',data:{policies:{privacyPolicy:'Privacy test',shippingPolicy:'Shipping test'}}});assert.equal(result.status,200);
    result=await request('/api/settings/site',{method:'PUT',data:{siteInfo:{siteName:'Test Shop',tagline:'Test tagline',supportEmail:'support@example.invalid'}}});assert.equal(result.status,200);
    const data=(await request('/api/settings',{store:{}})).body;assert.equal(data.aboutUs.companyStory,'Real company story');assert.equal(data.policies.shippingPolicy,'Shipping test');assert.equal(data.siteInfo.siteName,'Test Shop');
    const Settings=require('../models/Settings');
    await Settings.updateOne({},{$set:{'siteInfo.siteName':'YANOVA','aboutUs.companyStory':'Welcome to Yanova.','siteInfo.supportEmail':'saved@example.invalid'}});
    const renamed=(await request('/api/settings',{store:{}})).body;
    assert.equal(renamed.siteInfo.siteName,'YANOBEN');assert.equal(renamed.aboutUs.companyStory,'Welcome to YANOBEN.');assert.equal(renamed.siteInfo.supportEmail,'saved@example.invalid');
  });
  it('records deduplicated page views, tracks external clicks and excludes admin traffic',async()=>{
    const visitor={};const event={...tracking(),path:'/products'};
    assert.equal((await request('/api/clicks/visit',{method:'POST',store:visitor,data:event})).status,201);
    assert.equal((await request('/api/clicks/visit',{method:'POST',store:visitor,data:event})).body.duplicate,true);
    assert.equal((await request('/api/clicks/visit',{method:'POST',data:{...event,eventId:'b'.repeat(32)}})).status,204);
    const created=await request('/api/products',{method:'POST',data:product({status:'published'})});const id=created.body._id;
    assert.equal((await request(`/api/products/${id}/click`,{method:'POST',store:visitor,data:tracking('c'.repeat(32))})).body.clickCount,1);
    assert.equal((await request(`/api/products/${id}/click`,{method:'POST',store:visitor,data:tracking('c'.repeat(32))})).body.duplicate,true);
    const stats=(await request('/api/dashboard/stats')).body;assert.equal(stats.totalVisits,1);assert.equal(stats.totalClicks,1);assert.equal(stats.sessions,1);assert.equal(stats.deviceStats[0].count,1);
  });
  it('decodes uploaded bytes, normalizes images and rejects disguised content',async()=>{
    const image=await sharp({create:{width:8,height:8,channels:3,background:'#ffffff'}}).png().toBuffer();const form=new FormData();form.append('image',new Blob([image],{type:'image/png'}),'product.png');
    const result=await request('/api/upload',{method:'POST',data:form});assert.equal(result.status,201);assert.match(result.body.url,/^\/uploads\/[a-f0-9-]+\.webp$/);
    const bytes=await fetch(url+result.body.url);assert.equal(bytes.status,200);assert.equal((await sharp(Buffer.from(await bytes.arrayBuffer())).metadata()).format,'webp');
    const bad=new FormData();bad.append('image',new Blob(['<script>bad</script>'],{type:'image/png'}),'fake.png');assert.equal((await request('/api/upload',{method:'POST',data:bad})).status,400);
  });
  it('changes the password and invalidates earlier sessions',async()=>{
    const oldToken=jar.accessToken;
    const changed=await request('/api/auth/password',{method:'POST',data:{currentPassword:PASSWORD,newPassword:'Another-local-test-password-8211'}});assert.equal(changed.status,200);
    assert.equal((await request('/api/auth/me',{store:{accessToken:oldToken}})).status,401);
    assert.equal((await request('/api/auth/me')).status,200);
    const record=await Admin.findById(admin._id).select('+password');assert.equal(await record.comparePassword('Another-local-test-password-8211'),true);
  });
  it('returns JSON errors for unknown API paths, async failures and blocked origins',async()=>{
    assert.equal((await request('/api/missing')).status,404);
    assert.equal((await request('/api/products',{headers:{Origin:'https://blocked.example'}})).status,403);
    const original=Product.collection.find;Product.collection.find=()=>{throw new Error('Simulated storage failure with sensitive details');};
    try{const result=await request('/api/products');assert.equal(result.status,500);assert(!JSON.stringify(result.body).includes('sensitive details'));}finally{Product.collection.find=original;}
  });
  it('authenticates admin sockets and keeps analytics events private',async()=>{
    const once=(socket,event)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Socket timeout: '+event)),3000);socket.once(event,value=>{clearTimeout(timer);resolve(value);});});
    const manager=socketClient(url,{autoConnect:false,auth:{role:'admin'},extraHeaders:{cookie:cookieHeader(jar),origin:'http://localhost:5174'}});
    const visitor=socketClient(url,{autoConnect:false,auth:{role:'visitor',sessionId:'v'.repeat(32)},extraHeaders:{origin:'http://localhost:3000'}});
    try{const initial=once(manager,'analytics:liveUsers');manager.connect();assert.equal(await initial,0);const live=once(manager,'analytics:liveUsers');visitor.connect();assert.equal(await live,1);
      let leaked=false;visitor.on('contact:new',()=>{leaked=true;});const notification=once(manager,'contact:new');
      await request('/api/contacts',{method:'POST',store:{},data:{fullName:'Socket Person',email:'socket@example.invalid',subject:'Socket test',message:'A message for the administrator'}});
      await notification;assert.equal(leaked,false);
    }finally{visitor.disconnect();manager.disconnect();}
  });
});
