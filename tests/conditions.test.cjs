// 標準図ルール画面：条件の追加ボタン・完全削除の再実行の画面側の回帰確認（静的検査）
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'..','src/index.html'),'utf8');
function body(name){const i=source.indexOf('function '+name+'(');assert.ok(i>=0,name+' not found');let d=0,j=source.indexOf('{',i);for(;j<source.length;j++){if(source[j]==='{')d++;else if(source[j]==='}'&&--d===0)break;}return source.slice(i,j+1);}
let n=0;const test=(name,fn)=>{fn();n++;console.log('PASS '+name);};
test('add-condition button is bound by its own class, not the first button (which may be an existing row ×)',()=>{
  const f=body('rlConditions');
  assert.match(f,/class="btn sm rl-add-cond"[^>]*>＋ 条件を追加/);
  assert.match(f,/host\.querySelector\('\.rl-add-cond'\)\.onclick/);
  assert.doesNotMatch(f,/host\.querySelector\('button'\)/);
  // 既存の条件行は追加ボタンより前に描画されるため、汎用の button 指定は × に誤接続する
  assert.ok(f.indexOf("rows.forEach(r=>rlConditionRow(id,r))")<f.indexOf(".rl-add-cond').onclick"));
});
test('condition row × removes only its own row',()=>{const f=body('rlConditionRow');assert.match(f,/row\.querySelector\('button'\)\.onclick=\(\)=>\{row\.remove\(\)/);assert.equal((f.match(/<button/g)||[]).length,1);});
test('trash screen offers retry for interrupted purge and reloads list after failure',()=>{
  const f=body('rlTrash');
  assert.match(f,/r\.pending\?'完全削除を再実行'/);
  assert.match(f,/catch\(e\)\{try\{await rlTrash\(\);\}catch\(_\)\{\}throw/);
  assert.match(f,/run\('purgeRulePermanently',officePin,r\.kind,r\.no,r\.point,r\.version,getMe\(\)\)/);
  assert.match(f,/rlAsk\('確認のため「完全削除」と入力してください','text'\)/);
});
console.log(n+' rule screen checks passed');
