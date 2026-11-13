/*
 * Portfólio do Getúlio: gato, bugs, terminal e conquistas.
 * Tudo aqui é opcional: sem este arquivo o site continua funcionando.
 */
(() => {
    'use strict';

    document.documentElement.classList.add('js');

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
            limparChuva();
            clima.textContent = '';
            colo = null;
            gato.y = 0;
            gato.giro = 0;
            gato.apoio = null;
            gato.subida = null;
            definirEstado('sentado');
            terminarTerminal();
        }
    });

    /* ---------- Barra de progresso da leitura ---------- */
    const xpBarra = $('#xp-barra');
    let xpPendente = false;
    function atualizarXp() {
        xpPendente = false;
        const total = document.documentElement.scrollHeight - innerHeight;
        xpBarra.style.width = (total > 0 ? Math.min(1, scrollY / total) * 100 : 0) + '%';
    }
    // No máximo uma atualização por quadro, mesmo com muitos eventos de rolagem
    function pedirXp() {
        if (xpPendente) return;
        xpPendente = true;
        requestAnimationFrame(atualizarXp);
    }
    addEventListener('scroll', pedirXp, { passive: true });
    addEventListener('resize', pedirXp);

    /* ---------- Menu marca a seção que está na tela ---------- */
    const linksMenu = new Map();
    document.querySelectorAll('.menu a').forEach((link) => linksMenu.set(link.getAttribute('href').slice(1), link));
    const espiao = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            const link = linksMenu.get(entrada.target.id);
            if (!link) return;
            if (entrada.isIntersecting) {
                linksMenu.forEach((outro) => outro.removeAttribute('aria-current'));
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach((secao) => espiao.observe(secao));

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

    // Um clique no terminal pula a digitação
    terminal.addEventListener('click', terminarTerminal);

    /* ---------- Conquistas ---------- */
    const CONQUISTAS = [
        { id: 'projetos', nome: 'Explorador', desc: 'Visitou os projetos' },
        { id: 'habilidades', nome: 'Árvore de habilidades', desc: 'Conferiu as habilidades' },
        { id: 'contato', nome: 'Fim da fase', desc: 'Chegou até o contato' },
        { id: 'carinho', nome: 'Amigo do gato', desc: 'Clicou no gato preto' },
        { id: 'bug', nome: 'Caça-bugs', desc: 'Corrigiu um bug (clicando ou deixando com o gato)' },
        { id: 'detalhes', nome: 'Curioso', desc: 'Abriu os detalhes de um projeto' },
        { id: 'janela', nome: 'Gerente de janelas', desc: 'Arrastou uma caixa do site (ou o gato)' },
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

    // Mostra "Role para ver mais" enquanto houver conquistas escondidas abaixo
    const painelMais = $('#painel-mais');
    function avisarMais() {
        const falta = listaConquistas.scrollHeight - listaConquistas.clientHeight - listaConquistas.scrollTop;
        painelMais.hidden = falta < 4;
    }
    listaConquistas.addEventListener('scroll', avisarMais, { passive: true });

    function abrirPainel(abrir) {
        painel.hidden = !abrir;
        if (abrir) {
            // O painel nunca passa do fim da tela; o que não couber rola por dentro
            const espaco = innerHeight - $('.topo').getBoundingClientRect().bottom - 24;
            painel.style.maxHeight = Math.max(220, espaco) + 'px';
            avisarMais();
        }
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

    /* ---------- Caixas arrastáveis ---------- */
    const movidas = new Set();
    const btnArrumar = document.createElement('button');
    btnArrumar.type = 'button';
    btnArrumar.className = 'arrumar';
    btnArrumar.textContent = 'Arrumar caixas';
    btnArrumar.hidden = true;
    document.body.append(btnArrumar);

    // Deixa "caixa" ser arrastada segurando em "alca". A caixa só muda de lugar
    // visualmente (transform), então o resto da página não se mexe.
    function tornarArrastavel(caixa, alca, fixa = false) {
        const pos = { x: 0, y: 0 };
        let inicio = null;
        caixa.classList.add('movivel');
        alca.classList.add('alca');
        alca.title = 'Arraste para mover';

        alca.addEventListener('pointerdown', (evento) => {
            if (evento.button !== 0 || evento.target.closest('button, a')) return;
            const r = caixa.getBoundingClientRect();
            const largura = document.documentElement.clientWidth;
            const topo = r.top + scrollY;
            inicio = {
                px: evento.clientX, py: evento.clientY, x: pos.x, y: pos.y,
                // até onde pode ir sem sumir da página (ou da tela, se a caixa for fixa)
                minX: 80 - r.right, maxX: largura - 80 - r.left,
                minY: fixa ? 8 - r.top : 70 - topo,
                maxY: fixa ? innerHeight - 60 - r.top : document.documentElement.scrollHeight - 80 - topo,
            };
            alca.setPointerCapture(evento.pointerId);
            caixa.classList.add('arrastando');
            evento.preventDefault();
        });

        alca.addEventListener('pointermove', (evento) => {
            if (!inicio) return;
            const dx = Math.max(inicio.minX, Math.min(inicio.maxX, evento.clientX - inicio.px));
            const dy = Math.max(inicio.minY, Math.min(inicio.maxY, evento.clientY - inicio.py));
            pos.x = inicio.x + dx;
            pos.y = inicio.y + dy;
            caixa.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        });

        const soltar = () => {
            if (!inicio) return;
            inicio = null;
            caixa.classList.remove('arrastando');
            if (pos.x || pos.y) {
                movidas.add(voltar);
                caixa.classList.add('movida');
                btnArrumar.hidden = false;
                desbloquear('janela');
            }
        };
        alca.addEventListener('pointerup', soltar);
        alca.addEventListener('pointercancel', soltar);

        function voltar() {
            pos.x = 0;
            pos.y = 0;
            caixa.style.transform = '';
            caixa.classList.remove('movida');
            movidas.delete(voltar);
            btnArrumar.hidden = movidas.size === 0;
        }
        return voltar;
    }

    function arrumarTudo() {
        [...movidas].forEach((voltar) => voltar());
    }
    btnArrumar.addEventListener('click', () => {
        arrumarTudo();
        falar('tudo no lugar de novo');
    });
    // Se a janela mudar de tamanho, as posições antigas deixam de fazer sentido
    let larguraAnterior = innerWidth;
    addEventListener('resize', () => {
        if (innerWidth !== larguraAnterior) {
            larguraAnterior = innerWidth;
            arrumarTudo();
        }
    });

    const janelaTerminal = $('#janela-terminal');
    const voltarTerminal = tornarArrastavel(janelaTerminal, janelaTerminal.querySelector('.terminal-topo'));
    tornarArrastavel(painel, painel.querySelector('h2'));

    // Botões da janela do terminal
    const tbMin = $('#tb-min');
    const reabrir = $('#terminal-reabrir');
    $('#tb-volta').addEventListener('click', voltarTerminal);
    tbMin.addEventListener('click', () => {
        const minimizado = janelaTerminal.classList.toggle('minimizado');
        tbMin.setAttribute('aria-expanded', String(!minimizado));
        tbMin.setAttribute('aria-label', minimizado ? 'Abrir o terminal' : 'Minimizar o terminal');
    });
    $('#tb-fechar').addEventListener('click', () => {
        voltarTerminal();
        janelaTerminal.hidden = true;
        reabrir.hidden = false;
        reabrir.focus();
    });
    reabrir.addEventListener('click', () => {
        janelaTerminal.hidden = false;
        reabrir.hidden = true;
        $('#tb-fechar').focus();
    });

    /* ---------- Janela de detalhes dos projetos ----------
     * Para mudar o que aparece em cada aba, edite os textos abaixo.
     * Cada projeto tem as abas na ordem em que aparecem; uma aba pode ter
     * "texto" (parágrafos) e "lista" (itens). Trechos entre crases viram código.
     */
    const PROJETOS = {
        eco: {
            titulo: 'EcoAction',
            abas: [
                { nome: 'Resumo', texto: [
                    'Protótipo de um app que conecta voluntários a ações socioambientais, feito no projeto de Extensão I.',
                    'Funciona inteiro no navegador, em uma única página, simulando a experiência de um aplicativo.',
                ], nota: 'Protótipo acadêmico' },
                { nome: 'Funcionalidades', lista: [
                    'Feed de ações com busca e filtro por categoria',
                    'Inscrição em ações e histórico de participação',
                    'Chat de cada ação',
                    'Painel do organizador: publicar, editar, encerrar e reativar ações',
                    'Avisos para os inscritos e notificações',
                    'Perfil do voluntário, com edição',
                ] },
                { nome: 'Por dentro', lista: [
                    'Cinco telas: Início, Nova Ação, Chat, Painel e Perfil',
                    'Tudo em um `index.html`, com HTML, CSS e JavaScript juntos',
                    'Navegação entre telas feita em JavaScript, sem recarregar a página',
                ] },
            ],
        },
        academia: {
            titulo: 'Gestão de Academia',
            abas: [
                { nome: 'Resumo', texto: [
                    'Site de uma academia com página inicial e área de cadastro de alunos e instrutores.',
                    'O visitante conhece as modalidades e a equipe administra os cadastros.',
                ], nota: 'Site com Bootstrap' },
                { nome: 'Funcionalidades', lista: [
                    'Página inicial com carrossel e modalidades (musculação, calistenia e outras)',
                    'Cadastro de alunos: nome, CPF, e-mail, telefone, plano e turno',
                    'Cadastro de instrutores, com especialidade',
                    'Listagem de alunos e de instrutores',
                    'Tema claro e escuro',
                ] },
                { nome: 'Por dentro', lista: [
                    'Cinco páginas em HTML',
                    'Layout e componentes do Bootstrap',
                    'Troca de tema com o `color-modes.js`',
                ] },
            ],
        },
        karaoke: {
            titulo: 'Catálogo de Karaokê',
            abas: [
                { nome: 'Resumo', texto: [
                    'Aplicação para navegar por um catálogo de músicas de karaokê e encontrar a próxima para cantar.',
                ], nota: 'Aplicação em Python' },
                { nome: 'Funcionalidades', lista: [
                    'Catálogo completo de músicas em uma página larga',
                    'Navegação pelo catálogo para escolher a próxima música',
                ] },
                { nome: 'Por dentro', lista: [
                    'Interface feita com Streamlit',
                    'Dados tratados com pandas e numpy',
                    '`main.py` configura a página e chama a tela do catálogo',
                ] },
            ],
        },
        banco: {
            titulo: 'SapiensBank',
            abas: [
                { nome: 'Resumo', texto: [
                    'Banco que roda no terminal, feito para praticar orientação a objetos em C#.',
                    'As contas ficam salvas em arquivo, então continuam lá quando o programa é aberto de novo.',
                ], nota: 'Projeto acadêmico' },
                { nome: 'Funcionalidades', lista: [
                    'Criar conta com cliente, CPF, senha e limite',
                    'Listar contas',
                    'Sacar e depositar',
                    'Aumentar e diminuir o limite',
                    'Saldo disponível calculado como saldo mais limite',
                    'Validação de senha',
                ] },
                { nome: 'Por dentro', lista: [
                    '`Conta.cs`: dados e regras de cada conta',
                    '`Banco.cs`: guarda as contas e salva em JSON',
                    '`UX.cs`: menus e telas do terminal',
                    'C# com .NET',
                ] },
            ],
        },
        vendas: {
            titulo: 'Sistema de Vendas',
            abas: [
                { nome: 'Resumo', texto: [
                    'Mockup da navegação de um sistema de vendas, com áreas de clientes, produtos e pedidos.',
                ], nota: 'Em andamento' },
                { nome: 'Funcionalidades', lista: [
                    'Cadastro e listagem de clientes',
                    'Cadastro e listagem de produtos',
                    'Cadastro e listagem de pedidos',
                    'Tema claro e escuro',
                ] },
                { nome: 'Por dentro', lista: [
                    'Sete páginas em HTML',
                    'Layout e componentes do Bootstrap',
                    'Menu de navegação entre as áreas',
                ] },
            ],
        },
    };

    const janela = $('#janela-projeto');
    const janelaAbas = $('#janela-abas');
    const janelaCorpo = $('#janela-corpo');
    const voltarJanela = tornarArrastavel(janela, janela.querySelector('.janela-topo'), true);
    let cartaoAberto = null;

    // Escreve um texto no elemento, transformando `trechos entre crases` em <code>
    function escrever(elemento, texto) {
        texto.split('`').forEach((parte, i) => {
            if (!parte) return;
            if (i % 2) {
                const codigo = document.createElement('code');
                codigo.textContent = parte;
                elemento.append(codigo);
            } else {
                elemento.append(parte);
            }
        });
    }

    function mostrarAba(projeto, indice) {
        const aba = projeto.abas[indice];
        [...janelaAbas.children].forEach((botao, i) => {
            botao.setAttribute('aria-selected', String(i === indice));
            botao.tabIndex = i === indice ? 0 : -1;
        });
        janelaCorpo.textContent = '';
        janelaCorpo.scrollTop = 0;
        if (aba.nota) {
            const nota = document.createElement('p');
            nota.className = 'nota';
            nota.textContent = aba.nota;
            janelaCorpo.append(nota);
        }
        (aba.texto || []).forEach((linha) => {
            const p = document.createElement('p');
            escrever(p, linha);
            janelaCorpo.append(p);
        });
        if (aba.lista) {
            const ul = document.createElement('ul');
            aba.lista.forEach((item) => {
                const li = document.createElement('li');
                const span = document.createElement('span');
                escrever(span, item);
                li.append(span);
                ul.append(li);
            });
            janelaCorpo.append(ul);
        }
    }

    function abrirJanela(id, cartao) {
        const projeto = PROJETOS[id];
        if (!projeto) return false;
        cartaoAberto = cartao;
        voltarJanela();
        $('#janela-titulo').textContent = projeto.titulo;
        $('#janela-link').href = cartao.href;
        janelaAbas.textContent = '';
        projeto.abas.forEach((aba, i) => {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'aba';
            botao.setAttribute('role', 'tab');
            botao.textContent = aba.nome;
            botao.addEventListener('click', () => mostrarAba(projeto, i));
            janelaAbas.append(botao);
        });
        // Setas esquerda e direita trocam de aba
        janelaAbas.onkeydown = (evento) => {
            const passo = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0;
            if (!passo) return;
            const botoes = [...janelaAbas.children];
            const atual = botoes.findIndex((b) => b.getAttribute('aria-selected') === 'true');
            const novo = (atual + passo + botoes.length) % botoes.length;
            mostrarAba(projeto, novo);
            botoes[novo].focus();
            evento.stopPropagation();
        };
        mostrarAba(projeto, 0);
        janela.hidden = false;
        janelaAbas.firstElementChild.focus();
        desbloquear('detalhes');
        return true;
    }

    function fecharJanela() {
        if (janela.hidden) return;
        janela.hidden = true;
        if (cartaoAberto) cartaoAberto.focus();
        cartaoAberto = null;
    }

    document.querySelectorAll('.projeto[data-projeto]').forEach((cartao) => {
        cartao.addEventListener('click', (evento) => {
            // Ctrl, Shift ou Cmd + clique continuam abrindo o repositório em outra aba
            if (evento.ctrlKey || evento.metaKey || evento.shiftKey) return;
            if (abrirJanela(cartao.dataset.projeto, cartao)) evento.preventDefault();
        });
    });
    $('#janela-fechar').addEventListener('click', fecharJanela);
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') fecharJanela();
    });
    document.addEventListener('pointerdown', (evento) => {
        if (!janela.hidden && !janela.contains(evento.target) && !evento.target.closest('.projeto, .gato, .bug, .arrumar')) {
            fecharJanela();
        }
    });

    /* ---------- Chuva de código no fundo ---------- */
    const chuva = document.createElement('canvas');
    chuva.className = 'chuva';
    chuva.setAttribute('aria-hidden', 'true');
    document.body.prepend(chuva);
    const pincel = chuva.getContext('2d');
    const GLIFOS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789{}[]<>/=;$#&*+';
    const LETRA = 18;
    let colunas = [];
    let ultimaChuva = 0;

    function ajustarChuva() {
        const nitidez = Math.min(devicePixelRatio || 1, 1.5);
        chuva.width = Math.round(innerWidth * nitidez);
        chuva.height = Math.round(innerHeight * nitidez);
        pincel.setTransform(nitidez, 0, 0, nitidez, 0, 0);
        pincel.font = `${LETRA - 2}px "JetBrains Mono", ui-monospace, monospace`;
        colunas = Array.from({ length: Math.ceil(innerWidth / LETRA) }, () => Math.floor(aleatorio(-50, 0)));
    }

    // Cada coluna desce uma letra por vez; um véu escuro apaga o rastro aos poucos
    function desenharChuva(agora) {
        if (agora - ultimaChuva < 75) return; // cerca de 13 quadros por segundo já basta
        ultimaChuva = agora;
        pincel.fillStyle = 'rgba(11, 13, 23, 0.14)';
        pincel.fillRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < colunas.length; i++) {
            const y = colunas[i] * LETRA;
            if (y > 0) {
                pincel.fillStyle = Math.random() < 0.08 ? '#e6ffe2' : '#7cff6b';
                pincel.fillText(GLIFOS[Math.floor(Math.random() * GLIFOS.length)], i * LETRA, y);
            }
            colunas[i] = y > innerHeight && Math.random() > 0.97 ? 0 : colunas[i] + 1;
        }
    }

    function limparChuva() {
        pincel.clearRect(0, 0, innerWidth, innerHeight);
    }
    ajustarChuva();
    addEventListener('resize', ajustarChuva);

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

    /* ---------- Datas comemorativas ----------
     * Em cada data o gato ganha um chapéu, uma frase e algo caindo ou voando na tela.
     * Para testar uma data sem esperar por ela, abra o site com ?data=AAAA-MM-DD no fim
     * do endereço. Exemplo: index.html?data=2026-12-25
     */
    // Chapéus têm 8 colunas e ficam presos em cima da cabeça do gato.
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
    DESENHOS.chapeu = chapeu ? sprite(chapeu, 3) : '';

    // O gato vem de uma folha de sprites (gato-sprites.png): 14 quadros de 104 x 84 lado a lado.
    // 0 sentado, 1 piscando, 2 e 3 rabo mexendo, 4 a 9 andando, 10 e 11 dormindo,
    // 12 e 13 pendurado (quando alguém pega no colo).
    const QUADRO_LARGURA = 104;

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

    const LARGURA_GATO = QUADRO_LARGURA;
    const gato = {
        x: 24, y: 0, vy: 0, dir: 1, estado: 'sentado', alvo: 24, ate: 0,
        giro: 0,          // inclinação do corpo, em graus (escalando ou balançando no colo)
        balanco: 0, vBalanco: 0,
        apoio: null,      // elemento em cima do qual ele está (terminal, cartão...)
        apoioX: null,     // posição desse elemento no quadro anterior, para o gato ir junto
        subida: null,     // plano de escalada: { el, lado }
        ignora: null,     // apoio que ele acabou de largar e não deve pousar de novo
    };

    const spriteGato = document.createElement('span');
    spriteGato.className = 'gato-sprite';
    gatoCorpo.append(spriteGato);

    // Peças extras ao redor do gato: criadas uma vez só, depois é mostrar e esconder
    const pecas = {};
    const criarPeca = (nome, html) => {
        if (!html) return;
        const peca = document.createElement('span');
        peca.className = 'peca peca-' + nome;
        peca.innerHTML = html;
        peca.hidden = nome !== 'chapeu';
        gatoCorpo.append(peca);
        pecas[nome] = peca;
    };
    criarPeca('notebook', DESENHOS.notebook);
    criarPeca('objeto', DESENHOS.objeto);
    criarPeca('chapeu', DESENHOS.chapeu);

    // Troca o quadro da folha de sprites (só mexe no estilo quando o quadro muda)
    let quadroAtual = -1;
    function quadro(n) {
        if (n === quadroAtual) return;
        quadroAtual = n;
        spriteGato.style.backgroundPositionX = -n * QUADRO_LARGURA + 'px';
        if (pecas.chapeu) {
            // a cabeça muda de lugar em cada pose; o chapéu acompanha
            const [dx, dy] = n >= 12 ? [-17, 1] : n >= 10 ? [3, 47] : n >= 4 ? [4, 7 + ((n - 4) % 3 === 1 ? 1 : 0)] : [0, 0];
            pecas.chapeu.style.transform = `translate(${dx}px, ${dy}px)`;
        }
    }

    const anim = { t: 0, piscar: 2, rabo: 4 };
    function animarGato(dt) {
        anim.t += dt;
        const { estado } = gato;
        if (estado === 'andando' || estado === 'cacando' || estado === 'escalando') {
            quadro(4 + Math.floor(anim.t * (estado === 'cacando' ? 16 : 9)) % 6);
        } else if (estado === 'carregado') {
            quadro(12 + Math.floor(anim.t / 0.16) % 2); // patas chutando o ar
        } else if (estado === 'caindo') {
            quadro(12);
        } else if (estado === 'dormindo') {
            quadro(10 + Math.floor(anim.t / 0.9) % 2); // respiração
        } else {
            let n = 0;
            if (anim.t > anim.rabo) {
                const passo = Math.floor((anim.t - anim.rabo) / 0.2);
                if (passo >= 4) anim.rabo = anim.t + aleatorio(3, 7);
                else n = [2, 0, 3, 0][passo];
            }
            if (anim.t > anim.piscar) {
                if (anim.t - anim.piscar > 0.15) anim.piscar = anim.t + aleatorio(2.5, 5.5);
                else n = 1;
            }
            quadro(n);
        }
    }

    let bug = null;
    let proximoBug = 0;
    let tempoBalao = 0;

    const limite = () => Math.max(8, document.documentElement.clientWidth - LARGURA_GATO - 8);

    function desenharGato() {
        const { estado } = gato;
        if (pecas.notebook) pecas.notebook.hidden = estado !== 'programando';
        if (pecas.objeto) pecas.objeto.hidden = estado !== 'sentado';
        // quadro inicial de cada estado; o laço principal cuida da animação
        const movendo = estado === 'andando' || estado === 'cacando' || estado === 'escalando';
        const noAr = estado === 'carregado' || estado === 'caindo';
        quadro(estado === 'dormindo' ? 10 : movendo ? 4 : noAr ? 12 : 0);
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
        gatoEl.style.setProperty('--y', (-gato.y).toFixed(1) + 'px');
        gatoEl.style.setProperty('--dir', gato.dir);
        gatoEl.style.setProperty('--giro', gato.giro.toFixed(1) + 'deg');
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

    let ignorarClique = false;
    gatoEl.addEventListener('click', () => {
        if (ignorarClique) return;
        falar(sortear(FRASES));
        desbloquear('carinho');
        if (gato.estado === 'dormindo') definirEstado('sentado');
        gato.ate = Math.max(gato.ate, performance.now() + 2200);
        gatoEl.classList.remove('pulo');
        void gatoEl.offsetWidth; // reinicia a animação do pulo
        gatoEl.classList.add('pulo');
    });

    // Dá para pegar o gato pelo cangote e soltar em outro lugar. No ar ele chuta
    // as patas e balança como um pêndulo, conforme o movimento do mouse.
    let colo = null;
    gatoEl.addEventListener('pointerdown', (evento) => {
        if (evento.button !== 0 || !animado) return;
        colo = { px: evento.clientX, py: evento.clientY, ultimoX: evento.clientX, ativo: false };
        gatoEl.setPointerCapture(evento.pointerId);
    });
    gatoEl.addEventListener('pointermove', (evento) => {
        if (!colo) return;
        if (!colo.ativo) {
            if (Math.hypot(evento.clientX - colo.px, evento.clientY - colo.py) < 6) return;
            colo.ativo = true;
            gato.apoio = null;
            gato.subida = null;
            gato.balanco = 0;
            gato.vBalanco = 0;
            definirEstado('carregado');
            falar(sortear(['ei! me põe no chão', 'miau?!', 'cuidado comigo', 'me solta, humano']), 1500);
        }
        gato.vBalanco += (evento.clientX - colo.ultimoX) * 7; // o corpo fica para trás e balança
        colo.ultimoX = evento.clientX;
        gato.x = Math.max(0, Math.min(limite(), evento.clientX - LARGURA_GATO / 2));
        gato.y = Math.max(0, innerHeight - evento.clientY - 62);
        posicionarGato();
    });
    function soltarGato() {
        if (!colo) return;
        if (colo.ativo) {
            ignorarClique = true;
            setTimeout(() => { ignorarClique = false; }, 80);
            gato.vy = 0;
            gato.giro = 0;
            gato.ignora = null;
            definirEstado('caindo');
            desbloquear('janela');
        }
        colo = null;
    }
    gatoEl.addEventListener('pointerup', soltarGato);
    gatoEl.addEventListener('pointercancel', soltarGato);

    /* ---------- Lugares onde o gato sobe ---------- */
    const APOIOS = '#janela-terminal, .projeto, .nivel, #janela-projeto, #painel-conquistas';
    // Com o gato de lado (escalando), as patas ficam a esta distância da borda dele
    const PATAS_DE_LADO = LARGURA_GATO / 2 + 42;

    // Caixas visíveis na tela cujo topo fica numa altura em que o gato cabe
    function apoiosVisiveis() {
        const lista = [];
        document.querySelectorAll(APOIOS).forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width < 90 || r.top < 90 || r.top > innerHeight - 110) return;
            lista.push({ el, r });
        });
        return lista;
    }

    // Escolhe uma caixa e um lado por onde dá para subir sem sair da tela
    function planoDeSubida() {
        const opcoes = [];
        apoiosVisiveis().forEach(({ el, r }) => {
            if (r.left - PATAS_DE_LADO >= 0) opcoes.push({ el, lado: 'esq', x: r.left - PATAS_DE_LADO });
            if (r.right - 10 <= limite()) opcoes.push({ el, lado: 'dir', x: r.right - 10 });
        });
        return opcoes.length ? sortear(opcoes) : null;
    }

    function subirEm(el, r) {
        gato.apoio = el;
        gato.apoioX = r.left;
        gato.y = innerHeight - r.top;
        gato.giro = 0;
        gato.ignora = null;
        gato.subida = null;
    }

    // Larga o apoio e cai (na frente dele, sem pousar de novo no mesmo lugar)
    function saltar() {
        gato.ignora = gato.apoio;
        gato.apoio = null;
        gato.subida = null;
        gato.giro = 0;
        gato.vy = 0;
        definirEstado('caindo');
    }

    // Enquanto está em cima de uma caixa, o gato acompanha a rolagem e o arrasto dela
    function acompanharApoio() {
        const r = gato.apoio.getBoundingClientRect();
        if (!gato.apoio.isConnected || r.width === 0 || r.top < 70 || r.top > innerHeight - 20) {
            saltar();
            return false;
        }
        gato.x += r.left - gato.apoioX;
        gato.apoioX = r.left;
        gato.y = innerHeight - r.top;
        const centro = gato.x + LARGURA_GATO / 2;
        if (centro < r.left - 4 || centro > r.right + 4) { // passou da ponta
            saltar();
            return false;
        }
        return true;
    }

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
        // Bugs são raros, para o gato ter sossego entre um e outro
        proximoBug = agora + (evento && evento.bugsRapidos ? aleatorio(40000, 70000) : aleatorio(75000, 140000));
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
        contaBugs.classList.remove('pulsa');
        void contaBugs.offsetWidth;
        contaBugs.classList.add('pulsa');
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

        if (chapeu) gatoEl.style.setProperty('--extra', (chapeu.length - 2) * 3 + 'px');

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
        animarGato(dt);
        if (evento && evento.particula && agora > proximaParticula) soltarParticula(agora);

        if (bug) {
            bug.x += bug.dir * 30 * dt;
            bug.el.style.setProperty('--x', bug.x.toFixed(1) + 'px');
            if (bug.x < -60 || bug.x > document.documentElement.clientWidth + 60) removerBug();
        } else if (agora > proximoBug) {
            criarBug(agora);
        }

        if (gato.estado === 'carregado') {
            // pêndulo: uma mola puxa o corpo de volta para o prumo
            gato.vBalanco += (-45 * gato.balanco - 4 * gato.vBalanco) * dt;
            gato.balanco = Math.max(-55, Math.min(55, gato.balanco + gato.vBalanco * dt));
            gato.giro = gato.balanco + 4 * Math.sin(agora / 180);
            posicionarGato();
            return;
        }

        if (gato.estado === 'caindo') {
            const antes = gato.y;
            gato.vy += 2200 * dt;
            gato.y = Math.max(0, antes - gato.vy * dt);
            // pousa na primeira caixa que estiver no caminho (a não ser que haja bug para caçar)
            const centro = gato.x + LARGURA_GATO / 2;
            const pouso = bug ? null : apoiosVisiveis().find(({ el, r }) => {
                const topo = innerHeight - r.top;
                return el !== gato.ignora && centro > r.left + 6 && centro < r.right - 6 && antes >= topo && gato.y <= topo;
            });
            if (pouso) subirEm(pouso.el, pouso.r);
            if (pouso || gato.y === 0) {
                gato.ignora = null;
                definirEstado('sentado');
                gato.ate = agora + 1800;
                falar(sortear(['pouso perfeito', 'gato sempre cai de pé', 'de novo!']), 1600);
            }
            posicionarGato();
            return;
        }

        if (gato.estado === 'escalando') {
            const { el, lado } = gato.subida;
            const r = el.getBoundingClientRect();
            if (bug || !el.isConnected || r.width === 0 || r.top < 90 || r.top > innerHeight - 110) {
                saltar(); // desistiu no meio do caminho
            } else {
                gato.x = lado === 'esq' ? r.left - PATAS_DE_LADO : r.right - 10;
                // pula até alcançar a caixa e depois sobe devagar pela lateral
                const agarra = innerHeight - r.bottom - 50;
                gato.y += (gato.y < agarra ? 380 : 60) * dt;
                if (gato.y + 42 >= innerHeight - r.top) {
                    subirEm(el, r);
                    gato.x = lado === 'esq' ? r.left + 4 : r.right - LARGURA_GATO - 4;
                    gato.x = Math.max(0, Math.min(limite(), gato.x));
                    descansar(agora);
                    if (Math.random() < 0.6) falar(sortear(['daqui eu vejo tudo', 'território conquistado', 'vista boa aqui de cima']), 2000);
                }
            }
            posicionarGato();
            return;
        }

        if (gato.apoio && !acompanharApoio()) {
            posicionarGato();
            return;
        }

        if (bug && gato.estado !== 'cacando') {
            if (gato.apoio) { // desce primeiro, caça depois
                saltar();
                posicionarGato();
                return;
            }
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
            if (moverPara(gato.alvo, 55, dt)) {
                if (gato.subida) {
                    gato.dir = gato.subida.lado === 'esq' ? 1 : -1;
                    gato.giro = gato.subida.lado === 'esq' ? -90 : 90;
                    definirEstado('escalando');
                } else {
                    descansar(agora);
                }
            }
        } else if (agora > gato.ate) {
            if (gato.apoio) {
                // em cima de uma caixa: passeia por ela ou vai até a ponta e desce
                const r = gato.apoio.getBoundingClientRect();
                const sobra = r.width - LARGURA_GATO;
                if (sobra > 60 && Math.random() < 0.55) {
                    gato.alvo = aleatorio(r.left - 10, r.right - LARGURA_GATO + 10);
                } else if (r.left - LARGURA_GATO / 2 - 12 >= 0) {
                    gato.alvo = r.left - LARGURA_GATO / 2 - 12;
                } else if (r.right - LARGURA_GATO / 2 + 12 <= limite()) {
                    gato.alvo = r.right - LARGURA_GATO / 2 + 12;
                } else {
                    saltar();
                    posicionarGato();
                    return;
                }
            } else {
                gato.subida = Math.random() < 0.4 ? planoDeSubida() : null;
                gato.alvo = gato.subida ? gato.subida.x : aleatorio(8, limite());
            }
            definirEstado('andando');
        }

        gato.x = Math.min(gato.x, limite());
        posicionarGato();
    }

    function passo(agora) {
        const dt = Math.min(0.05, (agora - ultimo) / 1000);
        ultimo = agora;
        if (animado && !document.hidden) {
            desenharChuva(agora);
            atualizar(dt, agora);
        }
        requestAnimationFrame(passo);
    }

    /* ---------- Código secreto ---------- */
    const SEGREDO = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let posicaoSegredo = 0;

    function festaDeGatos() {
        for (let i = 0; i < 9; i++) {
            const corredor = document.createElement('div');
            corredor.className = 'corredor';
            corredor.innerHTML = '<span class="gato-sprite"></span>';
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
    proximoBug = performance.now() + aleatorio(45000, 75000);

    if (animado) {
        digitarTerminal();
    } else {
        terminarTerminal();
    }
    requestAnimationFrame(passo);
})();
