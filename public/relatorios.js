// Função para buscar o relatório com filtros
function buscarRelatorio() {
    const cpf = document.getElementById("cpf").value;
    const produto = document.getElementById("produto").value;
    const dataInicio = document.getElementById("dataInicio").value;
    const dataFim = document.getElementById("dataFim").value;

    // Buscar vendas do localStorage
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];

    // Aplicar filtros
    let vendasFiltradas = vendas.filter(venda => {
        // Filtro por CPF
        if (cpf) {
            const cpfCliente = venda.cliente.cpf.replace(/\D/g, '');
            const cpfFiltro = cpf.replace(/\D/g, '');
            if (!cpfCliente.includes(cpfFiltro)) return false;
        }

        // Filtro por produto
        if (produto) {
            const temProduto = venda.itens.some(item => 
                item.produto.nome.toLowerCase().includes(produto.toLowerCase())
            );
            if (!temProduto) return false;
        }

        // Filtro por data
        if (dataInicio) {
            const dataVenda = new Date(venda.data).toISOString().split('T')[0];
            if (dataVenda < dataInicio) return false;
        }

        if (dataFim) {
            const dataVenda = new Date(venda.data).toISOString().split('T')[0];
            if (dataVenda > dataFim) return false;
        }

        return true;
    });

    // Exibir resultados
    exibirRelatorio(vendasFiltradas);
}

// Função para exibir o relatório na tabela
function exibirRelatorio(vendas) {
    const tabelaVendas = document.getElementById("tabela-vendas");
    tabelaVendas.innerHTML = '';

    if (vendas.length === 0) {
        tabelaVendas.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Nenhuma venda encontrada com os filtros aplicados</td>
            </tr>
        `;
        return;
    }

    // Para cada venda, criar uma linha para cada item
    vendas.forEach(venda => {
        venda.itens.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${venda.id}</td>
                <td>${venda.cliente.nome}</td>
                <td>${item.produto.nome}</td>
                <td>${item.quantidade}</td>
                <td>${new Date(venda.data).toLocaleString('pt-BR')}</td>
            `;
            tabelaVendas.appendChild(tr);
        });
    });
}

// Carregar relatório ao abrir a página
document.addEventListener('DOMContentLoaded', function() {
    buscarRelatorio();
});