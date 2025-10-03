// venda.js - JavaScript corrigido para a página de vendas

// Variáveis globais
let carrinho = [];
let produtos = [];

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    buscarProdutos();
});

// Função para buscar produtos do localStorage
function buscarProdutos() {
    try {
        // Buscar produtos do localStorage (onde são salvos na página de produtos)
        produtos = JSON.parse(localStorage.getItem('produtos')) || [];

        const select = document.getElementById('produto-nome');

        // Limpar opções existentes (exceto a primeira)
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Adicionar produtos ao select
        produtos.forEach(produto => {
            // Verificar se há estoque disponível
            if (produto.quantidade_estoque > 0) {
                const option = document.createElement('option');
                option.value = produto.id;
                option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2)} - Disponível: ${produto.quantidade_estoque}`;
                option.setAttribute('data-preco', produto.preco);
                option.setAttribute('data-estoque', produto.quantidade_estoque);
                select.appendChild(option);
            }
        });

        if (produtos.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Nenhum produto cadastrado";
            select.appendChild(option);
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos. Verifique o console para mais detalhes.');
    }
}

// Função para buscar cliente pelo CPF
function buscarCliente() {
    const cpfInput = document.getElementById("cpf-cliente").value;

    if (!cpfInput) {
        alert("Por favor, insira o CPF do cliente.");
        return;
    }

    // Remover formatação do CPF (pontos e traços)
    const cpf = cpfInput.replace(/\D/g, '');

    // Buscar cliente do localStorage
    try {
        const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

        // Buscar por CPF (sem formatação)
        const cliente = clientes.find(c => {
            const clienteCPF = c.cpf.replace(/\D/g, '');
            return clienteCPF === cpf;
        });

        if (cliente) {
            const clienteInfo = document.getElementById("cliente-info");
            clienteInfo.innerHTML = `
                <div class="cliente-detalhes" style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>Nome:</strong> ${cliente.nome}</p>
                    <p><strong>CPF:</strong> ${cliente.cpf}</p>
                    <p><strong>Email:</strong> ${cliente.email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> ${cliente.telefone || 'Não informado'}</p>
                </div>
            `;
        } else {
            alert("Cliente não encontrado. Verifique o CPF ou cadastre o cliente primeiro.");
            document.getElementById("cliente-info").innerHTML = "";
        }
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        alert('Erro ao buscar cliente. Verifique o console para mais detalhes.');
    }
}

// Função para adicionar produto ao carrinho
function adicionarProdutoAoCarrinho() {
    const produtoSelect = document.getElementById("produto-nome");
    const produtoId = parseInt(produtoSelect.value);
    const quantidade = parseInt(document.getElementById("produto-quantidade").value);

    if (!produtoId || isNaN(quantidade) || quantidade <= 0) {
        alert("Por favor, selecione um produto válido e insira uma quantidade maior que zero.");
        return;
    }

    // Encontrar o produto selecionado
    const produto = produtos.find(p => p.id === produtoId);

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    // Verificar estoque
    if (quantidade > produto.quantidade_estoque) {
        alert(`Quantidade solicitada (${quantidade}) excede o estoque disponível (${produto.quantidade_estoque}).`);
        return;
    }

    // Verificar se o produto já está no carrinho
    const itemExistenteIndex = carrinho.findIndex(item => item.produto.id === produtoId);

    if (itemExistenteIndex !== -1) {
        // Atualizar quantidade se já estiver no carrinho
        const novaQuantidade = carrinho[itemExistenteIndex].quantidade + quantidade;

        if (novaQuantidade > produto.quantidade_estoque) {
            alert(`Quantidade total no carrinho (${novaQuantidade}) excede o estoque disponível (${produto.quantidade_estoque}).`);
            return;
        }

        carrinho[itemExistenteIndex].quantidade = novaQuantidade;
        carrinho[itemExistenteIndex].subtotal = produto.preco * novaQuantidade;
    } else {
        // Adicionar novo item ao carrinho
        const item = {
            produto: produto,
            quantidade: quantidade,
            subtotal: produto.preco * quantidade
        };
        carrinho.push(item);
    }

    atualizarCarrinho();
    document.getElementById("produto-quantidade").value = "1";
}

// Função para atualizar a exibição do carrinho
function atualizarCarrinho() {
    const carrinhoBody = document.querySelector("#carrinho");
    carrinhoBody.innerHTML = '';

    let totalVenda = 0;

    carrinho.forEach((item, index) => {
        const novaLinha = document.createElement("tr");
        novaLinha.setAttribute('data-index', index);
        novaLinha.innerHTML = `
            <td>${item.produto.id}</td>  
            <td>${item.produto.nome}</td>
            <td>
                <input type="number" value="${item.quantidade}" min="1" max="${item.produto.quantidade_estoque}" 
                       onchange="atualizarQuantidade(${index}, this.value)">
            </td>
            <td>R$ ${item.produto.preco.toFixed(2)}</td>
            <td>R$ ${item.subtotal.toFixed(2)}</td>
            <td><button class="btn-remove" onclick="removerProduto(${index})">Remover</button></td>
        `;
        carrinhoBody.appendChild(novaLinha);
        totalVenda += item.subtotal;
    });

    atualizarTotalVenda(totalVenda);
}

// Função para atualizar quantidade de um item no carrinho
function atualizarQuantidade(index, novaQuantidade) {
    novaQuantidade = parseInt(novaQuantidade);

    if (isNaN(novaQuantidade) || novaQuantidade <= 0) {
        alert("Por favor, insira uma quantidade válida.");
        return;
    }

    const item = carrinho[index];

    if (novaQuantidade > item.produto.quantidade_estoque) {
        alert(`Quantidade solicitada (${novaQuantidade}) excede o estoque disponível (${item.produto.quantidade_estoque}).`);
        // Reverter para a quantidade anterior
        document.querySelector(`tr[data-index="${index}"] input`).value = item.quantidade;
        return;
    }

    item.quantidade = novaQuantidade;
    item.subtotal = item.produto.preco * novaQuantidade;

    atualizarCarrinho();
}

// Função para remover produto do carrinho
function removerProduto(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

// Função para atualizar o total da venda
function atualizarTotalVenda(total) {
    const totalVendaElement = document.getElementById("total-venda");
    totalVendaElement.setAttribute("data-total", total);
    totalVendaElement.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Função para finalizar a venda
// Função para finalizar a venda - VERSÃO CORRIGIDA
function finalizarVenda() {
    const cpfClienteInput = document.getElementById("cpf-cliente").value;

    if (!cpfClienteInput) {
        alert("Por favor, insira o CPF do cliente.");
        return;
    }

    if (carrinho.length === 0) {
        alert("O carrinho está vazio. Adicione produtos para finalizar a venda.");
        return;
    }

    // Remover formatação do CPF digitado (pontos e traços)
    const cpfDigitado = cpfClienteInput.replace(/\D/g, '');

    // Verificar se o cliente existe
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

    // Buscar por CPF (comparando sem formatação)
    const cliente = clientes.find(c => {
        const clienteCPF = c.cpf.replace(/\D/g, '');
        return clienteCPF === cpfDigitado;
    });

    if (!cliente) {
        alert("Cliente não encontrado. Por favor, verifique o CPF.");
        return;
    }

    // Criar objeto da venda
    const venda = {
        id: gerarIdVenda(),
        cliente: cliente,
        itens: carrinho.map(item => ({
            produto: item.produto,
            quantidade: item.quantidade,
            subtotal: item.subtotal
        })),
        total: carrinho.reduce((sum, item) => sum + item.subtotal, 0),
        data: new Date().toISOString(),
        status: 'concluída'
    };

    // Atualizar estoque dos produtos
    atualizarEstoque(venda.itens);

    // Salvar venda no localStorage
    salvarVenda(venda);

    alert("Venda realizada com sucesso!");
    limparFormulario();
}

// Função para gerar ID único para a venda
function gerarIdVenda() {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    return vendas.length > 0 ? Math.max(...vendas.map(v => v.id)) + 1 : 1;
}

// Função para atualizar estoque após venda
function atualizarEstoque(itensVenda) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];

    itensVenda.forEach(itemVenda => {
        const produtoIndex = produtos.findIndex(p => p.id === itemVenda.produto.id);
        if (produtoIndex !== -1) {
            produtos[produtoIndex].quantidade_estoque -= itemVenda.quantidade;
        }
    });

    localStorage.setItem('produtos', JSON.stringify(produtos));
}

// Função para salvar venda no localStorage
function salvarVenda(venda) {
    const vendas = JSON.parse(localStorage.getItem('vendas')) || [];
    vendas.push(venda);
    localStorage.setItem('vendas', JSON.stringify(vendas));
}

// Função para limpar formulário
function limparFormulario() {
    document.getElementById("cpf-cliente").value = "";
    document.getElementById("cliente-info").innerHTML = "";
    document.getElementById("produto-quantidade").value = "1";
    carrinho = [];
    atualizarCarrinho();
    buscarProdutos(); // Recarregar produtos para atualizar estoque
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Fechar sidebar quando clicar fora dela em mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.sidebar-toggle');

    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Adicionar no venda.js - Formatar CPF enquanto digita
document.addEventListener('DOMContentLoaded', function() {
    const cpfInput = document.getElementById('cpf-cliente');

    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2')
                             .replace(/(\d{3})(\d)/, '$1.$2')
                             .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
    }
});