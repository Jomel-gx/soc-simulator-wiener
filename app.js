let nodosM2, nodosM3Ataque, nodosM3Defensa;
let intervaloM1, intervaloM2Ataque, intervaloM2Defensa, intervaloM3Ataque, intervaloM3Defensa;
let battleInterval;

// ==========================================
// 0. RUTAS Y PANTALLAS
// ==========================================
const pantallas = {
    pLogin: document.getElementById('pantalla-login-cyber'),
    p0: document.getElementById('pantalla-bienvenida'),
    p1: document.getElementById('pantalla-modulo1'),
    p2: document.getElementById('pantalla-modulo2'),
    p3: document.getElementById('pantalla-modulo3'),
    pGlosario: document.getElementById('pantalla-glosario')
};

function switchPantalla(ocultar, mostrar) {
    resetSimulations(); 
    gsap.to(ocultar, {opacity: 0, duration: 0.3, onComplete: () => {
        ocultar.classList.add('d-none');
        mostrar.classList.remove('d-none');
        gsap.fromTo(mostrar, {opacity: 0}, {opacity: 1, duration: 0.4});
    }});
}

// ==========================================
// 1. LÓGICA DEL TERMINAL DE LOGIN
// ==========================================
document.getElementById('btnAccederTerminal')?.addEventListener('click', function() {
    const btn = this;
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> DESENCRIPTANDO...';
    
    setTimeout(() => {
        btn.classList.add('btn-granted');
        btn.innerHTML = '<i class="fa-solid fa-check me-2"></i> ACCESO AUTORIZADO';
        
        setTimeout(() => {
            switchPantalla(pantallas.pLogin, pantallas.p0);
            document.getElementById('tsparticles').classList.remove('d-none');
            initNeuralNetwork(); 
            generateWarningMatrix();
            
            // Tutorial (Opcional)
            if(!localStorage.getItem('tutorialP0Done')) {
                setTimeout(() => {
                    introJs().setOptions({ nextLabel: 'Siguiente', prevLabel: 'Atrás', doneLabel: 'Entendido', showStepNumbers: false }).start();
                    localStorage.setItem('tutorialP0Done', 'true');
                }, 15500); 
            }
        }, 1200);
    }, 1500);
});

// ==========================================
// 2. LÓGICA DEL BOTÓN DE ACCESIBILIDAD (DISLEXIA)
// ==========================================
document.getElementById('btnModoAccesible')?.addEventListener('click', function() {
    const body = document.body;
    body.classList.toggle('modo-lectura');
    
    if(body.classList.contains('modo-lectura')) {
        this.innerHTML = '<i class="fa-solid fa-eye me-2"></i> MODO ESTÁNDAR';
        this.style.background = '#d9534f'; 
        this.style.color = 'white';
        this.style.border = 'none';
    } else {
        this.innerHTML = '<i class="fa-solid fa-eye-low-vision me-2"></i> MODO LECTURA';
        this.style.background = 'rgba(255,255,255,0.1)';
        this.style.border = '1px solid rgba(255,255,255,0.3)';
        this.style.color = 'white';
    }
});

// ==========================================
// 3. MATRIZ DE WARNINGS Y BATALLA (GSAP)
// ==========================================
function generateWarningMatrix() {
    const matrix = document.getElementById('warning-matrix');
    if (!matrix) return;
    matrix.innerHTML = ''; 
    const fragment = document.createDocumentFragment();
    const clashFlash = document.createElement('div');
    clashFlash.className = 'clash-flash';
    fragment.appendChild(clashFlash);

    const icons = ['fa-triangle-exclamation', 'fa-skull-crossbones', 'fa-bug', 'fa-shield-halved', 'fa-bolt', 'fa-virus'];
    let redParticles = [], blueParticles = [];

    for (let i = 0; i < 200; i++) {
        let icon = document.createElement('i');
        let isRed = i < 100; 
        let top = Math.random() * 90 + 5; 
        let left = isRed ? (Math.random() * 30 + 5) : (Math.random() * 30 + 65); 
        icon.className = `fa-solid ${icons[Math.floor(Math.random() * icons.length)]} matrix-icon ${isRed ? 'matrix-red' : 'matrix-blue'}`;
        icon.style.top = `${top}%`; icon.style.left = `${left}%`; icon.style.fontSize = `${Math.random() * 1.5 + 0.8}rem`;
        icon.dataset.origTop = top; icon.dataset.origLeft = left; icon.dataset.attacking = 'false';
        icon.style.opacity = '0'; icon.style.transform = 'scale(0)';
        fragment.appendChild(icon);
        if (isRed) redParticles.push(icon); else blueParticles.push(icon);
    }
    matrix.appendChild(fragment);

    let allParticles = [...redParticles, ...blueParticles];
    allParticles.forEach(icon => {
        let spawnDelay = Math.random() * 6;
        gsap.to(icon, {
            opacity: Math.random() * 0.4 + 0.3, scale: 1, duration: 1, delay: spawnDelay, ease: "back.out(1.5)",
            onComplete: () => { gsap.to(icon, { y: (Math.random() - 0.5) * 15, x: (Math.random() - 0.5) * 15, duration: Math.random() * 2 + 2, repeat: -1, yoyo: true, ease: "sine.inOut" }); }
        });
    });

    setTimeout(() => { if (!document.getElementById('pantalla-bienvenida').classList.contains('d-none')) { startCrazyBattle(redParticles, blueParticles, clashFlash); } }, 6000);
    setTimeout(() => { clearInterval(battleInterval); }, 15000);
}

