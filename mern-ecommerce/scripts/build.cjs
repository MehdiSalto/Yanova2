const {spawnSync}=require('child_process');
const path=require('path');
for(const folder of ['frontend','admin']){
  const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{cwd:path.join(__dirname,'..',folder),stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0)process.exit(result.status||1);
}
