(function(){ /*escopo fechado para não vazar para o espaço principal do site */
    'use strict';

    function textoParaCentavos(precoTexto) { /*converte string de preço para centavos inteiros */
        if (!precoTexto) return 0;
        let cleaned = precoTexto.replace(/\s/g, '').replace('R$', '').replace(/\u00A0/g, '');
        cleaned = cleaned.replace(/\./g,'').replace(',', '.');
        let num = parseFloat(cleaned);

        if (Number.isNaN(num)) return 0;
        return Math.round(num * 100); // converte para centavos

    }

    function centavosParaReal(centavos) { /*converte centavos inteiros para string de preço */
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
            this.pegarElemenos(); /*pega os elementos do DOM */
            this.renderizar(); 
        }

        
    }
})