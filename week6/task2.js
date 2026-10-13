/* 6주차 실습 2: Crackworld — 단계 1, 태양과 자전하는 암석 행성.
 * 6주차 실습 1의 PBR(D/F/G), 색/ARM/normal/환경맵 재질 계산을 유지.
 * 뒤 단계에서 태양 거리와 화산 활동에 따른 마스크 2개를 연결한다.
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

 // 행성 로컬 좌표에서 계산하여 자전해도 마스크가 표면에 고정된다.
 // ① 태양 조건: 사인 곡선의 작은 값들을 가느다란 균열로 간주한다.
 float lineA=abs(sin(19.0*vLocal.x+4.0*sin(10.0*vLocal.y+8.0*vLocal.z)));
 float lineB=abs(sin(19.0*vLocal.z+4.0*sin(7.0*vLocal.y-7.0*vLocal.x)));
 float fracture=1.0-smoothstep(0.05,0.23,min(lineA,lineB));
 float heatZone=0.5+0.5*sin(5.5*vLocal.y+2.3*vLocal.x-3.7*vLocal.z);
 float solarMask=uSolarLevel*fracture*
      smoothstep(1.04-0.90*uSolarLevel,1.18-0.90*uSolarLevel,heatZone);

 // ② 독립적인 화산 활동: 면적이 넓은 화산재/화산암 무늬.
 float ashNoise=0.5
     +0.25*sin(8.0*vLocal.y+sin(5.0*vLocal.x))
     +0.25*sin(9.0*vLocal.z-4.0*vLocal.x);
 float volcanoMask=uVolcanoLevel*
      smoothstep(1.00-0.75*uVolcanoLevel,
                 1.17-0.75*uVolcanoLevel,ashNoise);

 // 마스크는 원래 재질/조명의 영향을 받지 않는 흑백 진단 화면.
 if(uViewMode==2){outColor=vec4(vec3(solarMask),1.0);return;}
 if(uViewMode==3){outColor=vec4(vec3(volcanoMask),1.0);return;}

 // 기본 표면 보기에서는 두 조건의 재질 변화만 끈다.
 if(uViewMode!=1){
   // 뜨거운 균열: 주황색과 낮은 roughness.
   base=mix(base,vec3(0.31,0.055,0.012),solarMask*0.90);
   rough=mix(rough,0.13,solarMask);
   metal=mix(metal,0.08,solarMask);
   // 화산재: 검은 현무암, 높은 roughness. 겹칠 때 화산재가 우선.
   base=mix(base,vec3(0.018,0.026,0.038),volcanoMask);
   rough=mix(rough,0.91,volcanoMask);
   metal=mix(metal,0.04,volcanoMask);
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
 // 균열 내부의 자체발광 색. 물리적인 주변 조명은 태양이 담당한다.
 if(uViewMode!=1) color += solarMask*(1.0-0.9*volcanoMask)
                          *vec3(2.0,0.22,0.018);

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
 'Crackworld · 2단계: 태양 접근도는 위치와 균열을 함께 바꾸고, 화산 활동은 검은 암석 마스크를 독립적으로 바꿉니다. 자전을 끈 뒤 각 값을 0/50/100으로 비교하세요.';
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
