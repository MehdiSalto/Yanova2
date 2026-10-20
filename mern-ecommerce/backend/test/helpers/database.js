const mongoose = require('mongoose');
const models = ['Admin','Product','Offer','Banner','Contact','Sponsorship','Settings','Click','VisitorSession'].map(name => require(`../../models/${name}`));
const clone = value => {
  if (value instanceof Date) return new Date(value);
  if (value?.toHexString) return new mongoose.Types.ObjectId(value.toHexString());
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clone(item)]));
  return value;
};
const get = (object,key) => key.split('.').reduce((value,part)=>value?.[part],object);
const set = (object,key,value) => { const parts=key.split('.');const last=parts.pop();const target=parts.reduce((value,part)=>value[part]??(value[part]={}),object);target[last]=clone(value); };
const equal = (a,b) => a==null && b==null || String(a)===String(b);
const matches = (doc,filter) => Object.entries(filter).every(([key,value])=>{
  if(key==='$or')return value.some(rule=>matches(doc,rule));if(key==='$and')return value.every(rule=>matches(doc,rule));
  const actual=get(doc,key);
  if(value instanceof RegExp)return value.test(String(actual||''));
  if(value&&typeof value==='object'&&!value.toHexString&&!(value instanceof Date))return Object.entries(value).every(([op,arg])=>{
    if(op==='$gte')return actual!=null&&actual>=arg;if(op==='$lte')return actual!=null&&actual<=arg;if(op==='$gt')return actual!=null&&actual>arg;if(op==='$in')return arg.some(item=>equal(actual,item));if(op==='$type')return typeof actual===arg;return false;
  });
  return equal(actual,value);
});
const update = (doc,changes,insert=false) => {
  for(const [operator,values] of Object.entries(changes)) {
    if(operator==='$set'||operator==='$setOnInsert'&&insert)for(const [key,value] of Object.entries(values))set(doc,key,value);
    if(operator==='$inc')for(const [key,value] of Object.entries(values))set(doc,key,(get(doc,key)||0)+value);
    if(operator==='$unset')for(const key of Object.keys(values))delete doc[key];
  }
};
// Native collection fixture: Mongoose queries, schema casting, validation,
// password save hooks and Express middleware all execute unmodified. MongoDB
// storage, indexes and network behavior are intentionally not emulated fully.
const fixture = () => {
  const stores = new Map(models.map(Model=>[Model.modelName,[]]));
  const project = (doc,options={}) => {
    if(!doc)return null;const result=clone(doc);
    for(const [key,value] of Object.entries(options.projection||{}))if(value===0)delete result[key];return result;
  };
  for(const Model of models){
    const store=stores.get(Model.modelName);const collection=Model.collection;
    const unique = doc => {
      if(Model.modelName==='Sponsorship'&&store.some(item=>item.submissionId===doc.submissionId)||Model.modelName==='Click'&&doc.eventId&&store.some(item=>item.eventId===doc.eventId)||Model.modelName==='Admin'&&store.some(item=>item.email===doc.email)||Model.modelName==='Settings'&&doc.key&&store.some(item=>item.key===doc.key))throw Object.assign(new Error('Duplicate key'),{code:11000});
    };
    collection.insertOne=async doc=>{unique(doc);store.push(clone(doc));return {acknowledged:true,insertedId:doc._id};};
    collection.findOne=async(filter,options)=>project(store.find(doc=>matches(doc,filter)),options);
    collection.find=(filter,options={})=>({toArray:async()=>{
      let items=store.filter(doc=>matches(doc,filter));
      if(options.sort)items.sort((a,b)=>{for(const [key,order]of Object.entries(options.sort)){const x=get(a,key),y=get(b,key);if(x>y)return order;if(x<y)return -order;}return 0;});
      if(options.skip)items=items.slice(options.skip);if(options.limit)items=items.slice(0,options.limit);return items.map(doc=>project(doc,options));
    }});
    collection.countDocuments=async filter=>store.filter(doc=>matches(doc,filter||{})).length;
    collection.findOneAndUpdate=async(filter,changes,options={})=>{
      let doc=store.find(item=>matches(item,filter));const before=clone(doc);
      if(!doc&&options.upsert){doc={_id:new mongoose.Types.ObjectId(),...clone(filter)};update(doc,changes,true);unique(doc);store.push(doc);}
      else if(doc)update(doc,changes);
      const result=options.returnDocument==='after'?doc:before;return options.includeResultMetadata?{value:clone(result)}:clone(result)||null;
    };
    collection.findOneAndDelete=async filter=>{const index=store.findIndex(doc=>matches(doc,filter));return index<0?null:clone(store.splice(index,1)[0]);};
    collection.updateOne=async(filter,changes)=>{const doc=store.find(item=>matches(item,filter));if(doc)update(doc,changes);return {acknowledged:true,matchedCount:doc?1:0,modifiedCount:doc?1:0};};
    collection.deleteMany=async(filter={})=>{const items=store.filter(doc=>matches(doc,filter));for(const doc of items)store.splice(store.indexOf(doc),1);return {deletedCount:items.length};};
    collection.aggregate=pipeline=>({toArray:async()=>{
      let items=store.map(clone);
      for(const stage of pipeline){
        if(stage.$match)items=items.filter(doc=>matches(doc,stage.$match));
        if(stage.$group){const spec=stage.$group;const groups=new Map();for(const item of items){const id=get(item,spec._id.slice(1));const key=String(id);if(!groups.has(key))groups.set(key,{_id:id,...Object.fromEntries(Object.keys(spec).filter(k=>k!=='_id').map(k=>[k,0]))});for(const field of Object.keys(spec).filter(k=>k!=='_id'))groups.get(key)[field]+=1;}items=[...groups.values()];}
        if(stage.$count)items=items.length?[{[stage.$count]:items.length}]:[];
      }return items;
    }});
  }
  return {reset:()=>{for(const store of stores.values())store.splice(0);},stores};
};
const createDatabase=async()=>{
  if(process.env.YANOBEN_INTEGRATION==='true'){
    const {MongoMemoryServer}=require('mongodb-memory-server');
    const db=await MongoMemoryServer.create({binary:{version:'7.0.14'},instance:{args:['--nounixsocket','--setParameter','diagnosticDataCollectionEnabled=false']}});await mongoose.connect(db.getUri());
    await Promise.all(models.map(Model=>Model.init()));
    return {mode:'temporary MongoDB',reset:()=>Promise.all(models.map(Model=>Model.deleteMany({}))),close:async()=>{await mongoose.disconnect();await db.stop();}};
  }
  const memory=fixture();return {mode:'native collection fixture',reset:memory.reset,stores:memory.stores,close:async()=>{}};
};
module.exports={createDatabase,models};

