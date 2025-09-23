(function () {
  "use strict"; 

  //funções auxiliares 
  function textoParaCentavos(precoTexto) {
    if (!precoTexto) return 0;
    let cleaned = precoTexto
      .replace(/\s/g, "")
      .replace("R$", "")
      .replace(/\u00A0/g, "");
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    let num = parseFloat(cleaned); // virar número decimal
    if (Number.isNaN(num)) return 0;
    return Math.round(num * 100);
  }

  function centavosParaReal(centavos) {
    return (centavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // Classe Carrinho 
  class Carrinho {
    constructor(chaveLocal = "livraria_carrinho") {
      this.chaveLocal = chaveLocal; // chave usada no localStorage
      this.itens = []; 
      this.carregar();
      this.pegarElementos();
      this.renderizar();
    }

    pegarElementos() {
      this.elItensCarrinho = document.getElementById("itens-carrinho");
      this.elTotal = document.getElementById("total-carrinho");
    }

    salvar() {
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

    adicionar(produto, qtd = 1) {
      const idx = this.itens.findIndex((i) => i.id === produto.id);
      if (idx > -1) {
        this.itens[idx].qtd += qtd;
      } else {
        const novo = Object.assign({}, produto);
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
      if (idx > -1) {
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
      return item.priceCents * item.qtd;
    }

    totalCentavos() {
      return this.itens.reduce((soma, item) => soma + this.subtotalItem(item), 0);
    }

    totalItens() {
      return this.itens.reduce((soma, item) => soma + item.qtd, 0);
    }

    renderizar() {
      const el = this.elItensCarrinho;
      el.innerHTML = "";

      if (this.itens.length === 0) {
        el.innerHTML = `<div class="text-center text-muted py-4">Carrinho vazio</div>`;
        this.elTotal.textContent = centavosParaReal(0);
    
        return;
      }


        // Monta os itens no carrinho no DOM
      this.itens.forEach((item) => {
        const itemEl = document.createElement("div");
        itemEl.className = "list-group-item d-flex gap-3 align-items-start";
        itemEl.innerHTML = `
          <img src="${item.img || ""}" alt="${item.title}" width="64" height="86" class="img-fluid rounded" style="object-fit:cover;">
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">${item.title}</div>
                <div class="small text-muted">${item.author || ""}</div>
                <div class="small text-muted">${item.genre || ""}</div>
              </div>
              <div class="text-end">
                <div class="fw-bold">${centavosParaReal(this.subtotalItem(item))}</div>
                <div class="small text-muted">${centavosParaReal(item.priceCents)}</div>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2 mt-2">
              <button class="btn btn-sm btn-outline-secondary btn-diminuir" data-id="${item.id}">-</button>
              <input class="form-control form-control-sm text-center qtd-input" type="number" min="1" value="${item.qtd}" data-id="${item.id}" style="width:70px;">
              <button class="btn btn-sm btn-outline-secondary btn-aumentar" data-id="${item.id}">+</button>
              <button class="btn btn-sm btn-outline-danger ms-auto btn-remover" data-id="${item.id}">Remover</button>
            </div>
          </div>
        `;

        itemEl.querySelector(".btn-diminuir").addEventListener("click", () => {
          this.atualizarQuantidade(item.id, item.qtd - 1);
        });

        itemEl.querySelector(".btn-aumentar").addEventListener("click", () => {
          this.atualizarQuantidade(item.id, item.qtd + 1);
        });

        itemEl.querySelector(".qtd-input").addEventListener("change", (e) => {
          let val = parseInt(e.currentTarget.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          this.atualizarQuantidade(item.id, val);
        });

        itemEl.querySelector(".btn-remover").addEventListener("click", () => {
          this.remover(item.id);
        });

        el.appendChild(itemEl);
      });

      this.elTotal.textContent = centavosParaReal(this.totalCentavos());
      
    }



  }

  // Instância 
  const carrinho = new Carrinho();

  //  Abrir offcanvas pelos botões da navbar 
  document.querySelectorAll("#btnAbrirCarrinho, #btnAbrirCarrinhoNav").forEach((btn) => {
    btn.addEventListener("click", () => {
      const offEl = document.getElementById("offcanvasCarrinho");
      if (offEl) {
        const off = new bootstrap.Offcanvas(offEl);
        off.show();
      }
    });
  });

  // Botões "Adicionar" nos modais 
  document.querySelectorAll(".modal .modal-footer .btn-primary").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (!modal) return;

      const id = modal.id || "produto_" + Math.random().toString(36).slice(2, 9);
      const titleEl = modal.querySelector(".modal-title");
      const title = titleEl ? titleEl.textContent.trim() : "Produto";

      const priceEl =
        modal.querySelector(".fs-5.fw-bold.text-primary") ||
        modal.querySelector(".fs-5.fw-bold") ||
        modal.querySelector(".text-primary.fs-5");
      const priceText = priceEl ? priceEl.textContent.trim() : null;
      const priceCents = textoParaCentavos(priceText);

      let author = "";
      let genre = "";
      Array.from(modal.querySelectorAll("p")).forEach((p) => {
        const txt = p.textContent.trim();
        if (/^Autor/i.test(txt)) {
          author = txt.replace(/^Autor[:\s]*/i, "").trim();
        } else if (/^G[êe]nero/i.test(txt)) {
          genre = txt.replace(/^G[êe]nero[:\s]*/i, "").trim();
        }
      });

      const imgEl = modal.querySelector("img");
      const img = imgEl ? imgEl.src : "";

      const produto = {
        id: id,
        title: title,
        author: author,
        genre: genre,
        img: img,
        priceCents: priceCents,
      };

      carrinho.adicionar(produto, 1);

      // fecha modal
      try {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.hide();
      } catch {}

      // abre carrinho automaticamente
      const offEl = document.getElementById("offcanvasCarrinho");
      if (offEl) {
        const off = new bootstrap.Offcanvas(offEl);
        off.show();
      }
    });
  });

  // Botões extras 
  document.getElementById("btnLimparCarrinho")?.addEventListener("click", () => {
    carrinho.limpar();
  });

  document.getElementById("btnFinalizarCompra")?.addEventListener("click", () => {
    const total = carrinho.totalCentavos();
    if (total === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }
    alert("LEVAR PARA LARA Total: " + centavosParaReal(total));
  });
})();
