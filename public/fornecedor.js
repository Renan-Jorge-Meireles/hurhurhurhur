let fornecedorAtual = null;
let fornecedores = JSON.parse(localStorage.getItem('fornecedores')) || [];
let nextId = Math.max(0, ...fornecedores.map(f => f.id)) + 1;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar evento de submit ao formulário
    document.getElementById('fornecedor-form').addEventListener('submit', cadastrarFornecedor);

    // Carregar fornecedores ao iniciar
    listarFornecedores();

    // Formatar CNPJ enquanto digita
    document.getElementById('cnpj').addEventListener('input', formatarCNPJInput);
    document.getElementById('edit-cnpj').addEventListener('input', formatarCNPJInput);

    // Formatar telefone enquanto digita
    document.getElementById('telefone').addEventListener('input', formatarTelefoneInput);
    document.getElementById('edit-telefone').addEventListener('input', formatarTelefoneInput);
});

function cadastrarFornecedor(event) {
    event.preventDefault();

    const fornecedor = {
        id: nextId++,
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value.replace(/\D/g, ''),
        cnpj: document.getElementById("cnpj").value.replace(/\D/g, '')
    };

    // Verificar se CNPJ já existe
    if (fornecedores.some(f => f.cnpj === fornecedor.cnpj)) {
        alert("Já existe um fornecedor cadastrado com este CNPJ!");
        return;
    }

    try {
        // Adicionar fornecedor à lista
        fornecedores.push(fornecedor);

        // Salvar no localStorage
        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
        localStorage.setItem('nextId', nextId);

        alert("Fornecedor cadastrado com sucesso!");
        document.getElementById("fornecedor-form").reset();
        listarFornecedores(); // Atualiza a lista automaticamente
    } catch (err) {
        console.error("Erro ao cadastrar fornecedor:", err);
        alert("Erro ao cadastrar fornecedor.");
    }
}

// Função para pesquisar fornecedor por CNPJ
function pesquisarPorCNPJ() {
    const cnpj = document.getElementById('pesquisa-cnpj').value.trim().replace(/\D/g, '');

    if (!cnpj) {
        alert('Por favor, digite um CNPJ para pesquisar.');
        return;
    }

    try {
        const resultado = fornecedores.filter(fornecedor => 
            fornecedor.cnpj.includes(cnpj)
        );

        const tabela = document.getElementById('tabela-fornecedores');
        tabela.innerHTML = '';

        if (resultado.length === 0) {
            tabela.innerHTML = '<tr><td colspan="5">Nenhum fornecedor encontrado com este CNPJ.</td></tr>';
        } else {
            resultado.forEach(fornecedor => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${fornecedor.id}</td>
                    <td>${fornecedor.nome}</td>
                    <td>${formatarCNPJ(fornecedor.cnpj)}</td>
                    <td>${formatarTelefone(fornecedor.telefone)}</td>
                    <td>
                        <button class="btn-edit" onclick="editarFornecedor(${fornecedor.id})">
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

    } catch (error) {
        console.error('Erro ao pesquisar fornecedor:', error);
        alert('Erro ao pesquisar fornecedor.');
    }
}

// Função para formatar CNPJ
function formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length === 14) {
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return cnpj;
}

// Função para formatar CNPJ enquanto digita
function formatarCNPJInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);

    if (value.length > 12) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
    } else if (value.length > 8) {
        value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
    } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,3})/, "$1.$2");
    }

    e.target.value = value;
}

// Função para formatar telefone
function formatarTelefone(telefone) {
    const nums = telefone.replace(/\D/g, '');
    if (nums.length === 11) {
        return nums.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (nums.length === 10) {
        return nums.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
}

// Função para formatar telefone enquanto digita
function formatarTelefoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2})/, '($1');
    }

    e.target.value = value;
}

// Função para listar todos os fornecedores
function listarFornecedores() {
    try {
        const tabela = document.getElementById('tabela-fornecedores');
        tabela.innerHTML = '';

        if (fornecedores.length === 0) {
            tabela.innerHTML = '<tr><td colspan="5">Nenhum fornecedor cadastrado.</td></tr>';
        } else {
            fornecedores.forEach(fornecedor => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${fornecedor.id}</td>
                    <td>${fornecedor.nome}</td>
                    <td>${formatarCNPJ(fornecedor.cnpj)}</td>
                    <td>${formatarTelefone(fornecedor.telefone)}</td>
                    <td>
                        <button class="btn-edit" onclick="editarFornecedor(${fornecedor.id})">
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
    } catch (error) {
        console.error('Erro ao listar fornecedores:', error);
        alert('Erro ao carregar lista de fornecedores.');
    }
}

// Função para encontrar fornecedor por ID
function encontrarFornecedorPorId(id) {
    return fornecedores.find(f => f.id === id);
}

// Função para abrir o modal de edição
function editarFornecedor(id) {
    const fornecedor = encontrarFornecedorPorId(id);
    if (!fornecedor) return;

    fornecedorAtual = fornecedor;

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nome').value = fornecedor.nome;
    document.getElementById('edit-cnpj').value = formatarCNPJ(fornecedor.cnpj);
    document.getElementById('edit-telefone').value = formatarTelefone(fornecedor.telefone);

    document.getElementById('editModal').style.display = 'block';
}

// Função para fechar o modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    fornecedorAtual = null;
}

// Função para salvar as edições
function salvarEdicao() {
    if (!fornecedorAtual) return;

    const nome = document.getElementById('edit-nome').value;
    const cnpj = document.getElementById('edit-cnpj').value.replace(/\D/g, '');
    const telefone = document.getElementById('edit-telefone').value.replace(/\D/g, '');

    // Verificar se CNPJ já existe (excluindo o próprio fornecedor)
    if (fornecedores.some(f => f.cnpj === cnpj && f.id !== fornecedorAtual.id)) {
        alert("Já existe outro fornecedor cadastrado com este CNPJ!");
        return;
    }

    try {
        // Atualizar fornecedor
        fornecedorAtual.nome = nome;
        fornecedorAtual.cnpj = cnpj;
        fornecedorAtual.telefone = telefone;

        // Salvar no localStorage
        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));

        alert('Fornecedor atualizado com sucesso!');
        closeEditModal();
        listarFornecedores(); // Atualiza a lista
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        alert('Erro ao atualizar fornecedor.');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Fechar sidebar quando clicar fora dela em mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    const modal = document.getElementById('editModal');

    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }

    // Fechar modal clicando fora dele
    if (event.target === modal) {
        closeEditModal();
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEditModal();
    }
});

// Permitir pesquisa ao pressionar Enter no campo de CNPJ
document.getElementById('pesquisa-cnpj').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        pesquisarPorCNPJ();
    }
});