function startCrazyBattle(redParticles, blueParticles, clashFlash) {
    clearInterval(battleInterval); 
    battleInterval = setInterval(() => {
        let redP = redParticles[Math.floor(Math.random() * redParticles.length)];
        let blueP = blueParticles[Math.floor(Math.random() * blueParticles.length)];
        if (redP.dataset.attacking === 'true') redP = null;
        if (blueP.dataset.attacking === 'true') blueP = null;
        if (redP) fireParticle(redP, 1, clashFlash);   
        if (blueP) fireParticle(blueP, -1, clashFlash); 
    }, 80);
}

function fireParticle(particle, direction, clashFlash) {
    particle.dataset.attacking = 'true';
    gsap.killTweensOf(particle); 
    let origTop = particle.dataset.origTop, origLeft = particle.dataset.origLeft, clashY = 45 + Math.random() * 10; 
    let tl = gsap.timeline({
        onComplete: () => {
            gsap.set(particle, { left: `${origLeft}%`, top: `${origTop}%`, opacity: 0, scale: 0, rotation: 0 });
            gsap.to(particle, { opacity: Math.random() * 0.4 + 0.3, scale: 1, duration: 0.5, ease: "back.out(1.5)",
                onComplete: () => { particle.dataset.attacking = 'false'; gsap.to(particle, { y: (Math.random() - 0.5) * 15, x: (Math.random() - 0.5) * 15, duration: Math.random() * 2 + 2, repeat: -1, yoyo: true, ease: "sine.inOut" }); }
            });
        }
    });
    tl.to(particle, { left: '50%', top: `${clashY}%`, scale: 2.5, opacity: 1, rotation: direction * 180, duration: 0.3 + Math.random() * 0.2, ease: "power2.in" })
      .to(particle, { scale: 4, opacity: 0, duration: 0.1, onStart: () => { gsap.fromTo(clashFlash, { opacity: 0.9, scale: 0.5 }, { opacity: 0, scale: 1.5 + Math.random(), duration: 0.3, ease: "power2.out" }); } });
}

function initNeuralNetwork() {
    if(typeof tsParticles !== 'undefined') {
        tsParticles.load("tsparticles", {
            particles: { number: { value: 70, density: { enable: true, value_area: 800 } }, color: { value: ["#00ffff", "#ff0033"] }, shape: { type: "circle" }, opacity: { value: 0.6, random: true }, size: { value: 3, random: true }, links: { enable: true, distance: 150, color: "#00ffff", opacity: 0.4, width: 1.5 }, move: { enable: true, speed: 1.2, direction: "none", random: false, straight: false, outModes: "out" } },
            interactivity: { events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } }, modes: { grab: { distance: 180, links: { opacity: 0.9, color: "#ff0033" } }, push: { quantity: 4 } } }, detectRetina: true
        });
    }
}

// ==========================================
// 4. CONTADOR Y FUNCIONES UTILS
// ==========================================
let globalClicks = parseInt(localStorage.getItem('simClicks')) || 0;
const clickDisplay = document.getElementById('click-counter-display');
const pulseContainer = document.querySelector('.pulse-container');

function updateClickHUD() {
    globalClicks++; localStorage.setItem('simClicks', globalClicks);
    if (clickDisplay) {
        clickDisplay.innerText = String(globalClicks).padStart(6, '0');
        if(pulseContainer) { pulseContainer.classList.remove('pulse-active'); void pulseContainer.offsetWidth; pulseContainer.classList.add('pulse-active'); }
    }
}
document.addEventListener('click', updateClickHUD); 
if (clickDisplay) clickDisplay.innerText = String(globalClicks).padStart(6, '0'); 

