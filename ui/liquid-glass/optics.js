/*
 * Rounded-rectangle distance and edge-decay refraction adapted from
 * https://github.com/dashersw/liquid-glass-js (MIT).
 * The original MIT notice is preserved in this document's source.
 * Only our inline botanical artwork is sampled; no page screenshots or remote assets.
 */
function initBotanicalOptics(){
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)'),reduceTransparency=matchMedia('(prefers-reduced-transparency: reduce)'),mobile=matchMedia('(max-width:767px)');
 const assets=BOTANICAL_ART;
 const vertexSource=`attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;
 const fragmentSource=`precision highp float;
 uniform sampler2D u_image;uniform vec2 u_resolution;uniform vec2 u_size;uniform float u_dpr;
 uniform vec4 u_boxes[20];uniform float u_radii[20];uniform int u_count;uniform vec2 u_pointer;uniform vec3 u_tint;
 float distanceToBox(vec2 point,vec2 size,float radius){vec2 q=abs(point-size*.5)-(size*.5-radius);return length(max(q,0.))+min(max(q.x,q.y),0.)-radius;}
 vec3 sampleScene(vec2 point){return texture2D(u_image,clamp(point/u_size,vec2(.001),vec2(.999))).rgb;}
 void main(){
  vec2 p=vec2(gl_FragCoord.x,u_resolution.y-gl_FragCoord.y)/u_dpr;
  vec4 box=vec4(0.);float radius=0.;float dist=1000.;
  for(int i=0;i<20;i++){if(i>=u_count)break;vec4 candidate=u_boxes[i];float d=distanceToBox(p-candidate.xy,candidate.zw,u_radii[i]);if(d<dist){dist=d;box=candidate;radius=u_radii[i];}}
  if(dist>.65){gl_FragColor=vec4(0.);return;}
  vec2 local=p-box.xy;float depth=max(-dist,0.);float e=.7;
  vec2 normal=normalize(vec2(distanceToBox(local+vec2(e,0.),box.zw,radius)-distanceToBox(local-vec2(e,0.),box.zw,radius),distanceToBox(local+vec2(0.,e),box.zw,radius)-distanceToBox(local-vec2(0.,e),box.zw,radius))+vec2(.00001));
  float edge=exp(-depth*.12);float rim=exp(-depth*.9);float inner=exp(-abs(depth-4.5)*.4);
  vec2 offset=normal*(edge*16.+inner*2.);
  vec2 uv=p-offset;vec2 split=normal*edge*.65;
  vec3 color=sampleScene(uv)*.50;
  color+=sampleScene(uv+vec2(1.1,0.))*.125; color+=sampleScene(uv-vec2(1.1,0.))*.125;
  color+=sampleScene(uv+vec2(0.,1.1))*.125;color+=sampleScene(uv-vec2(0.,1.1))*.125;
  color.r=mix(color.r,sampleScene(uv+split).r,.35);color.b=mix(color.b,sampleScene(uv-split).b,.35);
  color=mix(color,u_tint,.18);
  float lamp=max(dot(normal,normalize(vec2(-.65,-.8))),0.);
  float pointerGlow=exp(-length(p-u_pointer)/160.);
  color+=vec3(.67,.82,.82)*(rim*(.025+.20*lamp)+inner*.012+pointerGlow*.035);
  float interior=clamp(local.y/box.w,0.,1.);color+=vec3(.65,.79,.83)*.035*(1.-interior);
  gl_FragColor=vec4(color,1.-smoothstep(-.45,.65,dist));
 }`;
 let pending=0,animateUntil=0;const instances=[];
 function requestRender(duration=0){if(document.hidden)return;animateUntil=Math.max(animateUntil,performance.now()+(reduceMotion.matches?0:duration));if(!pending)pending=requestAnimationFrame(render);}
 function render(now){pending=0;instances.forEach(instance=>instance.draw());if(now<animateUntil&&!document.hidden)pending=requestAnimationFrame(render);}
 class GlassScene{
  constructor(host,selector,key){
   this.host=host;this.selector=selector;this.key=key;this.image=new Image();this.asset='';this.w=0;this.h=0;this.pointer=[-1000,-1000];this.failed=false;this.canvas=document.createElement('canvas');this.canvas.className='glass-optics';this.canvas.setAttribute('aria-hidden','true');host.prepend(this.canvas);
   try{this.gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,depth:false,stencil:false});if(!this.gl)throw Error('WebGL unavailable');this.setup();}catch(error){this.fallback();return;}
   this.canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.fallback();});
   this.image.onload=()=>{this.textureDirty=true;requestRender();};this.image.onerror=()=>this.fallback();
   this.resize=new ResizeObserver(()=>requestRender());this.resize.observe(host);
   this.mutations=new MutationObserver(records=>{if(records.some(record=>record.type==='childList'?[...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&!node.matches('.glass-feedback')):record.oldValue!==record.target.getAttribute(record.attributeName)))requestRender();});this.mutations.observe(host,{childList:true,subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['hidden','aria-selected','aria-current']});
   host.addEventListener('pointermove',event=>{if(reduceMotion.matches||event.pointerType!=='mouse')return;const rect=host.getBoundingClientRect();this.pointer=[event.clientX-rect.left,event.clientY-rect.top];requestRender();},{passive:true});
   host.addEventListener('pointerleave',()=>{this.pointer=[-1000,-1000];requestRender();},{passive:true});
   host.addEventListener('pointerdown',()=>requestRender(450),{passive:true});host.addEventListener('pointerup',()=>requestRender(450),{passive:true});host.addEventListener('keydown',()=>requestRender(450));
  }
  fallback(){this.failed=true;this.host.classList.remove('gl-optics-ready');this.canvas.hidden=true;this.resize?.disconnect();this.mutations?.disconnect();}
  setup(){
   const gl=this.gl,compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('Glass shader unavailable');}return shader;};
   const vertex=compile(gl.VERTEX_SHADER,vertexSource),fragment=compile(gl.FRAGMENT_SHADER,fragmentSource),program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Glass shader link failed');
   this.program=program;gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
   this.locations={};['u_image','u_resolution','u_size','u_dpr','u_count','u_pointer','u_tint','u_boxes[0]','u_radii[0]'].forEach(name=>this.locations[name]=gl.getUniformLocation(program,name));
   this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(this.locations.u_image,0);gl.clearColor(0,0,0,0);
   this.source=document.createElement('canvas');
  }
  draw(){
   if(this.failed)return;
   if(reduceTransparency.matches){this.canvas.hidden=true;this.host.classList.remove('gl-optics-ready');return;}
   const hostRect=this.host.getBoundingClientRect();if(hostRect.bottom<0||hostRect.top>innerHeight||hostRect.width===0||hostRect.height===0)return;
   const palette=document.documentElement.dataset.palette==='dark'?'dark':'light';const asset=assets[palette]['cover'+(mobile.matches?'Mobile':'')];if(this.asset!==asset){this.asset=asset;this.image.src=asset;return;}
   if(!this.image.complete||!this.image.naturalWidth)return;
   this.canvas.hidden=false;
   const w=Math.round(hostRect.width),h=Math.round(hostRect.height),dpr=Math.min(devicePixelRatio||1,1.5);
   const gl=this.gl,L=this.locations;
   if(w!==this.w||h!==this.h||dpr!==this.dpr||this.textureDirty){
    this.w=w;this.h=h;this.dpr=dpr;this.textureDirty=false;
    this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);this.source.width=this.canvas.width;this.source.height=this.canvas.height;
    const ctx=this.source.getContext('2d'),scale=this.source.width/this.image.naturalWidth,iw=this.source.width,ih=this.image.naturalHeight*scale;
    ctx.fillStyle=palette==='dark'?'#232826':'#DAECF4';ctx.fillRect(0,0,this.source.width,this.source.height);ctx.drawImage(this.image,0,0,iw,ih);
    gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.source);
    gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.uniform2f(L.u_resolution,this.canvas.width,this.canvas.height);gl.uniform2f(L.u_size,w,h);gl.uniform1f(L.u_dpr,dpr);
   }
   const boxes=new Float32Array(80),radii=new Float32Array(20);let count=0;
   this.host.querySelectorAll(this.selector).forEach(surface=>{
    const rect=surface.getBoundingClientRect();if(!rect.width||!rect.height||count>=20)return;
    const isCounter=surface.classList.contains('count-unit'),mobileInset=mobile.matches?6:10,inset=isCounter?mobileInset:0;
    boxes.set([rect.left-hostRect.left-inset,rect.top-hostRect.top-(isCounter?4:0),rect.width+inset*2,rect.height+(isCounter?10:0)],count*4);
    radii[count]=isCounter?(mobile.matches?14:18):parseFloat(getComputedStyle(surface).borderRadius)||14;count++;
   });
   gl.useProgram(this.program);gl.uniform3f(L.u_tint,...(palette==='dark'?[35/255,40/255,38/255]:[218/255,236/255,244/255]));gl.uniform4fv(L['u_boxes[0]'],boxes);gl.uniform1fv(L['u_radii[0]'],radii);gl.uniform1i(L.u_count,count);gl.uniform2f(L.u_pointer,...(reduceMotion.matches?[-1000,-1000]:this.pointer));gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);this.host.classList.add('gl-optics-ready');
  }
 }
 instances.push(new GlassScene(document.querySelector('.trip-cover'),'.count-unit,.nav button','cover'));
 new MutationObserver(()=>requestRender()).observe(document.documentElement,{attributes:true,attributeFilter:['data-palette']});
 window.addEventListener('resize',()=>requestRender());window.addEventListener('scroll',()=>requestRender(),{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){if(pending)cancelAnimationFrame(pending);pending=0;animateUntil=0;}else requestRender();});
 for(const preference of [reduceMotion,reduceTransparency,mobile])preference.addEventListener('change',()=>requestRender());window.addEventListener('pageshow',()=>requestRender());requestRender();
}
initBotanicalOptics();
