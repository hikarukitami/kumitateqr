const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const bundle=read('docs/app.js'),source=read('src/index.html'),bootstrap=read('gas/index.html');
let count=0;function test(name,fn){fn();count++;console.log('PASS '+name);}
function context(auth=true,ready='loading'){
 const events=[],micro=[],body={textContent:'',innerHTML:'',append(){}};
 const window={addEventListener:(...a)=>events.push(a)};if(auth)window.google={script:{run:{}}};
 const document={body,documentElement:{dataset:{}},readyState:ready,addEventListener(){},createElement:()=>({})};
 return {ctx:vm.createContext({window,document,queueMicrotask:f=>micro.push(f),console}),events,micro,body};
}
test('bundle parses',()=>new vm.Script(bundle));
test('unauthenticated standalone load displays entry link, no RPC',()=>{let s=context(false);vm.runInContext(bundle,s.ctx);assert.match(s.body.textContent,/Google/);assert.equal(s.body.innerHTML,'');assert.equal(s.events.length,0);});
test('authenticated bundle mounts UI and registers both startup handlers',()=>{let s=context();vm.runInContext(bundle,s.ctx);assert.match(s.body.innerHTML,/id="ruleDialog"/);assert.match(s.body.innerHTML,/id="officeView"/);assert.equal(s.events.filter(e=>e[0]==='load').length,2);});
test('late loading starts both handlers without waiting for another load',()=>{let s=context(true,'complete');vm.runInContext(bundle,s.ctx);assert.equal(s.micro.length,2);assert.equal(s.events.filter(e=>e[0]==='load').length,0);});
test('duplicate script load does not reset operator UI',()=>{let s=context();vm.runInContext(bundle,s.ctx);s.body.innerHTML='operator draft';let n=s.events.length;vm.runInContext(bundle,s.ctx);assert.equal(s.body.innerHTML,'operator draft');assert.equal(s.events.length,n);});
test('all GAS calls in existing UI preserved',()=>{const calls=t=>[...t.matchAll(/\brun\(['"]([^'"]+)['"]/g)].map(x=>x[1]).sort();assert.deepEqual(calls(bundle),calls(source));});
test('bootstrap dependencies precede app; no backend code published',()=>{assert.equal((bootstrap.match(/cdn.jsdelivr.net/g)||[]).length,4);assert.ok(bootstrap.indexOf('pdf-lib.min.js')<bootstrap.indexOf('/app.js'));assert.ok(bootstrap.includes('app.css'));assert.ok(!fs.existsSync(path.join(root,'Code.gs')));assert.ok(!/ADMIN_PIN|const ADMIN|AIza/.test(bundle));});
test('public entry uses existing authenticated GAS URL',()=>{assert.match(read('docs/index.html'),/https:\/\/script.google.com\/macros\/s\/[A-Za-z0-9_-]+\/exec/);assert.ok(!/fetch\(|doPost|APP_KEY/.test(read('docs/index.html')));});
console.log(count+' migration checks passed');
