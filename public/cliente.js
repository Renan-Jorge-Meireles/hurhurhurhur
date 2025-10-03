// cliente.js - JavaScript corrigido para usar localStorage

let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let nextClienteId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;
let clienteAtual = null;

// Carregar clientes ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    listarClientes();
});

function cadastrarCliente(event) {
    event.preventDefault();

    try {
        const cpf = document.getElementById("cpf").value.trim();
        const nome = document.getElementById("nome").value.trim();
        const telefone = document.getElementById("telefone").value.trim();
        const email = document.getElementById("email").value.trim();
        const endereco = document.getElementById("endereco").value.trim();

        // Validações básicas
        if (!cpf) {
            alert("Por favor, insira o CPF do cliente!");
            return false;
        }

        if (!nome) {
            alert("Por favor, insira o nome do cliente!");
            return false;
        }

        // Verificar se CPF já existe
        const cpfExistente = clientes.find(cliente => cliente.cpf === cpf);
        if (cpfExistente) {
            alert("Já existe um cliente cadastrado com este CPF!");
            return false;
        }

        const cliente = {
            id: nextClienteId++,
            nome: nome,
            telefone: telefone,
            email: email,
            cpf: cpf,
            endereco: endereco,
            data_cadastro: new Date().toISOString()
        };

        // Adicionar ao array de clientes
        clientes.push(cliente);
        localStorage.setItem('clientes', JSON.stringify(clientes));

        alert("Cliente cadastrado com sucesso!");
        document.getElementById("cliente-form").reset();

        // Atualizar a lista imediatamente
        listarClientes();

        return true;

    } catch (err) {
        console.error("Erro ao cadastrar cliente:", err);
        alert("Erro ao cadastrar cliente. Verifique os dados e tente novamente.");
        return false;
    }
}

// Função para pesquisar cliente por CPF
function pesquisarPorCPF() {
    const cpf = document.getElementById('pesquisa-cpf').value.trim();

    if (!cpf) {
        alert('Por favor, digite um CPF para pesquisar.');
        return;
    }

    try {
        const clientesFiltrados = clientes.filter(cliente => 
            cliente.cpf.includes(cpf)
        );

        const tabela = document.getElementById('tabela-clientes');
        tabela.innerHTML = '';

        if (clientesFiltrados.length === 0) {
            tabela.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">Nenhum cliente encontrado com este CPF.</td></tr>';
        } else {
            clientesFiltrados.forEach(cliente => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.nome}</td>
                    <td>${cliente.cpf}</td>
                    <td>${cliente.email || '-'}</td>
                    <td>${cliente.telefone || '-'}</td>
                    <td>${cliente.endereco || '-'}</td>
                    <td>
                        <button class="btn-edit" onclick="editarCliente(${cliente.id}, '${escapeString(cliente.nome)}', '${cliente.cpf}', '${escapeString(cliente.email)}', '${escapeString(cliente.telefone)}', '${escapeString(cliente.endereco)}')">
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
        console.error('Erro ao pesquisar cliente:', error);
        alert('Erro ao pesquisar cliente.');
    }
}

// Função para listar todos os clientes
function listarClientes() {
    try {
        // Recarregar clientes do localStorage
        clientes = JSON.parse(localStorage.getItem('clientes')) || [];

        const tabela = document.getElementById('tabela-clientes');
        tabela.innerHTML = '';

        if (clientes.length === 0) {
            tabela.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">Nenhum cliente cadastrado.</td></tr>';
        } else {
            clientes.forEach(cliente => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.nome}</td>
                    <td>${cliente.cpf}</td>
                    <td>${cliente.email || '-'}</td>
                    <td>${cliente.telefone || '-'}</td>
                    <td>${cliente.endereco || '-'}</td>
                    <td>
                        <button class="btn-edit" onclick="editarCliente(${cliente.id}, '${escapeString(cliente.nome)}', '${cliente.cpf}', '${escapeString(cliente.email)}', '${escapeString(cliente.telefone)}', '${escapeString(cliente.endereco)}')">
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
        console.error('Erro ao listar clientes:', error);
        document.getElementById('tabela-clientes').innerHTML = 
            '<tr><td colspan="7" style="text-align: center; color: #666;">Erro ao carregar clientes.</td></tr>';
    }
}

// Função para escape seguro de strings
function escapeString(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'")
              .replace(/"/g, '\\"')
              .replace(/`/g, '\\`');
}

// Função para abrir o modal de edição
function editarCliente(id, nome, cpf, email, telefone, endereco) {
    clienteAtual = { id, nome, cpf, email, telefone, endereco };

    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nome').value = nome;
    document.getElementById('edit-cpf').value = cpf;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-telefone').value = telefone;
    document.getElementById('edit-endereco').value = endereco;

    document.getElementById('editModal').style.display = 'block';
}

// Função para fechar o modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    clienteAtual = null;
}

// Função para salvar as edições
function salvarEdicao() {
    if (!clienteAtual) return;

    try {
        const nome = document.getElementById('edit-nome').value.trim();
        const cpf = document.getElementById('edit-cpf').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const telefone = document.getElementById('edit-telefone').value.trim();
        const endereco = document.getElementById('edit-endereco').value.trim();

        // Validações
        if (!nome) {
            alert("Por favor, insira o nome do cliente!");
            return;
        }

        if (!cpf) {
            alert("Por favor, insira o CPF do cliente!");
            return;
        }

        // Verificar se CPF já existe (exceto para o cliente atual)
        const cpfExistente = clientes.find(cliente => 
            cliente.cpf === cpf && cliente.id !== clienteAtual.id
        );
        if (cpfExistente) {
            alert("Já existe outro cliente cadastrado com este CPF!");
            return;
        }

        const clienteAtualizado = {
            nome: nome,
            cpf: cpf,
            email: email,
            telefone: telefone,
            endereco: endereco
        };

        // Encontrar e atualizar o cliente
        const index = clientes.findIndex(c => c.id === clienteAtual.id);
        if (index !== -1) {
            clientes[index] = { ...clientes[index], ...clienteAtualizado };
            localStorage.setItem('clientes', JSON.stringify(clientes));

            alert('Cliente atualizado com sucesso!');
            closeEditModal();
            listarClientes(); // Recarrega a lista
        } else {
            alert('Erro: Cliente não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        alert('Erro ao atualizar cliente.');
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

// Permitir pesquisa ao pressionar Enter no campo de CPF
document.getElementById('pesquisa-cpf').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        pesquisarPorCPF();
    }
});

// Formatar CPF enquanto digita
document.getElementById('cpf').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d)/, '$1.$2')
                     .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    }
});

// Formatar telefone enquanto digita
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2')
                         .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            value = value.replace(/(\d{2})(\d)/, '($1) $2')
                         .replace(/(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
    }
});