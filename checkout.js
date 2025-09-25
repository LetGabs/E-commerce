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
    if (!response.ok) {
      throw new Error("Falha na rede");
    }

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
    atualizarStatus("Não foi possível buscar o CEP. Verifique sua conexão e preencha manualmente.", true);
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
