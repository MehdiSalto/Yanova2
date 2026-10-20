const {spawnSync}=require('child_process');
const files=require('fs').readdirSync(__dirname).filter(name=>name.endsWith('.test.js')).map(name=>'test/'+name);
const result=spawnSync(process.execPath,['--test','--test-concurrency=1',...files],{cwd:require('path').join(__dirname,'..'),env:{...process.env,YANOBEN_INTEGRATION:'true',MONGOMS_DOWNLOAD_IGNORE_MISSING_HEADER:'true'},stdio:'inherit'});
process.exit(result.status ?? 1);

