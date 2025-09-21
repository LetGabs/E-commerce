(function () {
  //escopo fechado para não vazar para o espaço principal do site
  "use strict";
  function textoParaCentavos(precoTexto) {
    //converte string de preço para centavos inteiros
    if (!precoTexto) return 0;
    let cleaned = precoTexto
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\u00A0/g, "");
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    let num = parseFloat(cleaned);

    if (Number.isNaN(num)) return 0;
    return Math.round(num * 100); // converte para centavos
  }

  function centavosParaReal(centavos) {
    //converte centavos inteiros para string de preço
    return (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  class Carrinho {
    constructor(chaveLocal = "livraria_carrinho") {
      this.chaveLocal = chaveLocal;
      this.itens = [];
      this.carregar();
      this.pegarElementos(); //pega os elementos do DOM
      this.renderizar();
    }

    pegarElementos() {
      this.elItensCarrinho = document.getElementById("itens-carrinho");
      this.elTotal = document.getElementById("total-carrinho");
    }

    salvar() {
      //salva o carrinho no localStorage(memória do navegador)
      try {
        localStorage.setItem(this.chaveLocal, JSON.stringify(this.itens));
      } catch (e) {
        console.error("Erro salvando carrinho:", e);
      }
    }

    carregar() {
      try {
        const dados = localStorage.getItem(this.chaveLocal);
        if (dados) this.itens = JSON.parse(dados);
        else this.itens = [];
      } catch (e) {
        console.error("Erro restaurando carrinho:", e);
        this.itens = [];
      }
    }

    adicionar(livro, qtd = 1) {
      const idx = this.itens.findIndex((i) => i.id === livro.id);
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

    remover(idProduto) {
      this.itens = this.itens.filter((i) => i.id !== idProduto);
      this.salvar();
      this.renderizar();
    }

    atualizarQuantidade(idProduto, qtd) {
      qtd = Number(qtd);
      if (isNaN(qtd) || qtd < 1) {
        this.remover(idProduto);
        return;
      }
      const idx = this.itens.findIndex((i) => i.id === idProduto);
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

    subtotalItem(item) {
      return item.precoCentavos * item.qtd;
    }

    totalCentavos() {
      return this.itens.reduce(
        (soma, item) => soma + this.subtotalItem(item),
        0
      );
    }

    totalItens() {
      return this.itens.reduce((soma, item) => soma + item.qtd, 0);
    }
    // Atualiza a exibição do carrinho
    renderizar() {
      const el = this.elItensCarrinho;
      el.innerHTML = ""; //limpa o conteúdo atual

      if (this.itens.length) {
        el.innerHTML = `<div class="text-center text-muted py-4">Carrinho vazio</div>`;
        this.elTotal.textContent = centavosParaReal(0);
        return;
      }

      this.itens.forEach((item) => {
        const itemEl = document.createElement("div");
        itemEl.className = "list-group-item d-flex gap-3 align-items-start";
        itemEl.innerHTML = `
          <img src="${item.img || ""}" alt="${
          item.titulo
        }" width="64" height="86" class="img-fluid rounded" style="object-fit:cover;">
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">${item.titulo}</div>
                <div class="small text-muted">${item.autor || ""}</div>
                <div class="small text-muted">${item.genero || ""}</div>
              </div>
              <div class="text-end">
                <div class="fw-bold">${centavosParaReal(
                  this.subtotalItem(item)
                )}</div>
                <div class="small text-muted">${centavosParaReal(
                  item.precoCentavos
                )}</div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2 mt-2">
              <button class="btn btn-sm btn-outline-secondary btn-diminuir" data-id="${
                item.id
              }">-</button>
              <input class="form-control form-control-sm text-center qtd-input" type="number" min="1" value="${
                item.qtd
              }" data-id="${item.id}" style="width:70px;">
              <button class="btn btn-sm btn-outline-secondary btn-aumentar" data-id="${
                item.id
              }">+</button>
              <button class="btn btn-sm btn-outline-danger ms-auto btn-remover" data-id="${
                item.id
              }">Remover</button>
            </div>
          </div>
        `;
            // evento diminuir quantidade
        itemEl.querySelector(".btn-diminuir").addEventListener("click", () => {
          this.atualizarQuantidade(item.id, item.qtd - 1);
        });
            // evento aumentar quantidade
        itemEl.querySelector(".btn-aumentar").addEventListener("click", () => {
            this.atualizarQuantidade(item.id, item.qtd + 1);
        });

        // evento input de quantidade
        itemEl.querySelector(".qtd-input").addEventListener("change", (e) => {
            let val = parseInt(e.currentTarget.value, 10); 
            if (isNaN(val) || val < 1) val = 1;
            this.atualizarQuantidade(item.id, val);
        });

        // evento remover 
        itemEl.querySelector(".btn-remover").addEventListener("click", () => {
          this.remover(item.id);
        });

        el.appendChild(itemEl);
      });

        this.elTotal.textContent = centavosParaReal (this.totalCentavos()); //atualiza o total no rodapé

    }
  }

  
});
