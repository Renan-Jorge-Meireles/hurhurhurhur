// produto.js - JavaScript atualizado para a página de produtos

// Variáveis globais
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let nextId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
let produtoAtual = null;
let todosProdutos = [...produtos]; // Mantém cópia sincronizada
let fornecedores = [];

// Carregar produtos ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    buscarFornecedores();
    listarProdutos();

    // Pesquisar ao pressionar Enter
    document.getElementById('pesquisa-valor').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            pesquisarProduto();
        }
    });
});

// Função para buscar fornecedores (mantida igual)

// Função para cadastrar produto com validações
function cadastrarProduto(event) {
    event.preventDefault();

    try {
        // Validações básicas
        const nome = document.getElementById("nome").value.trim();
        const precoInput = document.getElementById("preco").value;
        const quantidade = parseInt(document.getElementById("quantidade_estoque").value);
        const fornecedorId = parseInt(document.getElementById("fornecedoresSelecionado").value);

        if (!nome) {
            alert("Por favor, insira um nome para o produto!");
            return false;
        }

        if (quantidade < 0) {
            alert("A quantidade em estoque não pode ser negativa!");
            return false;
        }

        // Formatar o preço
        const precoFormatado = parseFloat(
            precoInput.replace('R$', '')
                     .replace(/\./g, '')
                     .replace(',', '.')
                     .trim()
        );

        if (isNaN(precoFormatado) || precoFormatado <= 0) {
            alert("Por favor, insira um preço válido maior que zero!");
            return false;
        }

        const produto = {
            id: nextId++,
            nome: nome,
            preco: precoFormatado,
            descricao: document.getElementById("descricao").value.trim(),
            categoria: document.getElementById("categoria").value.trim(),
            quantidade_estoque: quantidade,
            fornecedor_id: fornecedorId,
            data_cadastro: new Date().toISOString()
        };

        // Adicionar ao array de produtos
        produtos.push(produto);
        todosProdutos = [...produtos]; // Atualizar cópia
        localStorage.setItem('produtos', JSON.stringify(produtos));

        alert("Produto cadastrado com sucesso!");
        document.getElementById("produto-form").reset();

        // Atualizar a lista imediatamente
        listarProdutos();

        return true;

    } catch (err) {
        console.error("Erro ao cadastrar produto:", err);
        alert("Erro ao cadastrar produto. Verifique os dados e tente novamente.");
        return false;
    }
}

// Função para buscar fornecedores do localStorage
function buscarFornecedores() {
    try {
        // Buscar fornecedores do localStorage (da página de fornecedores)
        fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];

        const selectCadastro = document.getElementById('fornecedoresSelecionado');
        const selectEdicao = document.getElementById('edit-fornecedor');

        // Limpar opções existentes (exceto a primeira)
        while (selectCadastro.options.length > 1) {
            selectCadastro.remove(1);
        }
        while (selectEdicao.options.length > 1) {
            selectEdicao.remove(1);
        }

        // Adicionar fornecedores do localStorage
        fornecedores.forEach(fornecedor => {
            // Para o select de cadastro
            const optionCadastro = document.createElement('option');
            optionCadastro.value = fornecedor.id;
            optionCadastro.textContent = fornecedor.nome;
            selectCadastro.appendChild(optionCadastro);

            // Para o select de edição
            const optionEdicao = document.createElement('option');
            optionEdicao.value = fornecedor.id;
            optionEdicao.textContent = fornecedor.nome;
            selectEdicao.appendChild(optionEdicao);
        });

        console.log('Fornecedores carregados:', fornecedores);
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        fornecedores = [];
    }
}

