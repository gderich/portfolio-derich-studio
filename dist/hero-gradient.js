(() => {
  const hero = document.querySelector(".home-hero");
  const canvas = hero?.querySelector(".hero-canvas");
  const phrase = hero?.querySelector("[data-hero-phrase]");
  if (!hero || !canvas) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!reduced.matches && phrase) {
    const lines = ["Para ser encontrado.", "Para ser entendido.", "Para facilitar o próximo passo."];
    let index = 0;
    // Percorre as frases uma única vez e para na última (WCAG 2.2.2: sem movimento contínuo).
    const timer = window.setInterval(() => {
      if (document.hidden || reduced.matches) return;
      phrase.classList.add("is-changing");
      window.setTimeout(() => {
        index = (index + 1) % lines.length;
        phrase.textContent = lines[index];
        if (index === lines.length - 1) window.clearInterval(timer);
        phrase.classList.remove("is-changing");
      }, 240);
    }, 3300);
  }

  // Adapted from the Velaris simplex-noise shader supplied for this project.
  // Função snoise (simplex noise 2D): Ian McEwan, Ashima Arts — Licença MIT.
  // Copyright (C) 2011 Ashima Arts; ver THIRD_PARTY_NOTICES.md. https://github.com/ashima/webgl-noise
  // The CSS background remains visible if WebGL is unavailable or motion is reduced.
  if (reduced.matches) return;
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  if (!gl) return;

  const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`;
  const fragment = `
precision highp float;
varying vec2 vUv;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_grain;
uniform vec3 u_colors[4];
uniform vec3 u_bg;
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv - 0.5;
  p.x *= ratio;
  float t = u_time * 0.1;
  float n1 = snoise(p * 0.4 + vec2(t * 0.2, -t * 0.3));
  float n2 = snoise(p * 0.55 + vec2(-t * 0.15, t * 0.25) + n1 * 0.25);
  float n3 = snoise(p * 0.75 + vec2(t * 0.1, -t * 0.2) + n2 * 0.2);
  vec3 col = u_bg;
  float dist = length(p) * 1.5;
  float vignette = 1.0 - smoothstep(0.3, 1.2, dist);
  col = mix(col, u_colors[0], smoothstep(-0.2, 0.5, n1) * 0.85);
  col = mix(col, u_colors[1], smoothstep(-0.1, 0.6, n2) * 0.7);
  col = mix(col, u_colors[2], smoothstep(-0.3, 0.4, n3) * 0.6);
  col = mix(col, u_colors[3], smoothstep(0.0, 0.7, n1 * n2) * 0.5);
  float glow = smoothstep(0.8, 0.0, dist) * 0.3;
  col += u_colors[1] * glow;
  col = mix(col * 0.2, col, vignette);
  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.1;
  gl_FragColor = vec4(col, 1.0);
}
`;
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex);
  const fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return;
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const res = gl.getUniformLocation(program, "u_resolution");
  const time = gl.getUniformLocation(program, "u_time");
  const grain = gl.getUniformLocation(program, "u_grain");
  const colors = gl.getUniformLocation(program, "u_colors");
  const bg = gl.getUniformLocation(program, "u_bg");
  const palette = new Float32Array([
    .20,.36,.65, .30,.24,.59, .11,.47,.57, .45,.20,.40
  ]);
  gl.uniform3fv(colors, palette);
  gl.uniform3f(bg, .035, .06, .15);
  gl.uniform1f(grain, .09);
  const resize = () => {
    const rect = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(res, canvas.width, canvas.height);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(hero);
  resize();
  let frame = 0, last = 0, visible = true, stopped = false;
  const render = (now) => {
    if (stopped) return;
    frame = requestAnimationFrame(render);
    if (!visible || document.hidden || now - last < 45) return;
    last = now;
    gl.uniform1f(time, now * .0005);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.classList.add("is-ready");
  };
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  intersection.observe(hero);
  frame = requestAnimationFrame(render);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault(); stopped = true; cancelAnimationFrame(frame);
    canvas.classList.remove("is-ready"); observer.disconnect(); intersection.disconnect();
  }, { once: true });
})();
