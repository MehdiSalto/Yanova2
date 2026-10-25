const {spawnSync}=require('child_process');
const path=require('path');
for(const folder of ['frontend','admin']){
  const env=folder==='admin'?{...process.env,VITE_BASE_PATH:process.env.VITE_BASE_PATH||'/admin/'}:process.env;
  const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{cwd:path.join(__dirname,'..',folder),env,stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0)process.exit(result.status||1);
}
