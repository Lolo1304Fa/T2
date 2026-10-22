import * as THREE from 'three';

const escena = new THREE.Scene();
escena.background = new THREE.Color(0xffffff);
const camara = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 170);
const render = new THREE.WebGLRenderer({antialias:true});
render.setSize(innerWidth, innerHeight);
render.setPixelRatio(Math.min(devicePixelRatio,2));
document.body.appendChild(render.domElement);
escena.add(new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 2));
const luz = new THREE.DirectionalLight(0xffffff, 2);
luz.position.set(-4, 12, 8);
escena.add(luz);
const material = color => new THREE.MeshStandardMaterial({color});
function caja(w,h,d,color,x,y,z){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));
  m.position.set(x,y,z); escena.add(m); return m;
}
caja(9,0.2,150,0xb58b60,0,-0.15,-47);
caja(13,0.15,150,0x79b85c,-11,-0.17,-47);
caja(13,0.15,150,0x79b85c,11,-0.17,-47);
const marcas=[];
for(let i=0;i<22;i++){
  const m=caja(0.15,0.02,1.7,0xe5cca9,-3.7,0,8-i*5);
  marcas.push(m);
}

const jugador=new THREE.Group();
escena.add(jugador);
const naranja=material(0xff8500);
function esfera(r,x,y,z,grupo=jugador){
 const m=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),naranja);
 m.position.set(x,y,z); grupo.add(m); return m;
}
function barra(r,alto,x,y,z,grupo=jugador){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,alto,10),naranja);
 m.position.set(x,y,z); grupo.add(m); return m;
}
esfera(0.34,0,2.65,0);
barra(0.12,0.9,0,1.88,0);
function extremidad(x,y,largo){
 const g=new THREE.Group(); g.position.set(x,y,0); jugador.add(g);
 const p=new THREE.Mesh(new THREE.CylinderGeometry(0.085,0.085,largo,8),naranja);
 p.position.y=-largo/2; g.add(p); return g;
}
const brazoIzq=extremidad(-0.24,2.22,0.82);
const brazoDer=extremidad(0.24,2.22,0.82);
const piernaIzq=extremidad(-0.14,1.44,1.26);
const piernaDer=extremidad(0.14,1.44,1.26);
jugador.position.set(0,0,0);

const piedra=new THREE.Mesh(new THREE.SphereGeometry(2.1,24,16), material(0x777777));
piedra.position.set(2.6,2.1,7.3); escena.add(piedra);
new THREE.TextureLoader().load('piedra.png', tex=>{
 piedra.material.map=tex; piedra.material.needsUpdate=true;
},undefined,()=>console.warn('Se usa piedra gris sin textura'));

const obstaculos=[];
function nuevoObstaculo(z){
 const cono=new THREE.Mesh(new THREE.ConeGeometry(0.65,1.9,5),material(0x3d6f41));
 cono.position.set((Math.floor(Math.random()*3)-1)*2.8,0.95,z);
 escena.add(cono); obstaculos.push(cono);
}
for(let i=0;i<8;i++)nuevoObstaculo(-18-i*13);

const teclas={};
window.addEventListener('keydown',e=>{
 if(['a','d'].includes(e.key.toLowerCase())) e.preventDefault();
 teclas[e.key.toLowerCase()]=true;
});
window.addEventListener('keyup',e=>teclas[e.key.toLowerCase()]=false);
window.addEventListener('blur',()=>{for(const k in teclas)teclas[k]=false;});
const reloj=new THREE.Clock();
let tiempo=0;
function animar(){
 requestAnimationFrame(animar);
 const dt=Math.min(reloj.getDelta(),0.05);
 tiempo+=dt;
 const x=(teclas.a?-1:0)+(teclas.d?1:0);
 jugador.position.x=THREE.MathUtils.clamp(jugador.position.x+x*dt*6,-3.6,3.6);
 const paso=Math.sin(tiempo*13)*0.62;
 brazoIzq.rotation.x=paso; brazoDer.rotation.x=-paso;
 piernaIzq.rotation.x=-paso; piernaDer.rotation.x=paso;
 jugador.position.y=Math.abs(Math.sin(tiempo*13))*0.075;
 piedra.position.x=THREE.MathUtils.lerp(piedra.position.x,jugador.position.x+2.2,dt*0.5);
 piedra.position.z=jugador.position.z+7.3+Math.sin(tiempo*1.5)*0.17;
 piedra.rotation.x-=dt*1.7;
 for(const m of marcas){m.position.z+=dt*10;if(m.position.z>11)m.position.z=-95;}
 for(const c of obstaculos){
  c.position.z+=dt*10;
  c.rotation.y+=dt*0.5;
  if(c.position.z>11){c.position.z=-85-Math.random()*20;c.position.x=(Math.floor(Math.random()*3)-1)*2.8;}
 }
 camara.position.lerp(new THREE.Vector3(jugador.position.x*0.32,8.3,jugador.position.z+18),dt*2.5);
 camara.lookAt(jugador.position.x*0.5,1.15,jugador.position.z-9);
 render.render(escena,camara);
}
window.addEventListener('resize',()=>{
 camara.aspect=innerWidth/innerHeight;camara.updateProjectionMatrix();render.setSize(innerWidth,innerHeight);
});
document.getElementById('estado').textContent='Stickman naranja listo — la roca te persigue';
animar();
