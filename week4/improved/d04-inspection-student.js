(() => {
  'use strict';
  const viewer=window.InspectionViewer;if(!viewer)return;
  const {controls,model,canvas}=viewer,s=controls.state;
  const host=document.querySelector('#student-ui');
  let selected=null,detail=false,comparison=null;
  const status=document.createElement('p');status.className='note';status.setAttribute('aria-live','polite');host.append(status);
  const progress=document.createElement('p');progress.setAttribute('aria-live','polite');host.append(progress);
  const buttons=new Map(),checks=[];
  const heading=document.createElement('h2');heading.textContent='장치로 바로 이동';host.prepend(heading);
  const navigation=document.createElement('div');navigation.className='point-navigation';heading.after(navigation);
  const compareHeading=document.createElement('h2');compareHeading.textContent='구조 비교 · 직교 보기';navigation.after(compareHeading);
  const compareNavigation=document.createElement('div');compareNavigation.className='compare-navigation';compareHeading.after(compareNavigation);
  const modes=document.createElement('div');modes.className='actions';
  const detailButton=document.createElement('button');detailButton.className='btn';detailButton.textContent='상세 보기';detailButton.type='button';modes.append(detailButton);host.append(modes);
  const overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.classList.add('comparison-grid');overlay.setAttribute('aria-hidden','true');canvas.parentElement.append(overlay);
  function update(){
    status.textContent=selected?`${selected.id} ${selected.name} · ${comparison?'직교 비교':detail?'상세 원근 보기':'주변 원근 보기'} · 숨긴 구조물 없음`:'전체 보기 · 원근 투영 · 숨긴 구조물 없음';
    detailButton.disabled=!selected||selected.id.startsWith('O');detailButton.textContent=detail?'주변 보기':'상세 보기';
    for(const [id,b] of buttons)b.setAttribute('aria-pressed',String(selected?.id===id));
    progress.textContent=`관찰 완료 ${checks.filter(c=>c.checked).length} / 8`;
  }
  // 명판 법선은 local +z를 yaw만큼 회전한 방향이다. target은 명판 중심이며
  // 거리는 FOV와 가로/세로 크기를 함께 고려해 계산한다.
  function pointView(){
    const p=selected,aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight);
    const height=detail?Math.max(p.size[1]/.48,p.size[0]/(aspect*.58)):Math.max(2.2,p.size[1]*3,p.size[0]*1.8/aspect);
    s.target=[...p.position];s.distance=Math.max(.45,height/(2*Math.tan(s.fov*Math.PI/360)));
    s.rotation=[0,Math.sin(p.yaw/2),0,Math.cos(p.yaw/2)];
  }
  function select(p){
    selected=p;detail=false;comparison=null;viewer.hidden.clear();
    if(p.members){
      comparison=p;s.target=[...p.position];s.distance=24;
      const yaw=p.id==='O1'?0:Math.PI/2;s.rotation=[0,Math.sin(yaw/2),0,Math.cos(yaw/2)];
    }else pointView();
    update();
  }
  // 기존 과제 설명을 그대로 사용하고 각 행에 이동 버튼과 수동 완료 체크를 추가한다.
  document.querySelectorAll('#tasks li').forEach((li,i)=>{
    const p=model.tasks[i],b=document.createElement('button');b.type='button';b.className='btn observation-button';b.textContent=p.id+(p.id==='O1'?' 전면 직교 비교':p.id==='O2'?' 오른쪽 측면 직교 비교':' 지점으로 이동');b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>{s.actions++;select(p);});buttons.set(p.id,b);b.textContent=p.members?(p.id==='O1'?'O1 전면 비교':'O2 오른쪽 측면 비교'):p.id+' '+p.name;(p.members?compareNavigation:navigation).append(b);
    const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';label.className='completion';label.append(c,document.createTextNode('관찰 완료'));li.append(label);checks.push(c);c.addEventListener('change',()=>{s.actions++;update();});
  });
  detailButton.addEventListener('click',()=>{s.actions++;detail=!detail;pointView();update();});
  const originalHome=controls.home;controls.home=()=>{originalHome();selected=null;comparison=null;detail=false;viewer.hidden.clear();update();};
  function freeView(){if(comparison){s.distance=(s.panHalfHeight || 3)/Math.tan(s.fov*Math.PI/360);comparison=null;s.panHalfHeight=null;update();}}
  // 회전 조작은 동일 eye/target/up의 원근 카메라로 이어진다. 이동/확대는 직교 유지.
  canvas.addEventListener('pointerdown',e=>{if(e.button===0&&!e.shiftKey)freeView();},true);
  canvas.addEventListener('keydown',e=>{if(e.key.startsWith('Arrow'))freeView();},true);
  const initialAspect=()=>canvas.width/Math.max(1,canvas.height);
  let gridKey="";
  function grid(camera){
    const key=JSON.stringify([comparison?.id,canvas.clientWidth,canvas.clientHeight,camera.halfHeight,camera.target]);if(key===gridKey)return;gridKey=key;
    overlay.replaceChildren();if(!comparison)return;
    const w=canvas.clientWidth,h=canvas.clientHeight,scale=h/(camera.halfHeight*2),t=camera.target;
    overlay.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const add=(tag,attrs,text)=>{const n=document.createElementNS(overlay.namespaceURI,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;overlay.append(n);};
    const coordinate=comparison.id==='O1'?t[0]:-t[2];
    for(let value=Math.floor(coordinate-w/(2*scale));value<=coordinate+w/(2*scale);value+=.5){const x=w/2+(value-coordinate)*scale;add('line',{x1:x,y1:0,x2:x,y2:h});}
    for(let y=Math.floor(t[1]-camera.halfHeight);y<=t[1]+camera.halfHeight;y+=.5){const py=h/2-(y-t[1])*scale;add('line',{x1:0,y1:py,x2:w,y2:py});}
    // 공통 월드 기준선으로 두 장치를 같은 화면에서 비교한다.
    if(comparison.id==='O2'){const x=w/2+(-0-coordinate)*scale;add('line',{x1:x,y1:0,x2:x,y2:h,class:'reference'});}
    add('text',{x:14,y:25},comparison.id==='O1'?'전면 직교 · 가로 x / 세로 y':'오른쪽 직교 · 왼쪽 +z / 세로 y · 기준 z=0');
    add('text',{x:14,y:46},'격자 간격 0.5 m · 드래그/방향키: 자유 보기');
  }
  viewer.render=()=>{
    const camera=controls.camera();
    if(comparison){
      const members=comparison.members.map(id=>model.boxes.find(b=>b.id===id));
      const axis=comparison.id==='O1'?0:2;
      const min=Math.min(...members.map(b=>b.position[axis]-b.size[axis]/2)),max=Math.max(...members.map(b=>b.position[axis]+b.size[axis]/2));
      const bottom=Math.min(...members.map(b=>b.position[1]-b.size[1]/2)),top=Math.max(...members.map(b=>b.position[1]+b.size[1]/2));
      const base=Math.max((top-bottom)/2+.9,((max-min)/2+.8)/initialAspect());
      camera.orthographic=true;camera.halfHeight=base*s.distance/24;
      // 평행 이동량도 직교 화면의 월드/픽셀 배율을 사용한다.
      s.panHalfHeight=camera.halfHeight;
    }else s.panHalfHeight=null;
    viewer.drawView(camera);grid(camera);
  };
  update();
})();