function typeLog(containerId, htmlContent) {
    const container = document.getElementById(containerId); if (!container) return;
    const div = document.createElement('div'); div.className = 'typewriter-line'; div.innerHTML = htmlContent;
    container.insertBefore(div, container.firstChild);
    if (container.children.length > 30) container.removeChild(container.lastChild);
}
function clearTerminal(containerId) { document.getElementById(containerId).innerHTML = ''; }

function crearNodos(contenedorId, cantidad) {
    const contenedor = document.getElementById(contenedorId); if (!contenedor) return [];
    contenedor.innerHTML = ""; let nodos = [];
    for (let i = 0; i < cantidad; i++) {
        let nodo = document.createElement('div'); nodo.className = 'cyber-node node-green'; nodo.innerHTML = '<i class="fa-solid fa-server"></i>'; 
        nodo.style.top = `${Math.floor(Math.random() * 75) + 10}%`; nodo.style.left = `${Math.floor(Math.random() * 85) + 5}%`;
        contenedor.appendChild(nodo); nodos.push(nodo);
    }
    return nodos;
}

// ==========================================
// 5. GARBAGE COLLECTOR
// ==========================================
function resetSimulations() {
    clearInterval(intervaloM1); clearInterval(intervaloM2Ataque); clearInterval(intervaloM2Defensa); clearInterval(intervaloM3Ataque); clearInterval(intervaloM3Defensa); clearInterval(battleInterval); 
    gsap.killTweensOf(".matrix-icon");

    document.getElementById('btnAtaque1').removeAttribute('disabled'); document.getElementById('btnDefensa1').setAttribute('disabled', 'true');
    const scan1 = document.getElementById('animacionScan'); scan1.classList.add('d-none'); scan1.classList.remove('scan-red'); 
    document.getElementById('hexDump').classList.add('d-none'); document.getElementById('estadoDefensa').innerHTML = "SISTEMA EN ESPERA"; clearTerminal('hexDump');

    document.getElementById('btnCarding').removeAttribute('disabled'); document.getElementById('btnDefensa2').setAttribute('disabled', 'true');
    document.getElementById('barraAtaque').style.width = '0%'; document.getElementById('barraDefensa').style.width = '0%';
    clearTerminal('firewallLogs'); typeLog('firewallLogs', '<div class="typewriter-line text-secondary">&gt; Motor de IA en espera...</div>');
    nodosM2 = crearNodos('mapaNodos', 15);

    document.getElementById('btnPhishing').removeAttribute('disabled'); document.getElementById('btnEducacion').setAttribute('disabled', 'true');
    document.getElementById('barraInfeccion').style.width = '0%'; document.getElementById('barraIntegridad').style.width = '100%';
    document.getElementById('card-phishing').classList.remove('lockdown-zone', 'glitch-border');
    clearTerminal('phishingLogs'); clearTerminal('zeroTrustLogs');
    typeLog('phishingLogs', '<div class="typewriter-line text-secondary">&gt; Esperando orden de despliegue...</div>'); typeLog('zeroTrustLogs', '<div class="typewriter-line text-secondary">&gt; Sistema a la espera de anomalías...</div>');
    nodosM3Ataque = crearNodos('mapaPhishing', 12); nodosM3Defensa = crearNodos('mapaZeroTrust', 12);
}

// ==========================================
// 6. EVENTOS DE NAVEGACIÓN
// ==========================================
document.getElementById('btnIniciar')?.addEventListener('click', () => switchPantalla(pantallas.p0, pantallas.p1));
document.getElementById('btnIrModulo2')?.addEventListener('click', () => switchPantalla(pantallas.p1, pantallas.p2));
document.getElementById('btnIrModulo3')?.addEventListener('click', () => switchPantalla(pantallas.p2, pantallas.p3));
document.getElementById('btnIrGlosario')?.addEventListener('click', () => switchPantalla(pantallas.p3, pantallas.pGlosario));
document.getElementById('btnReiniciarSimulacion')?.addEventListener('click', () => { switchPantalla(pantallas.pGlosario, pantallas.p0); generateWarningMatrix(); });

