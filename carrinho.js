(function(){ //escopo fechado para não vazar para o espaço principal do site 
    'use strict';

    const carrinho = new Carrinho();

    document.querySelectorAll('#btnAbrirCarrinho, #btnAbrirCarrinhoNav'  ).forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            const offEl = document.getElementById('offcanvasCarrinho');
                if (!offEl) {
                    console.warn('Elemento offcanvasCarrinho não encontrado');
                    return;
                }
                const off = new bootstrap.Offcanvas(offEl);
                off.show();
            
        });

    });

    

    function textoParaCentavos(precoTexto) { //converte string de preço para centavos inteiros 
        if (!precoTexto) return 0;
        let cleaned = precoTexto.replace(/\s/g, '').replace('R$', '').replace(/\u00A0/g, '');
        cleaned = cleaned.replace(/\./g,'').replace(',', '.');
        let num = parseFloat(cleaned);

        if (Number.isNaN(num)) return 0;
        return Math.round(num * 100); // converte para centavos

    }

    function centavosParaReal(centavos) { //converte centavos inteiros para string de preço
        return (centavos / 100).toLocaleString('pt-BR', { 
            style:'currency', 
            currency: 'BRL' 
        });
    }

    class Carrinho {
        constructor(chaveLocal = 'livraria_carrinho') {
            this.chaveLocal = chaveLocal;
            this.itens = [];
            this.carregar();
            this.pegarElementos(); //pega os elementos do DOM 
            this.renderizar(); 
        }

        pegarElementos() {
            this.elCarrinho = document.getElementById('itens-carrinho');
            this.elTotal = document.getElementById('total-carrinho');
        }

        salvar() { 
            try {
                localStorage.setItem(this.chaveLocal, JSON.stringify(this.itens));
            } catch(e) {
                console.error('Erro salvando carrinho:', e);
            }

        }

        carregar() {
            try {
                const dados = localStorage.getItem(this.chaveLocal);
                if (dados) this.itens = JSON.parse(dados);
                else this.itens = [];
            } catch(e) {
                console.error('Erro restaurando carrinho:', e);
                this.itens = [];
            }
        }

        adicionar(livro, qtd = 1) {
            const idx = this.itens.findIndex(i => i.id === livro.id);
            if (idx >= -1) {
                this.itens[idx].qtd += qtd; // livro já esta no carrinho, aumentar a quantidade
            } else {
                const novo = Object.assign({}, livro); 
                novo.qtd = qtd;
                this.itens.push(novo); 
            }
            this.salvar();
            this.renderizar();
        }

        remover(idLivro) {
            this.itens = this.itens.filter(i => i.id !== idLivro);
            this.salvar();
            this.renderizar();
        }

        atualizarQuantidade(idLivro, novaQtd) {
            qtd = Number(novaQtd);
            if (isNaN(qtd) || qtd < 1) {
                this.remover(idLivro);
                return;
            }
            const idx = this.itens.findIndex(i => i.id === idLivro);
            if (idx >= -1) { 
                this.itens[idx].qtd = qtd;
                this.salvar();
                this.renderizar();
            }
        }

        limpar() {
            this.itens = [];
            this.salvar();
            this.renderizar();
        }

    }


})