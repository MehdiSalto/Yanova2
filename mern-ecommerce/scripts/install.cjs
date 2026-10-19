const {spawnSync}=require('child_process');
const path=require('path');
const root=path.join(__dirname,'..');
for(const folder of ['','backend','frontend','admin']){
  const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['ci'],{cwd:path.join(root,folder),stdio:'inherit',shell:process.platform==='win32'});
  if(result.status!==0)process.exit(result.status||1);
}