document.getElementById('btnVolverP0')?.addEventListener('click', () => switchPantalla(pantallas.p1, pantallas.p0));
document.getElementById('btnVolverM1')?.addEventListener('click', () => switchPantalla(pantallas.p2, pantallas.p1));
document.getElementById('btnVolverM2')?.addEventListener('click', () => switchPantalla(pantallas.p3, pantallas.p2));
document.getElementById('btnVolverM3')?.addEventListener('click', () => switchPantalla(pantallas.pGlosario, pantallas.p3));

// ==========================================
// LÓGICA MÓDULO 1: RAM Scraping
// ==========================================
document.getElementById('btnAtaque1')?.addEventListener('click', () => {
    clearInterval(intervaloM1);
    document.getElementById('btnAtaque1').setAttribute('disabled', 'true');
    document.getElementById('hexDump').classList.remove('d-none');
    document.getElementById('animacionScan').classList.remove('d-none');
    document.getElementById('animacionScan').classList.add('scan-red');
    clearTerminal('hexDump'); typeLog('hexDump', '> Iniciando inyección en memoria...');
    document.getElementById('estadoDefensa').innerHTML = "SISTEMA EN ESPERA";

    intervaloM1 = setInterval(() => {
        let hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padEnd(6, '0').toUpperCase();
        let memAddr = "0x" + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padEnd(8, '0').toUpperCase();
        typeLog('hexDump', `<span style="color:#ff0033;">[EXTRACT]</span> ${memAddr} : ${hex}`);
    }, 150);
    setTimeout(() => { document.getElementById('btnDefensa1').removeAttribute('disabled'); document.getElementById('estadoDefensa').innerHTML = "<span class='text-danger glow-text-red'><i class='fa-solid fa-triangle-exclamation'></i> ¡ANOMALÍA DETECTADA!</span>"; }, 2000);
});

document.getElementById('btnDefensa1')?.addEventListener('click', () => {
    document.getElementById('btnDefensa1').setAttribute('disabled', 'true');
    document.getElementById('estadoDefensa').innerHTML = "<span class='text-warning'><i class='fa-solid fa-radar'></i> ESCANEO BIOMÉTRICO...</span>";
    document.getElementById('animacionScan').classList.remove('scan-red');

    setTimeout(() => {
        clearInterval(intervaloM1); document.getElementById('animacionScan').classList.add('d-none'); 
        document.getElementById('estadoDefensa').innerHTML = "<span class='text-success glow-text-green'><i class='fa-solid fa-check-double'></i> VERIFICADO. SEGURO.</span>";
        typeLog('hexDump', "<br><span class='text-success fw-bold'> >>> BLOQUEADO. PURGA DE MEMORIA ACTIVADA.</span>");
        document.getElementById('btnAtaque1').removeAttribute('disabled'); 
    }, 3000);
});

// ==========================================
// LÓGICA MÓDULO 2: Botnet vs IA
// ==========================================
document.getElementById('btnCarding')?.addEventListener('click', () => {
    clearInterval(intervaloM2Ataque); clearInterval(intervaloM2Defensa);
    document.getElementById('btnCarding').setAttribute('disabled', 'true');
    document.getElementById('barraDefensa').style.width = '0%';
    clearTerminal('firewallLogs'); typeLog('firewallLogs', "> Detectando tráfico masivo...");
    nodosM2.forEach(n => { n.className = 'cyber-node node-infected'; n.innerHTML = '<i class="fa-solid fa-server"></i>'; });

    let progresoAtaque = 0;
    intervaloM2Ataque = setInterval(() => {
        if(progresoAtaque < 100) { progresoAtaque += 5; document.getElementById('barraAtaque').style.width = `${progresoAtaque}%`; }
        typeLog('firewallLogs', `<span style="color:#ff0033;">[DDoS ALERTA]</span> Flood en puerto TCP 192.168.1.${Math.floor(Math.random()*255)}`);
    }, 200);
    setTimeout(() => document.getElementById('btnDefensa2').removeAttribute('disabled'), 1000);
});

document.getElementById('btnDefensa2')?.addEventListener('click', () => {
    document.getElementById('btnDefensa2').setAttribute('disabled', 'true'); let tick = 0;
    intervaloM2Defensa = setInterval(() => {
        if (tick < nodosM2.length) { nodosM2[tick].className = 'cyber-node node-purged'; nodosM2[tick].innerHTML = '<i class="fa-solid fa-shield-halved"></i>'; tick++; }
        let prog = (tick / nodosM2.length) * 100;
        document.getElementById('barraDefensa').style.width = `${prog}%`; document.getElementById('barraAtaque').style.width = `${100 - prog}%`; 
        typeLog('firewallLogs', `<span class="text-info">[IA ACTIVA]</span> Analizando y bloqueando patrón...`);

        if(tick >= nodosM2.length) {
            clearInterval(intervaloM2Ataque); clearInterval(intervaloM2Defensa);
            typeLog('firewallLogs', "<br><span class='text-success fw-bold'> >>> RED BOTNET NEUTRALIZADA AL 100%.</span>");
            document.getElementById('btnCarding').removeAttribute('disabled'); 
        }
    }, 250);
});