// Função melhorada para formatar preço
function formatarPreco(input) {
    const cursorPosition = input.selectionStart;
    let valor = input.value.replace(/\D/g, '');

    if (valor === '') {
        input.value = '';
        return;
    }

    // Garantir que temos pelo menos centavos
    valor = valor.padStart(3, '0');

    const inteiros = valor.slice(0, -2) || '0';
    const centavos = valor.slice(-2);

    // Formatar com separadores de milhar
    const valorFormatado = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = `R$ ${valorFormatado},${centavos}`;

    // Ajustar posição do cursor
    const newCursorPosition = cursorPosition + (input.value.length - valor.length);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// Função para escape seguro de strings
function escapeString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'")
              .replace(/"/g, '\\"')
              .replace(/`/g, '\\`');
}

// Função para exibir produtos com escape seguro
function exibirProdutos(produtos) {
    const tabela = document.getElementById('tabela-produtos');

    if (!produtos || produtos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">Nenhum produto encontrado.</td></tr>';
        return;
    }

    tabela.innerHTML = '';

    produtos.forEach(produto => {
        const linha = document.createElement('tr');
        const fornecedor = fornecedores.find(f => f.id === produto.fornecedor_id);
        const nomeFornecedor = fornecedor ? fornecedor.nome : 'Desconhecido';

        linha.innerHTML = `
            <td>${produto.id || '-'}</td>
            <td>${escapeString(produto.nome) || '-'}</td>
            <td>R$ ${produto.preco ? produto.preco.toFixed(2).replace('.', ',') : '0,00'}</td>
            <td>${escapeString(produto.categoria) || '-'}</td>
            <td>${produto.quantidade_estoque || '0'}</td>
            <td>${escapeString(nomeFornecedor)}</td>
            <td>
                <button class="btn-edit" onclick="editarProduto(${produto.id}, '${escapeString(produto.nome)}', ${produto.preco}, '${escapeString(produto.categoria)}', '${escapeString(produto.descricao)}', ${produto.quantidade_estoque}, ${produto.fornecedor_id})">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    Editar
                </button>
            </td>
        `;
        tabela.appendChild(linha);
    });
}

// Função para salvar edições com validação
function salvarEdicao() {
    if (!produtoAtual) return;

    try {
        // Validações
        const nome = document.getElementById('edit-nome').value.trim();
        const precoInput = document.getElementById('edit-preco').value;
        const quantidade = parseInt(document.getElementById('edit-quantidade_estoque').value);

        if (!nome) {
            alert("Por favor, insira um nome para o produto!");
            return;
        }

        if (quantidade < 0) {
            alert("A quantidade em estoque não pode ser negativa!");
            return;
        }

        const precoFormatado = parseFloat(
            precoInput.replace('R$', '')
                     .replace(/\./g, '')
                     .replace(',', '.')
                     .trim()
        );

        if (isNaN(precoFormatado) || precoFormatado <= 0) {
            alert("Por favor, insira um preço válido maior que zero!");
            return;
        }

        const produtoAtualizado = {
            nome: nome,
            preco: precoFormatado,
            categoria: document.getElementById('edit-categoria').value.trim(),
            descricao: document.getElementById('edit-descricao').value.trim(),
            quantidade_estoque: quantidade,
            fornecedor_id: parseInt(document.getElementById('edit-fornecedor').value)
        };

        // Encontrar e atualizar o produto
        const index = produtos.findIndex(p => p.id === produtoAtual.id);
        if (index !== -1) {
            produtos[index] = { ...produtos[index], ...produtoAtualizado };
            todosProdutos = [...produtos]; // Atualizar cópia
            localStorage.setItem('produtos', JSON.stringify(produtos));

            alert('Produto atualizado com sucesso!');
            closeEditModal();
            listarProdutos();
        } else {
            alert('Erro: Produto não encontrado.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar produto.');
    }
}

// Função para formatar o preço enquanto o usuário digita
function formatarPreco(input) {
    // Salvar a posição do cursor
    const cursorPosition = input.selectionStart;

    // Remove tudo que não é número
    let valor = input.value.replace(/\D/g, '');

    // Se estiver vazio, mostrar placeholder
    if (valor === '') {
        input.value = '';
        return;
    }

    // Adiciona zeros à esquerda se necessário
    valor = valor.padStart(3, '0');

    // Formata como moeda brasileira
    const valorNumerico = parseFloat(valor) / 100;
    const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Atualiza o valor do campo
    input.value = `R$ ${valorFormatado}`;

    // Restaurar a posição do cursor (ajustada para a formatação)
    const newCursorPosition = cursorPosition + (input.value.length - input.value.replace(/\D/g, '').length);
    input.setSelectionRange(newCursorPosition, newCursorPosition);
}

// Função para listar todos os produtos
function listarProdutos() {
    try {
        // Obter produtos do localStorage
        todosProdutos = JSON.parse(localStorage.getItem('produtos')) || [];
        exibirProdutos(todosProdutos);
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        document.getElementById('tabela-produtos').innerHTML = 
            '<tr><td colspan="7" style="text-align: center; color: #666;">Erro ao carregar produtos.</td></tr>';
    }
}

// Função para pesquisar produto por qualquer atributo
function pesquisarProduto() {
    const tipoPesquisa = document.querySelector('input[name="search-type"]:checked').value;
    const valorPesquisa = document.getElementById('pesquisa-valor').value.trim();

    if (!valorPesquisa) {
        alert('Por favor, digite um valor para pesquisar.');
        return;
    }

    // Se já temos os dados, pesquisar localmente
    if (todosProdutos.length > 0) {
        const produtosFiltrados = todosProdutos.filter(produto => {
            if (tipoPesquisa === 'fornecedor_id') {
                // Busca pelo nome do fornecedor em vez do ID
                const fornecedor = fornecedores.find(f => f.id === produto.fornecedor_id);
                return fornecedor && fornecedor.nome.toLowerCase().includes(valorPesquisa.toLowerCase());
            }

            if (!produto[tipoPesquisa]) return false;

            // Busca case-insensitive
            return produto[tipoPesquisa].toString()
                .toLowerCase()
                .includes(valorPesquisa.toLowerCase());
        });

        exibirProdutos(produtosFiltrados);
    }
}

// Função para limpar a pesquisa
function limparPesquisa() {
    document.getElementById('pesquisa-valor').value = '';
    listarProdutos();
}

// Função para exibir produtos na tabela
// Função para exibir produtos na tabela
function exibirProdutos(produtos) {
    const tabela = document.getElementById('tabela-produtos');

    if (!produtos || produtos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">Nenhum produto encontrado.</td></tr>';
        return;
    }

    // Atualizar lista de fornecedores antes de exibir
    buscarFornecedores();

    // Limpa a tabela
    tabela.innerHTML = '';

    // Preenche com os dados
    produtos.forEach(produto => {
        const linha = document.createElement('tr');

        // Buscar o fornecedor atualizado
        const fornecedor = fornecedores.find(f => f.id === produto.fornecedor_id);
        const nomeFornecedor = fornecedor ? fornecedor.nome : 'Desconhecido';

        linha.innerHTML = `
            <td>${produto.id || '-'}</td>
            <td>${produto.nome || '-'}</td>
            <td>R$ ${produto.preco ? produto.preco.toFixed(2).replace('.', ',') : '0,00'}</td>
            <td>${produto.categoria || '-'}</td>
            <td>${produto.quantidade_estoque || '0'}</td>
            <td>${nomeFornecedor}</td>
            <td>
                <button class="btn-edit" onclick="editarProduto(${produto.id})">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                    Editar
                </button>
            </td>
        `;
        tabela.appendChild(linha);
    });
}

// Função para abrir o modal de edição
// Função para abrir o modal de edição
function editarProduto(id) {
    // Buscar o produto pelo ID
    const produto = produtos.find(p => p.id === id);
    if (!produto) {
        alert('Produto não encontrado!');
        return;
    }

    produtoAtual = produto;

    // Atualizar lista de fornecedores antes de abrir o modal
    buscarFornecedores();

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nome').value = produto.nome || '';
    document.getElementById('edit-preco').value = `R$ ${produto.preco ? parseFloat(produto.preco).toFixed(2).replace('.', ',') : '0,00'}`;
    document.getElementById('edit-categoria').value = produto.categoria || '';
    document.getElementById('edit-descricao').value = produto.descricao || '';
    document.getElementById('edit-quantidade_estoque').value = produto.quantidade_estoque || 0;
    document.getElementById('edit-fornecedor').value = produto.fornecedor_id || '';

    document.getElementById('editModal').style.display = 'block';
}

// Função para fechar o modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    produtoAtual = null;
}

// Função para salvar as edições
function salvarEdicao() {
    if (!produtoAtual) return;

    try {
        // Formatar o preço para número (remover R$ e converter vírgula para ponto)
        const precoInput = document.getElementById('edit-preco').value;
        const precoFormatado = parseFloat(
            precoInput.replace('R$', '')
                     .replace(/\./g, '')
                     .replace(',', '.')
                     .trim()
        );

        // Validar se o preço é um número válido
        if (isNaN(precoFormatado)) {
            alert("Por favor, insira um preço válido!");
            return;
        }

        const produtoAtualizado = {
            nome: document.getElementById('edit-nome').value,
            preco: precoFormatado,
            categoria: document.getElementById('edit-categoria').value,
            descricao: document.getElementById('edit-descricao').value,
            quantidade_estoque: parseInt(document.getElementById('edit-quantidade_estoque').value),
            fornecedor_id: parseInt(document.getElementById('edit-fornecedor').value)
        };

        // Encontrar e atualizar o produto
        const index = produtos.findIndex(p => p.id === produtoAtual.id);
        if (index !== -1) {
            produtos[index] = { ...produtos[index], ...produtoAtualizado };
            localStorage.setItem('produtos', JSON.stringify(produtos));

            alert('Produto atualizado com sucesso!');
            closeEditModal();
            listarProdutos(); // Recarrega a lista
        } else {
            alert('Erro: Produto não encontrado.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar produto.');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Fechar modal clicando fora dele
window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
});

// Adicionar evento de formatação ao campo de preço quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const precoInput = document.getElementById('preco');
    const precoEditInput = document.getElementById('edit-preco');

    // Adicionar evento para formatar enquanto digita
    if (precoInput) {
        precoInput.addEventListener('input', function() {
            formatarPreco(this);
        });
    }

    if (precoEditInput) {
        precoEditInput.addEventListener('input', function() {
            formatarPreco(this);
        });
    }
});