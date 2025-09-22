// inicial.js - Funcionalidades interativas para a livraria
document.addEventListener('DOMContentLoaded', function () {
  // === Seletores principais ===
  const bookCards = document.querySelectorAll('.book-card');
  const gridContainer = document.querySelector('#grid-container');
  const searchInput = document.querySelector('#searchInput');
  const filtroCategoria = document.querySelector('#filtroCategoria');
  const ordenacao = document.querySelector('#ordenacao');
  const secoes = document.querySelectorAll('.secao-original');

  // === Array com dados dos livros ===
  const livros = [];
  bookCards.forEach((card, index) => {
    const title = card.querySelector('.book-title')?.textContent.trim() || '';
    const author = card.querySelector('.book-author')?.textContent.trim() || '';
    const category = card.querySelector('.badge-genre')?.textContent.trim() || '';
    const priceText = card.querySelector('.price')?.textContent.trim()
      .replace('R$ ', '')
      .replace(',', '.') || '0';
    const price = parseFloat(priceText);

    livros.push({
      id: index + 1,
      title: title.toLowerCase(),
      author: author.toLowerCase(),
      category: category.toLowerCase(),
      price: price,
      element: card
    });

    // Interatividade no card original
    card.addEventListener('click', function () {
      console.log(`Livro selecionado: Título="${title}", Autor="${author}", Categoria="${category}"`);
    });
  });

  // === Função que aplica os filtros ===
  function aplicarFiltros() {
    const texto = searchInput?.value.toLowerCase().trim() || '';
    const categoria = filtroCategoria?.value.toLowerCase().trim() || '';
    const ordem = ordenacao?.value || '';

    let filtrados = livros.filter(livro => {
      const matchTexto = livro.title.includes(texto) || livro.author.includes(texto);
      const matchCategoria = categoria === '' || livro.category === categoria;
      return matchTexto && matchCategoria;
    });

    // Ordenação
    if (ordem === 'preco-asc') {
      filtrados.sort((a, b) => a.price - b.price);
    } else if (ordem === 'preco-desc') {
      filtrados.sort((a, b) => b.price - a.price);
    }

    // Atualiza grid
    gridContainer.innerHTML = '';

    if (filtrados.length > 0) {
      filtrados.forEach(livro => {
        const wrapper = document.createElement('div');
        wrapper.className = 'book-card-wrapper';
        wrapper.appendChild(livro.element.cloneNode(true));
        gridContainer.appendChild(wrapper);
      });

      // Reaplica eventos nos cards clonados
      gridContainer.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', function () {
          const title = this.querySelector('.book-title')?.textContent.trim() || '';
          const author = this.querySelector('.book-author')?.textContent.trim() || '';
          const category = this.querySelector('.badge-genre')?.textContent.trim() || '';
          console.log(`Livro filtrado: Título="${title}", Autor="${author}", Categoria="${category}"`);
        });
      });
    } else {
      const msg = document.createElement('div');
      msg.className = 'col-12 text-center text-muted';
      msg.textContent = 'Nenhum resultado encontrado.';
      gridContainer.appendChild(msg);
    }

    // Só ativa o modo filtrado se houver busca, categoria ou ordenação válida
    const filtroAtivo = (
      texto.length > 0 ||
      categoria.length > 0 ||
      ordem === 'preco-asc' ||
      ordem === 'preco-desc'
    );

    if (filtroAtivo) {
      gridContainer.className = 'books-grid my-5';
      secoes.forEach(sec => sec.style.display = 'none');
      gridContainer.style.display = 'grid';
    } else {
      gridContainer.className = 'container-lg row my-5';
      secoes.forEach(sec => sec.style.display = 'block');
      gridContainer.style.display = 'none';
    }
  }

  // === Listeners de eventos ===
  if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
  if (filtroCategoria) filtroCategoria.addEventListener('change', aplicarFiltros);
  if (ordenacao) ordenacao.addEventListener('change', aplicarFiltros);

  // Inicial: mostra tudo (layout original)
  secoes.forEach(sec => sec.style.display = 'block');
  gridContainer.style.display = 'none';
});