// ==========================================
// LÓGICA MÓDULO 3: Intercepción vs Zero-Trust
// ==========================================
document.getElementById('btnPhishing')?.addEventListener('click', () => {
    clearInterval(intervaloM3Ataque);
    document.getElementById('btnPhishing').setAttribute('disabled', 'true');
    document.getElementById('barraInfeccion').style.width = '0%'; document.getElementById('barraIntegridad').style.width = '100%';
    clearTerminal('phishingLogs'); clearTerminal('zeroTrustLogs');
    typeLog('phishingLogs', "> Iniciando propagación de malware de phishing..."); typeLog('zeroTrustLogs', "> Sistema comprometido. Advertencia de intrusión...");
    document.getElementById('card-phishing').classList.add('glitch-border'); document.getElementById('card-phishing').classList.remove('lockdown-zone');
    nodosM3Ataque.forEach(n => { n.className = 'cyber-node node-infected'; n.innerHTML = '<i class="fa-solid fa-server"></i>'; });
    nodosM3Defensa.forEach(n => { n.className = 'cyber-node node-infected'; n.innerHTML = '<i class="fa-solid fa-server"></i>'; });

    let progInfeccion = 0;
    intervaloM3Ataque = setInterval(() => {
        if(progInfeccion < 100) { progInfeccion += 5; document.getElementById('barraInfeccion').style.width = `${progInfeccion}%`; document.getElementById('barraIntegridad').style.width = `${100 - progInfeccion}%`; }
        let subred = `10.0.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*255)}`;
        typeLog('phishingLogs', `<span style="color:#ff0033;">[PAYLOAD]</span> Inyectando troyano en subred ${subred}... EXITOSO`);
    }, 250);
    setTimeout(() => document.getElementById('btnEducacion').removeAttribute('disabled'), 1500);
});

document.getElementById('btnEducacion')?.addEventListener('click', () => {
    document.getElementById('btnEducacion').setAttribute('disabled', 'true');
    document.getElementById('card-phishing').classList.remove('glitch-border'); document.getElementById('card-phishing').classList.add('lockdown-zone'); 
    clearInterval(intervaloM3Ataque);

    let scanner = document.createElement('div'); scanner.className = 'overlay-scan'; document.getElementById('mapaZeroTrust').appendChild(scanner);
    gsap.to(scanner, {top: '100%', duration: 1.5, repeat: 2, yoyo: true, onComplete: () => scanner.remove()});

    let tick = 0;
    intervaloM3Defensa = setInterval(() => {
        let ips = `10.0.${Math.floor(Math.random()*20)}.${Math.floor(Math.random()*255)}`;
        typeLog('zeroTrustLogs', `[<i class="fa-solid fa-check text-success"></i>] AISLANDO HOST ${ips} -> CORTADO Y SANITIZADO`);
        
        if (tick < nodosM3Defensa.length) {
            nodosM3Defensa[tick].className = 'cyber-node node-purged'; nodosM3Defensa[tick].innerHTML = '<i class="fa-solid fa-shield-virus"></i>';
            nodosM3Ataque[tick].className = 'cyber-node node-purged'; nodosM3Ataque[tick].innerHTML = '<i class="fa-solid fa-shield-virus"></i>';
            tick++;
        }
        let prog = (tick / nodosM3Defensa.length) * 100;
        document.getElementById('barraIntegridad').style.width = `${prog}%`; document.getElementById('barraInfeccion').style.width = `${100 - prog}%`; 

        if (tick >= nodosM3Defensa.length) {
            clearInterval(intervaloM3Defensa);
            typeLog('zeroTrustLogs', "<br><span class='text-white fw-bold'>>>> PROTOCOLO COMPLETADO. RED SEGURA.</span>");
            typeLog('phishingLogs', "<br><span class='text-secondary'>[X] CONEXIÓN PERDIDA CON LOS SERVIDORES.</span>");
            document.getElementById('btnPhishing').removeAttribute('disabled'); 
        }
    }, 300);
});