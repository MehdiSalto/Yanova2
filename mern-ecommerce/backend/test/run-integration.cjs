const {spawnSync}=require('child_process');
const result=spawnSync(process.execPath,['--test','--test-concurrency=1','test/application.test.js'],{cwd:require('path').join(__dirname,'..'),env:{...process.env,YANOBEN_INTEGRATION:'true',MONGOMS_DOWNLOAD_IGNORE_MISSING_HEADER:'true'},stdio:'inherit'});
process.exit(result.status||0);
