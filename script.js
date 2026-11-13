/*
 * Portfólio do Getúlio: gato, bugs, terminal e conquistas.
 * Tudo aqui é opcional: sem este arquivo o site continua funcionando.
 */
(() => {
    'use strict';

    const $ = (seletor) => document.querySelector(seletor);
    const aleatorio = (min, max) => min + Math.random() * (max - min);
    const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];

    /* ---------- Memória (localStorage, com proteção caso esteja bloqueado) ---------- */
    const memoria = {
        ler(chave, padrao) {
            try {
                const valor = localStorage.getItem(chave);
                return valor === null ? padrao : JSON.parse(valor);
            } catch {
                return padrao;
            }
        },
        gravar(chave, valor) {
            try {
                localStorage.setItem(chave, JSON.stringify(valor));
            } catch { /* sem memória, segue o jogo */ }
        },
    };

    /* ---------- Liga e desliga as animações ---------- */
    const prefereMenos = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animado = memoria.ler('gt-animacoes', !prefereMenos);
    const btnAnimacoes = $('#btn-animacoes');

    function aplicarAnimacoes() {
        document.documentElement.classList.toggle('sem-animacao', !animado);
        btnAnimacoes.setAttribute('aria-pressed', String(animado));
        btnAnimacoes.textContent = animado ? 'Animações: ligadas' : 'Animações: desligadas';
    }

    btnAnimacoes.addEventListener('click', () => {
        animado = !animado;
        memoria.gravar('gt-animacoes', animado);
        aplicarAnimacoes();
        if (animado) {
            gato.ate = performance.now() + 800;
        } else {
            removerBug();
            clima.textContent = '';
            definirEstado('sentado');
            terminarTerminal();
        }
    });

    /* ---------- Barra de progresso da leitura ---------- */
    const xpBarra = $('#xp-barra');
    function atualizarXp() {
        const total = document.documentElement.scrollHeight - innerHeight;
        xpBarra.style.width = (total > 0 ? Math.min(1, scrollY / total) * 100 : 0) + '%';
    }
    addEventListener('scroll', atualizarXp, { passive: true });
    addEventListener('resize', atualizarXp);

    /* ---------- Terminal que digita sozinho ---------- */
    const terminal = $('#terminal');
    const LINHAS = [
        ['cmd', '$ whoami'],
        ['', 'getulio.tavares'],
        ['cmd', '$ cat curso.txt'],
        ['', 'Sistemas de Informação'],
        ['cmd', '$ ls foco/'],
        ['', 'interfaces-web  banco-de-dados  ciencia-de-dados'],
        ['cmd', '$ ./proximo-nivel.sh'],
        ['', 'carregando back-end com Python e C#...'],
    ];
    let terminalPronto = false;

    function terminarTerminal() {
        if (terminalPronto) return;
        terminalPronto = true;
        terminal.textContent = '';
        LINHAS.forEach(([classe, texto], i) => {
            const linha = document.createElement('span');
            if (classe) linha.className = classe;
            linha.textContent = texto + (i < LINHAS.length - 1 ? '\n' : ' ');
            terminal.append(linha);
        });
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        terminal.append(cursor);
    }

    async function digitarTerminal() {
        const esperar = (ms) => new Promise((ok) => setTimeout(ok, ms));
        terminal.textContent = '';
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        terminal.append(cursor);

        for (let i = 0; i < LINHAS.length; i++) {
            const [classe, texto] = LINHAS[i];
            const linha = document.createElement('span');
            if (classe) linha.className = classe;
            cursor.before(linha);

            if (classe === 'cmd') {
                await esperar(450);
                for (const letra of texto) {
                    if (terminalPronto) return;
                    linha.textContent += letra;
                    await esperar(aleatorio(35, 85));
                }
                await esperar(300);
            } else {
                linha.textContent = texto;
            }
            if (terminalPronto) return;
            linha.textContent += i < LINHAS.length - 1 ? '\n' : ' ';
        }
        terminalPronto = true;
    }

    /* ---------- Conquistas ---------- */
    const CONQUISTAS = [
        { id: 'projetos', nome: 'Explorador', desc: 'Visitou os projetos' },
        { id: 'habilidades', nome: 'Árvore de habilidades', desc: 'Conferiu as habilidades' },
        { id: 'contato', nome: 'Fim da fase', desc: 'Chegou até o contato' },
        { id: 'carinho', nome: 'Amigo do gato', desc: 'Clicou no gato preto' },
        { id: 'bug', nome: 'Caça-bugs', desc: 'Corrigiu um bug (clicando ou deixando com o gato)' },
        { id: 'konami', nome: 'Código secreto', desc: 'Dica: ↑ ↑ ↓ ↓ ← → ← → B A' },
    ];
    let feitas = memoria.ler('gt-conquistas', []);
    let bugsCorrigidos = memoria.ler('gt-bugs', 0);

    const listaConquistas = $('#lista-conquistas');
    const contaConquistas = $('#conta-conquistas');
    const contaBugs = $('#conta-bugs');
    const avisos = $('#avisos');

    function desenharConquistas() {
        listaConquistas.textContent = '';
        CONQUISTAS.forEach((c) => {
            const item = document.createElement('li');
            const pronta = feitas.includes(c.id);
            if (pronta) item.className = 'feita';
            const nome = document.createElement('strong');
            nome.textContent = c.nome;
            const desc = document.createElement('span');
            desc.textContent = c.desc;
            item.append(nome, desc);
            listaConquistas.append(item);
        });
        contaConquistas.textContent = `${feitas.length}/${CONQUISTAS.length}`;
        contaBugs.textContent = bugsCorrigidos;
    }

    function avisar(rotulo, titulo) {
        const aviso = document.createElement('div');
        aviso.className = 'aviso';
        const pequeno = document.createElement('small');
        pequeno.textContent = rotulo;
        const forte = document.createElement('strong');
        forte.textContent = titulo;
        aviso.append(pequeno, forte);
        avisos.append(aviso);
        setTimeout(() => aviso.classList.add('saindo'), 3200);
        setTimeout(() => aviso.remove(), 3700);
    }

    function desbloquear(id) {
        if (feitas.includes(id)) return;
        const conquista = CONQUISTAS.find((c) => c.id === id);
        if (!conquista) return;
        feitas.push(id);
        memoria.gravar('gt-conquistas', feitas);
        desenharConquistas();
        avisar('Conquista desbloqueada', conquista.nome);
        if (feitas.length === CONQUISTAS.length) {
            setTimeout(() => avisar('100% completo', 'Você zerou o portfólio!'), 900);
        }
    }

    // Seções visitadas
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                desbloquear(entrada.target.dataset.conquista);
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.25 });
    document.querySelectorAll('[data-conquista]').forEach((secao) => observador.observe(secao));

    // Painel
    const btnConquistas = $('#btn-conquistas');
    const painel = $('#painel-conquistas');

    function abrirPainel(abrir) {
        painel.hidden = !abrir;
        btnConquistas.setAttribute('aria-expanded', String(abrir));
    }
    btnConquistas.addEventListener('click', () => abrirPainel(painel.hidden));
    document.addEventListener('click', (evento) => {
        if (!painel.hidden && !painel.contains(evento.target) && !btnConquistas.contains(evento.target)) {
            abrirPainel(false);
        }
    });
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && !painel.hidden) {
            abrirPainel(false);
            btnConquistas.focus();
        }
    });
    $('#btn-reiniciar').addEventListener('click', () => {
        feitas = [];
        bugsCorrigidos = 0;
        memoria.gravar('gt-conquistas', feitas);
        memoria.gravar('gt-bugs', 0);
        desenharConquistas();
    });

    /* ---------- Desenhos em pixel ---------- */
    // Cada letra é um quadradinho: k preto, G olho verde, d pupila, w brilho, p rosa, g cinza, r vermelho, c carcaça, v tela
    const CORES = {
        k: '#0c0d14', G: '#4ccb52', d: '#04120a', w: '#ffffff', p: '#ff8fb1', g: '#4a5380',
        r: '#ff5d73', c: '#aab4dd', v: '#7cff6b', e: '#1b2140',
        u: '#8f7bff', o: '#ff9a3c', a: '#ffd84a', b: '#4ad8ff', m: '#ff5db1', s: '#e0b354',
    };

    function sprite(linhas, px = 4) {
        const largura = Math.max(...linhas.map((l) => l.length));
        let quadrados = '';
        linhas.forEach((linha, y) => {
            [...linha].forEach((letra, x) => {
                if (CORES[letra]) {
                    quadrados += `<rect x="${x}" y="${y}" width="1.03" height="1.03" fill="${CORES[letra]}"/>`;
                }
            });
        });
        return `<svg viewBox="0 0 ${largura} ${linhas.length}" width="${largura * px}" height="${linhas.length * px}" shape-rendering="crispEdges" aria-hidden="true">${quadrados}</svg>`;
    }

    const CORPO_ANDANDO = [
        'k...........kk...kk.',
        'k...........kkk.kkk.',
        'k..........kkkkkkkkk',
        '.k.........kGGGkGGGk',
        '.k.........kGwdkGwdk',
        '.k.........kGGGkGGGk',
        '..kkkkkkkkkkkkkkpkkk',
        '..kkkkkkkkkkkkkkkkk.',
        '..kkkkkkkkkkkkk.....',
        '..kkkkkkkkkkkkk.....',
    ];
    const GATO = {
        anda1: [...CORPO_ANDANDO,
            '..kk.kk....kk.kk....',
            '..kk.kk....kk.kk....',
            '..k...k....k...k....'],
        anda2: [...CORPO_ANDANDO,
            '...kkkk....kkkk.....',
            '...kk.kk..kk.kk.....',
            '..kk...k..k...kk....'],
        sentado: [
            '..kk........kk..',
            '.kpkk......kkpk.',
            '.kkkkkkkkkkkkkk.',
            'kkkkkkkkkkkkkkkk',
            'kkGGGGkkkkGGGGkk',
            'kkGwdGkkkkGwdGkk',
            'kkGddGkkkkGddGkk',
            'kkGGGGkkkkGGGGkk',
            'kkkkkkkppkkkkkkk',
            '.kkkkkkkkkkkkkk.',
            '...kkkkkkkkkk...',
            '...kkkkkkkkkk...',
            '..kkkkkkkkkkkk.k',
            '..kkkkkkkkkkkk.k',
            '..kkkkkkkkkkkkkk',
            '..kkk.kkkk.kkkk.'],
        dormindo: [
            '..kk........kk....',
            '.kpkk......kkpk...',
            '.kkkkkkkkkkkkkk...',
            'kkkkkkkkkkkkkkkkk.',
            'kkggggkkkkggggkkkk',
            'kkkkkkkppkkkkkkkkk',
            'kkkkkkkkkkkkkkkkkk',
            '.kkkkkkkkkkkkkkkk.'],
    };
    // Coluna onde o chapéu encaixa na cabeça, em cada pose
    const CABECA = { anda1: 11, anda2: 11, sentado: 4, dormindo: 4 };

    /* ---------- Datas comemorativas ----------
     * Em cada data o gato ganha um chapéu, uma frase e algo caindo ou voando na tela.
     * Para testar uma data sem esperar por ela, abra o site com ?data=AAAA-MM-DD no fim
     * do endereço. Exemplo: index.html?data=2026-12-25
     */
    // Chapéus têm 8 colunas. As duas últimas linhas ficam na altura das orelhas.
    const CHAPEUS = {
        natal: [
            '.....w..',
            '....rr..',
            '...rrr..',
            '..rrrrr.',
            '.rrrrrr.',
            'wwwwwwww'],
        bruxa: [
            '....u...',
            '...uu...',
            '...uuu..',
            '..uuuu..',
            '..oooo..',
            'uuuuuuuu'],
        festa: [
            '...w....',
            '...ab...',
            '..abm...',
            '..bmab..',
            '.bmabma.',
            '.mabmab.'],
        penas: [
            'm..a..b.',
            'mm.a.bb.',
            '.m.a.b..',
            '.mmabb..',
            '..aaaa..',
            '.aaaaaa.'],
        coelho: [
            '.ww..ww.',
            '.wp..pw.',
            '.wp..pw.',
            '.wp..pw.',
            '.ww..ww.',
            '.ww..ww.'],
        palha: [
            '..ssss..',
            '..ssss..',
            '..rrrr..',
            'ssssssss'],
    };

    const PECAS = {
        coracao: ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'],
        morcego: ['u...u.u...u', 'uu.uuuuu.uu', 'uuuuuuuuuuu', '.uu.uuu.uu.', '....u.u....'],
        abobora: ['...vv...', '.oooooo.', 'ookookoo', 'oooooooo', 'okkkkkko', '.oooooo.'],
    };

    const ponto = (cores, tamanho) => () =>
        `<i class="ponto" style="--cor:${sortear(cores)};--tam:${tamanho}px"></i>`;
    const COLORIDO = ['#ffd84a', '#4ad8ff', '#ff5db1', '#7cff6b', '#8f7bff'];

    // Páscoa (domingo) de um ano, pelo cálculo de Meeus
    function pascoa(ano) {
        const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
        const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const mes = Math.floor((h + l - 7 * m + 114) / 31);
        const dia = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(ano, mes - 1, dia);
    }

    // A primeira data que combinar com o dia de hoje é a que vale.
    // "md" é mês e dia juntos (25 de dezembro = 1225); "pascoa" é a distância em dias até a Páscoa.
    const EVENTOS = [
        {
            nome: 'Ano Novo', quando: ({ md }) => md >= 1231 || md <= 102,
            chapeu: 'festa', frase: 'feliz ano novo! versão nova de mim',
            particula: { tipo: 'cai', intervalo: 280, html: ponto(COLORIDO, 6) },
        },
        {
            nome: 'Carnaval', quando: ({ pascoa: p }) => p >= -51 && p <= -46,
            chapeu: 'penas', frase: 'bloco do gato preto passando',
            particula: { tipo: 'cai', intervalo: 220, html: ponto(COLORIDO, 6) },
        },
        {
            nome: 'Páscoa', quando: ({ pascoa: p }) => p >= -2 && p <= 0,
            chapeu: 'coelho', frase: 'cadê meu ovo de páscoa?',
            particula: { tipo: 'cai', intervalo: 700, html: ponto(['#ffc8dd', '#bde0fe', '#fff3b0', '#caffbf'], 6) },
        },
        {
            nome: 'Dia dos Namorados', quando: ({ md }) => md === 612,
            frase: 'amor é dar merge sem conflito',
            particula: { tipo: 'sobe', intervalo: 900, html: () => sprite(PECAS.coracao, 3) },
        },
        {
            nome: 'Dia do Programador', quando: ({ diaDoAno }) => diaDoAno === 256,
            frase: 'feliz dia do programador!',
            particula: { tipo: 'cai', intervalo: 320, html: () => `<span class="bit">${sortear(['0', '1'])}</span>` },
        },
        {
            nome: 'Sexta-feira 13', quando: ({ dia, semana }) => dia === 13 && semana === 5,
            frase: 'sexta-feira 13: azar é dos bugs',
            cores: { G: '#ffb02e' },   // olhos cor de âmbar
            bugsRapidos: true,           // os bugs aparecem com mais frequência
            particula: { tipo: 'voa', intervalo: 4200, html: () => sprite(PECAS.morcego, 3) },
        },
        {
            nome: 'Festa Junina', quando: ({ md }) => md >= 613 && md <= 630,
            chapeu: 'palha', frase: 'olha o bug! é mentira',
            bandeirinhas: true,
        },
        {
            nome: 'Halloween', quando: ({ md }) => md >= 1025 && md <= 1031,
            chapeu: 'bruxa', frase: 'doces ou bugs?', objeto: 'abobora',
            particula: { tipo: 'voa', intervalo: 2400, html: () => sprite(PECAS.morcego, 3) },
        },
        {
            nome: 'Natal', quando: ({ md }) => md >= 1201 && md <= 1226,
            chapeu: 'natal', frase: 'ho ho ho. sem deploy no Natal',
            particula: { tipo: 'cai', intervalo: 380, html: ponto(['#ffffff', '#dfe6ff'], 4) },
        },
    ];

    function eventoDeHoje() {
        let hoje = new Date();
        const teste = new URLSearchParams(location.search).get('data');
        if (/^\d{4}-\d{2}-\d{2}$/.test(teste || '')) {
            const [ano, mes, dia] = teste.split('-').map(Number);
            hoje = new Date(ano, mes - 1, dia);
        }
        const meiaNoite = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const DIA = 86400000;
        const info = {
            md: (hoje.getMonth() + 1) * 100 + hoje.getDate(),
            dia: hoje.getDate(),
            semana: hoje.getDay(),
            diaDoAno: Math.round((meiaNoite - new Date(hoje.getFullYear(), 0, 1)) / DIA) + 1,
            pascoa: Math.round((meiaNoite - pascoa(hoje.getFullYear())) / DIA),
        };
        return EVENTOS.find((evento) => evento.quando(info)) || null;
    }

    const evento = eventoDeHoje();
    if (evento && evento.cores) Object.assign(CORES, evento.cores);

    // Coloca o chapéu em cima do desenho do gato
    function vestir(linhas, chapeu, coluna) {
        if (!chapeu) return linhas;
        const largura = Math.max(...linhas.map((l) => l.length));
        const acima = chapeu.length - 2;
        const grade = [...Array(acima).fill(''), ...linhas].map((l) => [...l.padEnd(largura, '.')]);
        chapeu.forEach((linha, y) => {
            [...linha].forEach((letra, i) => {
                if (letra !== '.' && coluna + i < largura) grade[y][coluna + i] = letra;
            });
        });
        return grade.map((l) => l.join(''));
    }

    const chapeu = evento && evento.chapeu ? CHAPEUS[evento.chapeu] : null;
    const DESENHOS = {
        notebook: sprite([
            '.cccccc',
            '.cevvec',
            '.cveevc',
            '.cccccc',
            'ccccccc']),
        bug: sprite([
            'r.....r',
            '.rrrrr.',
            'rrkrkrr',
            '.rrrrr.',
            'r.r.r.r']),
        objeto: evento && evento.objeto ? sprite(PECAS[evento.objeto]) : '',
    };
    Object.keys(GATO).forEach((pose) => {
        DESENHOS[pose] = sprite(vestir(GATO[pose], chapeu, CABECA[pose]));
    });

    /* ---------- Gato ---------- */
    const palco = $('#palco');
    const gatoEl = document.createElement('button');
    gatoEl.type = 'button';
    gatoEl.className = 'gato';
    gatoEl.setAttribute('aria-label', 'Gato preto. Clique para fazer carinho.');
    gatoEl.innerHTML = '<span class="gato-corpo"></span><span class="balao" hidden></span>'
        + '<span class="efeito"></span><span class="efeito"></span><span class="efeito"></span>';
    palco.append(gatoEl);

    const gatoCorpo = gatoEl.querySelector('.gato-corpo');
    const balao = gatoEl.querySelector('.balao');
    const efeitos = gatoEl.querySelectorAll('.efeito');

    const LARGURA_GATO = 80;
    const gato = { x: 24, dir: 1, estado: 'sentado', alvo: 24, ate: 0, quadro: 0, relogio: 0 };
    let bug = null;
    let proximoBug = 0;
    let tempoBalao = 0;

    const limite = () => Math.max(8, document.documentElement.clientWidth - LARGURA_GATO - 8);

    function desenharGato() {
        const { estado } = gato;
        if (estado === 'andando' || estado === 'cacando') {
            gatoCorpo.innerHTML = gato.quadro ? DESENHOS.anda2 : DESENHOS.anda1;
        } else if (estado === 'dormindo') {
            gatoCorpo.innerHTML = DESENHOS.dormindo;
        } else if (estado === 'programando') {
            gatoCorpo.innerHTML = DESENHOS.sentado + DESENHOS.notebook;
        } else {
            gatoCorpo.innerHTML = DESENHOS.sentado + DESENHOS.objeto;
        }
    }

    function definirEstado(estado) {
        gato.estado = estado;
        gatoEl.dataset.estado = estado;
        const simbolos = estado === 'dormindo' ? ['z', 'z', 'Z'] : ['{ }', '</>', ';'];
        efeitos.forEach((efeito, i) => { efeito.textContent = simbolos[i]; });
        desenharGato();
        posicionarGato();
    }

    function posicionarGato() {
        gatoEl.style.setProperty('--x', gato.x.toFixed(1) + 'px');
        gatoEl.style.setProperty('--dir', gato.dir);
    }

    function falar(texto, duracao = 2400) {
        balao.textContent = texto;
        balao.hidden = false;
        // Não deixa o balão sair pela lateral da tela
        balao.style.setProperty('--desvio', '0px');
        const caixa = balao.getBoundingClientRect();
        const sobraDireita = caixa.right - (document.documentElement.clientWidth - 8);
        const desvio = caixa.left < 8 ? 8 - caixa.left : (sobraDireita > 0 ? -sobraDireita : 0);
        balao.style.setProperty('--desvio', desvio.toFixed(0) + 'px');
        clearTimeout(tempoBalao);
        tempoBalao = setTimeout(() => { balao.hidden = true; }, duracao);
    }

    // Anda em direção ao alvo. Devolve true quando chega.
    function moverPara(alvo, velocidade, dt) {
        const distancia = alvo - gato.x;
        if (Math.abs(distancia) < 2) return true;
        gato.dir = distancia > 0 ? 1 : -1;
        gato.x += gato.dir * Math.min(Math.abs(distancia), velocidade * dt);
        return false;
    }

    function descansar(agora) {
        const sorte = Math.random();
        if (sorte < 0.4) {
            definirEstado('programando');
            gato.ate = agora + aleatorio(5000, 8000);
        } else if (sorte < 0.7) {
            definirEstado('dormindo');
            gato.ate = agora + aleatorio(5000, 9000);
        } else {
            definirEstado('sentado');
            gato.ate = agora + aleatorio(1800, 3500);
        }
    }

    const FRASES = [
        'miau.exe executado',
        'funciona na minha máquina',
        'git commit -m "miau"',
        '404: ração não encontrada',
        'já tentou reiniciar?',
        'purr request aprovado',
        'ctrl + s salva vidas',
    ];
    if (evento) FRASES.push(evento.frase, evento.frase);

    gatoEl.addEventListener('click', () => {
        falar(sortear(FRASES));
        desbloquear('carinho');
        if (gato.estado === 'dormindo') definirEstado('sentado');
        gato.ate = Math.max(gato.ate, performance.now() + 2200);
        gatoEl.classList.remove('pulo');
        void gatoEl.offsetWidth; // reinicia a animação do pulo
        gatoEl.classList.add('pulo');
    });

    /* ---------- Bugs ---------- */
    function criarBug(agora) {
        const daEsquerda = Math.random() < 0.5;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'bug';
        el.tabIndex = -1;
        el.setAttribute('aria-label', 'Bug. Clique para corrigir.');
        el.innerHTML = DESENHOS.bug;
        el.addEventListener('click', () => corrigirBug('voce'));
        palco.append(el);
        bug = { el, x: daEsquerda ? -40 : document.documentElement.clientWidth + 10, dir: daEsquerda ? 1 : -1 };
        proximoBug = agora + (evento && evento.bugsRapidos ? aleatorio(7000, 12000) : aleatorio(14000, 24000));
    }

    function removerBug() {
        if (!bug) return;
        bug.el.remove();
        bug = null;
    }

    function corrigirBug(quem) {
        if (!bug) return;
        removerBug();
        bugsCorrigidos += 1;
        memoria.gravar('gt-bugs', bugsCorrigidos);
        contaBugs.textContent = bugsCorrigidos;
        desbloquear('bug');
        falar(quem === 'gato' ? 'bug corrigido! +1' : 'ei, esse era meu!');
        definirEstado('sentado');
        gato.ate = performance.now() + 2000;
    }

    /* ---------- Clima das datas comemorativas ---------- */
    const clima = document.createElement('div');
    clima.className = 'clima';
    clima.setAttribute('aria-hidden', 'true');
    document.body.append(clima);
    let proximaParticula = 0;

    function soltarParticula(agora) {
        const { tipo, intervalo, html } = evento.particula;
        proximaParticula = agora + intervalo * aleatorio(0.6, 1.4);
        if (clima.childElementCount > 45) return;
        const el = document.createElement('span');
        el.className = 'particula ' + tipo;
        el.innerHTML = html();
        el.style.setProperty('--px', aleatorio(0, 100).toFixed(1) + 'vw');
        el.style.setProperty('--py', aleatorio(12, 70).toFixed(1) + 'vh');
        el.style.setProperty('--deriva', aleatorio(-60, 60).toFixed(0) + 'px');
        el.style.setProperty('--giro', aleatorio(-360, 360).toFixed(0) + 'deg');
        el.style.animationDuration = (tipo === 'voa' ? aleatorio(5, 9) : aleatorio(8, 14)).toFixed(1) + 's';
        el.addEventListener('animationend', () => el.remove());
        clima.append(el);
    }

    function prepararEvento() {
        if (!evento) return;
        const selo = document.createElement('span');
        selo.className = 'hud-item hud-evento';
        selo.textContent = evento.nome;
        selo.title = 'Data comemorativa de hoje';
        $('.hud').prepend(selo);

        if (chapeu) gatoEl.style.setProperty('--extra', (chapeu.length - 2) * 4 + 'px');

        if (evento.bandeirinhas) {
            const fio = document.createElement('div');
            fio.className = 'bandeirinhas';
            fio.setAttribute('aria-hidden', 'true');
            for (let i = 0; i < 40; i++) {
                const bandeira = document.createElement('i');
                bandeira.style.setProperty('--cor', COLORIDO[i % COLORIDO.length]);
                fio.append(bandeira);
            }
            $('.topo').append(fio);
        }

        setTimeout(() => {
            avisar('Evento de hoje', evento.nome);
            falar(evento.frase, 3600);
        }, 1600);
    }

    /* ---------- Laço principal ---------- */
    let ultimo = performance.now();

    function atualizar(dt, agora) {
        if (evento && evento.particula && agora > proximaParticula) soltarParticula(agora);

        if (bug) {
            bug.x += bug.dir * 30 * dt;
            bug.el.style.setProperty('--x', bug.x.toFixed(1) + 'px');
            if (bug.x < -60 || bug.x > document.documentElement.clientWidth + 60) removerBug();
        } else if (agora > proximoBug) {
            criarBug(agora);
        }

        if (bug && gato.estado !== 'cacando') {
            definirEstado('cacando');
            falar('!', 900);
        }

        if (gato.estado === 'cacando') {
            if (!bug) {
                descansar(agora);
            } else {
                const alvo = Math.min(limite(), Math.max(8, bug.x + 18 - LARGURA_GATO / 2));
                moverPara(alvo, 180, dt);
                if (Math.abs(gato.x + LARGURA_GATO / 2 - (bug.x + 18)) < 26) corrigirBug('gato');
            }
        } else if (gato.estado === 'andando') {
            if (moverPara(gato.alvo, 55, dt)) descansar(agora);
        } else if (agora > gato.ate) {
            gato.alvo = aleatorio(8, limite());
            definirEstado('andando');
        }

        if (gato.estado === 'andando' || gato.estado === 'cacando') {
            gato.relogio += dt;
            if (gato.relogio > (gato.estado === 'cacando' ? 0.09 : 0.17)) {
                gato.relogio = 0;
                gato.quadro ^= 1;
                desenharGato();
            }
        }

        gato.x = Math.min(gato.x, limite());
        posicionarGato();
    }

    function passo(agora) {
        const dt = Math.min(0.05, (agora - ultimo) / 1000);
        ultimo = agora;
        if (animado && !document.hidden) atualizar(dt, agora);
        requestAnimationFrame(passo);
    }

    /* ---------- Código secreto ---------- */
    const SEGREDO = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let posicaoSegredo = 0;

    function festaDeGatos() {
        for (let i = 0; i < 9; i++) {
            const corredor = document.createElement('div');
            corredor.className = 'corredor';
            corredor.innerHTML = i % 2 ? DESENHOS.anda1 : DESENHOS.anda2;
            corredor.style.bottom = Math.round(aleatorio(0, innerHeight * 0.75)) + 'px';
            corredor.style.animationDuration = aleatorio(1.8, 3.6).toFixed(2) + 's';
            corredor.style.animationDelay = (i * 0.18).toFixed(2) + 's';
            corredor.style.transform = 'translateX(-90px)';
            corredor.addEventListener('animationend', () => corredor.remove());
            palco.append(corredor);
            if (!animado) setTimeout(() => corredor.remove(), 100);
        }
    }

    document.addEventListener('keydown', (evento) => {
        const tecla = evento.key.length === 1 ? evento.key.toLowerCase() : evento.key;
        posicaoSegredo = tecla === SEGREDO[posicaoSegredo] ? posicaoSegredo + 1 : (tecla === SEGREDO[0] ? 1 : 0);
        if (posicaoSegredo === SEGREDO.length) {
            posicaoSegredo = 0;
            desbloquear('konami');
            falar('modo gatos infinitos!');
            festaDeGatos();
        }
    });

    /* ---------- Início ---------- */
    aplicarAnimacoes();
    desenharConquistas();
    atualizarXp();
    definirEstado('sentado');
    prepararEvento();
    gato.ate = performance.now() + (evento ? 5500 : 2500);
    proximoBug = performance.now() + aleatorio(7000, 11000);

    if (animado) {
        digitarTerminal();
    } else {
        terminarTerminal();
    }
    requestAnimationFrame(passo);
})();
