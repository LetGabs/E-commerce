const dadosGerais = {
  nome: document.getElementById('nome'),
  email: document.getElementById('email'),

  cep: document.getElementById('cep'),
  rua: document.getElementById('rua'),
  numero: document.getElementById('numero'),
  bairro: document.getElementById('bairro'),
  cidade: document.getElementById('cidade'),
  uf: document.getElementById('uf'),
  cartao: document.getElementById('cartao'),
  validade: document.getElementById('validade'),
  cvv: document.getElementById('cvv'),
};

// ==========================
// STATUS DO CEP
// ==========================
let statusBox = document.getElementById("cep-status");
if (!statusBox) {
  statusBox = document.createElement("div");
  statusBox.id = "cep-status";
  statusBox.setAttribute("aria-live", "polite");
  statusBox.style.marginTop = "0.5rem";
  statusBox.style.fontSize = "0.9rem";
  statusBox.style.color = "#D12771";
  dadosGerais.cep.insertAdjacentElement("afterend", statusBox);
}

function atualizarStatus(msg, isError = false) {
  statusBox.textContent = msg;
  statusBox.style.color = isError ? "#D12771" : "#007D79";
}

async function buscarCEP(cep) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error("Falha na rede");

    const data = await response.json();

    if (data.erro) {
      atualizarStatus("CEP não encontrado. Preencha manualmente.", true);
      dadosGerais.rua.value = "";
      dadosGerais.bairro.value = "";
      dadosGerais.cidade.value = "";
      dadosGerais.uf.value = "";
      return;
    }

    dadosGerais.rua.value = data.logradouro || "";
    dadosGerais.bairro.value = data.bairro || "";
    dadosGerais.cidade.value = data.localidade || "";
    dadosGerais.uf.value = data.uf || "";

    atualizarStatus("Endereço preenchido automaticamente.");
    dadosGerais.numero.focus();
  } catch (error) {
    atualizarStatus(
      "Não foi possível buscar o CEP. Verifique sua conexão e preencha manualmente.",
      true
    );
  }
}

dadosGerais.cep.addEventListener("blur", () => {
  const cep = dadosGerais.cep.value.replace(/\D/g, "");

  if (cep.length < 8) {
    atualizarStatus("CEP incompleto — digite 8 números.", true);
    return;
  }

  atualizarStatus("Buscando CEP...");
  buscarCEP(cep);
});

// ==========================
// FUNÇÕES DO CARRINHO
// ==========================
function centavosParaReal(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function carregarCarrinho(chave = "livraria_carrinho") {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
  } catch (e) {
    console.error("Erro carregando carrinho no checkout:", e);
    return [];
  }
}

function renderizarCheckout() {
  const itens = carregarCarrinho();
  const elItens = document.getElementById("resumo-pedido");
  const elTotal = document.getElementById("resumo-total");

  if (!elItens || !elTotal) return;

  elItens.innerHTML = "";

  if (itens.length === 0) {
    elItens.innerHTML = `<li class="empty-message">Seu carrinho está vazio.</li>`;
    elTotal.textContent = centavosParaReal(0);
    return;
  }

  let total = 0;

  itens.forEach((item) => {
    const subtotal = item.priceCents * item.qtd;
    total += subtotal;

    const li = document.createElement("li");
    li.className = "d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${item.title}</strong>
        <div class="small text-muted">Qtd: ${item.qtd}</div>
      </div>
      <span>${centavosParaReal(subtotal)}</span>
    `;
    elItens.appendChild(li);
  });

  elTotal.textContent = centavosParaReal(total);
}

document.addEventListener("DOMContentLoaded", renderizarCheckout);
function confirmarCompra() {
  const itens = carregarCarrinho();

  if (itens.length === 0) {
    alert("Seu carrinho está vazio. Adicione itens antes de finalizar a compra.");
    return;
  }

  let total = itens.reduce((acc, item) => acc + item.priceCents * item.qtd, 0);
  let valorFinal = centavosParaReal(total);

  // Confirmação da compra
  const confirmar = confirm(`O total da sua compra é ${valorFinal}. Deseja confirmar o pedido?`);

  if (confirmar) {
    alert("Compra realizada com sucesso! Obrigado por escolher nossa livraria. 📚✨");

    // Limpa o carrinho
    localStorage.removeItem("livraria_carrinho");

    // Atualiza o resumo
    renderizarCheckout();
  }
}

// Captura o clique no botão
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".btn-confirm");
  if (btn) {
    btn.addEventListener("click", confirmarCompra);
  }
});
