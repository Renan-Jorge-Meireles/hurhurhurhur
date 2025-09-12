let funcionarioAtual = null;

async function cadastrarFornecedor(event) {
    event.preventDefault();

    const fornecedor = {
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        cnpj: document.getElementById("cnpj").value
    };

    try {
        const response = await fetch('/fornecedores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fornecedor)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Funcionario cadastrado com sucesso!");
            document.getElementById("fornecedor-form").reset();
            listarFornecedores(); // Atualiza a lista automaticamente
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar funcionario");
    }
}

// Função para listar todos os fornecedores ou buscar fornecedores por cnpj
async function listarFornecedores() {
    const cnpj = document.getElementById('cnpj').value.trim();  // Pega o valor do cnpj digitado no input

    let url = '/fornecedores';  // URL padrão para todos os fornecedores

    if (cnpj) {
        // Se cnpj foi digitado, adiciona o parâmetro de consulta
        url += `?cnpj=${cnpj}`;
    }

    try {
        const response = await fetch(url);
        const fornecedores = await response.json();

        const tabela = document.getElementById('tabela-funcionarios');
        tabela.innerHTML = ''; // Limpa a tabela antes de preencher

        if (fornecedores.length === 0) {
            // Caso não encontre fornecedores, exibe uma mensagem
            tabela.innerHTML = '<tr><td colspan="7">Nenhum funcionario encontrado.</td></tr>';
        } else {
            fornecedores.forEach(fornecedor => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${fornecedor.id}</td>
                    <td>${fornecedor.nome}</td>
                    <td>${fornecedor.cnpj}</td>
                    <td>${fornecedor.email}</td>
                    <td>${fornecedor.telefone}</td>
                    <td>
                        <button class="btn-edit" onclick="editarFuncionario(${fornecedor.id}, '${fornecedor.nome}', '${fornecedor.cnpj}', '${fornecedor.email}', '${fornecedor.telefone}')">
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
        console.error('Erro ao listar funcionarios:', error);
    }
}

// Função para abrir o modal de edição
function editarFuncionario(id, nome, cnpj, email, telefone) {
    funcionarioAtual = { id, nome, cnpj, email, telefone };

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nome').value = nome;
    document.getElementById('edit-cnpj').value = cnpj;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-telefone').value = telefone;

    document.getElementById('editModal').style.display = 'block';
}

// Função para fechar o modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    funcionarioAtual = null;
}

// Função para salvar as edições
async function salvarEdicao() {
    if (!funcionarioAtual) return;

    const funcionarioAtualizado = {
        nome: document.getElementById('edit-nome').value,
        email: document.getElementById('edit-email').value,
        telefone: document.getElementById('edit-telefone').value,
        cnpj: document.getElementById('edit-cnpj').value
    };

    try {
        const response = await fetch(`/fornecedores/cnpj/${funcionarioAtual.cnpj}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(funcionarioAtualizado)
        });

        if (response.ok) {
            alert('Funcionario atualizado com sucesso!');
            closeEditModal();
            listarFornecedores(); // Atualiza a lista
        } else {
            const errorMessage = await response.text();
            alert('Erro ao atualizar funcionario: ' + errorMessage);
        }
    } catch (error) {
        console.error('Erro ao atualizar funcionario:', error);
        alert('Erro ao atualizar funcionario.');
    }
}

async function limpaFornecedor() {
    document.getElementById('nome').value = '';
    document.getElementById('cnpj').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
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