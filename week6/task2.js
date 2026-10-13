/* 6주차 실습 2: Crackworld — 태양열 균열과 화산암·용암 분출.
 * 실습 1의 PBR(D/F/G), 색/ARM/normal/환경맵 계산을 유지한다.
 * 3D 노이즈 마스크 둘로 base color와 roughness/metallic을 위치별로 수정한다.
 */
(() => {
'use strict';
const cv=document.querySelector('#cv'), gl=D.context(cv); if(!gl)return;
const VS=`#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUV;
uniform mat4 uVP, uModel;
out vec3 vP,vN,vLocal; out vec2 vUV;
void main(){
 vec4 world = uModel * vec4(aPos,1.0);
 vP = world.xyz;
 vN = mat3(transpose(inverse(uModel))) * aNormal;
 vLocal = aPos;
 vUV = aUV;
 gl_Position = uVP * world;
}`;
const FS=`#version 300 es
precision highp float;
const float PI=3.14159265;
in vec3 vP,vN,vLocal; in vec2 vUV; out vec4 outColor;
uniform sampler2D uColor,uNormal,uARM,uEnv;
uniform vec3 uEye,uLightPos,uTint,uEmissionColor;
uniform bool uEmissive;
uniform float uRough,uMetal,uNormalStrength,uPower,uAmbient,uEnvPower;
uniform float uSolarLevel,uVolcanoLevel;
uniform int uViewMode; // 0=결과, 1=기본 표면, 2=태양 마스크, 3=화산 마스크

vec3 srgbToLinear(vec3 c){
 return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));
}
vec3 linearToSrgb(vec3 c){
 return mix(12.92*c,1.055*pow(c,vec3(1./2.4))-.055,step(vec3(.0031308),c));
}

// TODO 2: D(GGX), F(Schlick), G(Smith-Schlick)를 계산해
// 직접광 PBR 결과를 반환하세요. 6주차 3-2절을 참고하세요.
vec3 directPBR(vec3 N,vec3 V,vec3 L,vec3 base,float rough,float metal){
    float nv = max(dot(N, V), 0.0);
    float nl = max(dot(N, L), 0.0);
    if (nv <= 0.0 || nl <= 0.0) return vec3(0.0);

    vec3 H = normalize(V + L);
    float r = clamp(rough, 0.045, 1.0);
    float a = r*r, a2 = a*a;

    // D: GGX 법선 분포
    float nh = max(dot(N, H), 0.0);
    float d = nh*nh*(a2-1.0)+1.0;
    float D = a2 / max(PI*d*d, 1e-7);

    // F: Schlick 프레넬 반사
    vec3 F0 = mix(vec3(0.04), base, metal);
    vec3 F = F0 + (1.0-F0)*pow(1.0-max(dot(H,V),0.0),5.0);

    // G: Smith-Schlick 기하 감쇠
    float k = (r+1.0)*(r+1.0)/8.0;
    float G = (nv/(nv*(1.0-k)+k))*(nl/(nl*(1.0-k)+k));

    vec3 specular = D*F*G / max(4.0*nv*nl, 1e-6);
    vec3 kd = (1.0-F)*(1.0-metal);

    return (kd*base/PI + specular)*nl*uPower;
}


// 3D 값 노이즈: 규칙적인 줄무늬 대신 자연스럽게 휘어진 암석 패턴을 만든다.
float hash31(vec3 p){
 p=fract(p*0.1031);
 p+=dot(p,p.yzx+33.33);
 return fract((p.x+p.y)*p.z);
}
float noise3(vec3 x){
 vec3 i=floor(x), f=fract(x);
 f=f*f*(3.0-2.0*f);
 float n000=hash31(i+vec3(0,0,0));
 float n100=hash31(i+vec3(1,0,0));
 float n010=hash31(i+vec3(0,1,0));
 float n110=hash31(i+vec3(1,1,0));
 float n001=hash31(i+vec3(0,0,1));
 float n101=hash31(i+vec3(1,0,1));
 float n011=hash31(i+vec3(0,1,1));
 float n111=hash31(i+vec3(1,1,1));
 return mix(
   mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),
   mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y),
   f.z
 );
}

void main(){
 // 태양은 자체 발광하는 표시 구. 주변 표면은 별도 PBR 계산으로 비춘다.
 if (uEmissive) {
  vec3 glow = uEmissionColor / (vec3(1.0) + uEmissionColor);
  outColor = vec4(linearToSrgb(glow), 1.0);
  return;
 }
 vec3 N=normalize(vN),V=normalize(uEye-vP),L=normalize(uLightPos-vP);
 vec3 base=uTint;
 base = srgbToLinear(texture(uColor, vUV).rgb) * uTint;
// TODO 1: texture(uColor,vUV).rgb를 읽어 선형화하고 base에 사용하세요.
 // 수치 맵에는 sRGB 변환을 적용하지 마세요.

 float rough=uRough,metal=uMetal,ao=1.0;
 vec3 arm = texture(uARM, vUV).rgb;
 ao = arm.r;
 rough = max(arm.g * uRough, 0.045);
 metal = arm.b * uMetal;
 // TODO 3: uARM의 R(AO), G(roughness), B(metallic)를 읽으세요.
 // 슬라이더 uRough/uMetal은 맵 값에 곱하는 배율입니다.

 // TODO 4: uNormal에서 접선 공간 법선을 읽고 N을 바꾸세요.
 // vP와 vUV의 dFdx/dFdy로 TBN을 만들어도 됩니다.
 // uNormalStrength=0이면 기하 법선을 그대로 사용하세요.

 if (uNormalStrength > 0.0) {
    vec3 dp1 = dFdx(vP), dp2 = dFdy(vP);
    vec2 du1 = dFdx(vUV), du2 = dFdy(vUV);

    vec3 T = cross(dp2, N)*du1.x + cross(N, dp1)*du2.x;
    vec3 B = cross(dp2, N)*du1.y + cross(N, dp1)*du2.y;

    float inv = inversesqrt(max(max(dot(T,T), dot(B,B)), 1e-8));

    vec3 mapN = texture(uNormal, vUV).xyz*2.0-1.0;
    mapN.xy *= uNormalStrength;

    N = normalize(mat3(T*inv, B*inv, N)*normalize(mapN));
}

 // 행성 로컬 좌표 기반 3D 노이즈: 자전해도 무늬가 표면에 고정된다.
 vec3 p=normalize(vLocal);
 vec3 warped=p*6.2+0.70*vec3(
   noise3(p*3.5+vec3(1.2,3.4,5.1)),
   noise3(p*3.5+vec3(7.8,2.6,1.3)),
   noise3(p*3.5+vec3(3.1,8.4,6.2))
 );

 // ① 태양 접근도: 불규칙한 지각 경계가 벌어져 용암 균열이 된다.
 float crackField=0.68*noise3(warped)+0.32*noise3(warped*2.19+3.7);
 float crackDistance=abs(crackField-0.51);
 float crackEdge=1.0-smoothstep(0.025,0.095,crackDistance);
 float hotCore=1.0-smoothstep(0.014,0.058,crackDistance);
 float thermalField=noise3(p*3.4+vec3(6.1,2.4,7.8));
 float heating=smoothstep(0.72-0.36*uSolarLevel,
                          0.83-0.36*uSolarLevel,thermalField);
 float solarMask=uSolarLevel*hotCore*heating;

 // ② 화산 활동: 큰 현무암 지대와 그 내부의 간헐적인 용암 흐름.
 float ashField=0.70*noise3(p*5.1+vec3(8.2,3.1,1.7))
               +0.30*noise3(p*11.2+vec3(2.6,9.1,4.3));
 float ashLimit=mix(0.73,0.39,uVolcanoLevel);
 float volcanoMask=uVolcanoLevel*smoothstep(ashLimit-0.09,
                                            ashLimit+0.07,ashField);
 float ventField=noise3(p*9.1+vec3(11.4,4.3,7.5));
 float moltenRidge=1.0-smoothstep(0.016,0.072,abs(ventField-0.52));
 float ventZone=smoothstep(0.47,0.67,ashField);
 float lavaFlow=uVolcanoLevel*moltenRidge*ventZone
               *smoothstep(0.12,0.65,volcanoMask);

 // 각 마스크의 회색은 0~1 범위의 영향도. 두 마스크는 독립적이다.
 if(uViewMode==2){outColor=vec4(vec3(solarMask),1.0);return;}
 if(uViewMode==3){outColor=vec4(vec3(volcanoMask),1.0);return;}

 // 기본 표면 모드에서는 변형을 제외하고 동일한 PBR 표면을 보여 준다.
 if(uViewMode!=1){
   // 넓게 그을린 지각 가장자리와 좁은 붉은 용암 중심부.
   float darkRim=uSolarLevel*crackEdge*heating;
   base=mix(base,vec3(0.050,0.018,0.015),darkRim*0.55);
   base=mix(base,vec3(0.30,0.042,0.010),solarMask*0.92);
   rough=mix(rough,0.19,solarMask);
   metal=mix(metal,0.06,solarMask);
   // 화산재가 넓게 쌓여 거칠고 어두운 현무암으로 변한다.
   base=mix(base,vec3(0.021,0.025,0.030),volcanoMask);
   rough=mix(rough,0.90,volcanoMask);
   metal=mix(metal,0.035,volcanoMask);
   // 화산 지대의 일부만 붉게 녹아 흐르며, 발광도 따로 더한다.
   base=mix(base,vec3(0.34,0.027,0.006),lavaFlow);
   rough=mix(rough,0.17,lavaFlow);
   metal=mix(metal,0.04,lavaFlow);
 }
 vec3 color = directPBR(N,V,L,base,rough,metal);
 vec3 F0 = mix(vec3(0.04),base,metal);
 color += uAmbient * ao * (base*(1.0-metal)*(1.0-F0)+F0);
 // TODO 2: 위의 Phong 두 줄을 directPBR(...) 호출과 ambient로 교체하세요.
 // 환경맵을 끄고 uAmbient=0일 때 직접광만 비교해 보세요.

 // TODO 5: 환경 파노라마를 reflect(-V,N) 방향으로 조회해 반사를 더하세요.
 // 금속에서 정반사색은 base, 유전체의 정면 반사율은 약 0.04입니다.
 // 이미지 밝기 uEnvPower와 상수 ambient uAmbient는 별개로 유지하세요.

 vec3 reflected = reflect(-V,N);
 vec2 envUV = vec2(atan(reflected.z,reflected.x)/(2.0*PI)+0.5,
                  asin(clamp(reflected.y,-1.0,1.0))/PI+0.5);
 vec3 envColor = srgbToLinear(textureLod(uEnv,envUV,rough*7.0).rgb);
 vec3 envF0 = mix(vec3(0.04),base,metal);
 color += uEnvPower * ao * envColor * envF0;
 // 두 종류의 발광: 태양열 균열은 주황, 화산 분출은 붉은색.
 // 발광 색은 주변 물체를 자동으로 비추지 않는다.
 if(uViewMode!=1){
   color+=solarMask*(1.0-0.65*volcanoMask)*vec3(2.4,0.32,0.025);
   color+=lavaFlow*vec3(3.1,0.10,0.013);
 }

 color=max(color,vec3(0.0));
 color=color/(1.0+color); // HDR → 표시 범위
 outColor=vec4(linearToSrgb(color),1.0);
}`;
const prog=D.program(gl,VS,FS),U=D.uniforms(gl,prog,[
 'uVP','uModel','uEye','uLightPos','uTint','uEmissionColor','uEmissive',
 'uRough','uMetal','uNormalStrength','uPower','uAmbient','uEnvPower',
 'uSolarLevel','uVolcanoLevel','uViewMode',
 'uColor','uNormal','uARM','uEnv'
]);
// 교수님 공용 도구의 위치/법선/UV를 모두 가진 구형 메시.
const sphere = D.upload(gl, D.revolution(D.profiles.sphere(1,48),64));
const assets={wood_planks:['Diffuse','nor_gl','arm'],rusty_metal_04:['Diffuse','nor_gl','arm'],rock_boulder_dry:['Diffuse','nor_gl','arm']};
const textures={},jobs=[];let failed=false;
function load(name){
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([128,128,255,255]));
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 jobs.push(new Promise(resolve=>{const img=new Image();img.onload=()=>{
  gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  resolve();
 };img.onerror=()=>{failed=true;resolve();};
 img.src='assets/week06/'+name+(name.endsWith('_arm')?'.png':'.jpg');}));
 return tex;
}
for(const [asset,kinds] of Object.entries(assets))textures[asset]=kinds.map(kind=>load(asset+'_'+kind));
const envTex=load('studio_small_09_tonemapped');
Promise.all(jobs).then(()=>{document.querySelector('#status').textContent=failed?'텍스처 로딩 실패: HTTP 서버와 파일 경로 확인':'텍스처 로딩 완료 · 6주차 실습 2: 태양과 자전하는 행성';});
document.querySelector('#ui').innerHTML='';
const S=D.UI('#ui',[
 {id:'solar',label:'태양 접근도 (0=멀리, 100=가까이)',min:0,max:100,step:1,value:35},
 {id:'volcano',label:'화산 활동 강도',min:0,max:100,step:1,value:30},
 {id:'mode',type:'select',label:'화면 모드',value:'result',options:[
  {value:'result',label:'변화한 표면'},
  {value:'baseline',label:'기본 표면 (변화 없음)'},
  {value:'solarMask',label:'마스크 1 · 태양 균열'},
  {value:'volcanoMask',label:'마스크 2 · 화산암'}]},
 {id:'spin',type:'check',label:'행성 자전',value:true},
 {id:'material',type:'select',label:'기본 행성 표면',value:'rock_boulder_dry',options:[
  {value:'rusty_metal_04',label:'녹슨 금속'},{value:'wood_planks',label:'나무'},{value:'rock_boulder_dry',label:'돌'}]},
 {id:'rough',label:'roughness 배율',min:.05,max:1,step:.01,value:1},
 {id:'metal',label:'metallic 배율',min:0,max:1,step:.01,value:1},
 {id:'normal',label:'normal 강도',min:0,max:10,step:.1,value:5},
 {id:'power',label:'직접광 세기',min:0,max:8,step:.1,value:4},
 {id:'ambient',label:'상수 ambient',min:0,max:1,step:.01,value:.15},
 {id:'env',label:'환경맵 반사 세기',min:0,max:3,step:.1,value:1.5},
]);

const cam=D.orbit(cv,{dist:9.0,pitch:.18,yaw:.4,min:4,max:25});
document.querySelector('#reset').onclick=()=>{
 cam.dist=9.0; cam.yaw=.4; cam.pitch=.18;
};
const view=D.M4.create(), proj=D.M4.create(), vp=D.M4.create();
const planetModel=D.M4.create(), sunModel=D.M4.create();
const sunPos=[-3.7,1.0,0.0];
let lastTime=null,spinAngle=0;
document.querySelector('#note').textContent=
 'Crackworld · 태양에 가까워지면 불규칙한 균열이 빛나고, 화산 활동이 커지면 검은 화산암과 붉은 용암 흐름이 나타납니다. 자전을 끄고 0/50/100과 두 마스크를 비교하세요.';
let visible=true;
new IntersectionObserver(e=>visible=e[0].isIntersecting).observe(cv);
D.loop((seconds)=>{
 if(!visible||document.hidden)return;
 D.fit(cv);
 gl.viewport(0,0,cv.width,cv.height);
 gl.clearColor(.012,.018,.037,1.0); // 우주 배경
 gl.enable(gl.DEPTH_TEST);
 gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const delta=lastTime===null?0:Math.min(0.05,Math.max(0,seconds-lastTime));
 lastTime=seconds;
 if(S.spin)spinAngle+=delta*.25;
 const solarLevel=S.solar/100,volcanoLevel=S.volcano/100;
 const modes={result:0,baseline:1,solarMask:2,volcanoMask:3};
 const planetX=1.30-2.40*solarLevel; // 태양 쪽으로 이동
 const eye=cam.eye([-.65,0,0]);
 D.M4.lookAt(view,eye,[-.65,0,0],[0,1,0]);
 D.M4.perspective(proj,Math.PI/4,cv.width/cv.height,.1,100);
 D.M4.multiply(vp,proj,view);

 gl.useProgram(prog);
 gl.uniformMatrix4fv(U.uVP,false,vp);
 gl.uniform3fv(U.uEye,eye);
 gl.uniform3fv(U.uLightPos,sunPos);
 gl.uniform1f(U.uSolarLevel,solarLevel);
 gl.uniform1f(U.uVolcanoLevel,volcanoLevel);
 gl.uniform1i(U.uViewMode,modes[S.mode]);
 for(const [key,value] of Object.entries({
  uRough:S.rough,uMetal:S.metal,uNormalStrength:S.normal,
  uPower:S.power,uAmbient:S.ambient,uEnvPower:S.env
 })) gl.uniform1f(U[key],value);
 [...textures[S.material],envTex].forEach((tex,i)=>{
  gl.activeTexture(gl.TEXTURE0+i);
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.uniform1i(U[['uColor','uNormal','uARM','uEnv'][i]],i);
 });

 // 행성: 로컬 좌표계에서 자전 → 모델 행렬로 월드 좌표계에 배치.
 D.M4.identity(planetModel);
 D.M4.translate(planetModel,planetModel,[planetX,0,0]);
 D.M4.rotateY(planetModel,planetModel,spinAngle);
 D.M4.scale(planetModel,planetModel,[1.48,1.48,1.48]);
 gl.uniformMatrix4fv(U.uModel,false,planetModel);
 gl.uniform3fv(U.uTint,[.80,.55,.50]);
 gl.uniform1i(U.uEmissive,0);
 gl.bindVertexArray(sphere.vao);
 gl.drawElements(gl.TRIANGLES,sphere.count,gl.UNSIGNED_SHORT,0);

 // 태양: 자체발광. uLightPos와 같은 위치에 그린다.
 D.M4.identity(sunModel);
 D.M4.translate(sunModel,sunModel,sunPos);
 D.M4.scale(sunModel,sunModel,[.72,.72,.72]);
 gl.uniformMatrix4fv(U.uModel,false,sunModel);
 gl.uniform3fv(U.uEmissionColor,[6.0,2.2,.32]);
 gl.uniform1i(U.uEmissive,1);
 gl.drawElements(gl.TRIANGLES,sphere.count,gl.UNSIGNED_SHORT,0);
 gl.bindVertexArray(null);
});
})();
