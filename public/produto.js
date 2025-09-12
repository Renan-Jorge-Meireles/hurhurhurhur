async function cadastrarProduto(event) {
    event.preventDefault();

    const produto = {
        nome: document.getElementById("nome").value,
        preco: parseFloat(document.getElementById("preco").value),
        descricao: document.getElementById("descricao").value,
        categoria: document.getElementById("categoria").value,
        quantidade_estoque: parseInt(document.getElementById("quantidade_estoque").value),
        fornecedor_id: parseInt(document.getElementById("fornecedoresSelecionado").value)
    };
    alert('fornecedor_id');

    try {
        const response = await fetch('/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produto)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Produto cadastrado com sucesso!");
            document.getElementById("produto-form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar produto.");
    }
}
function buscarFornededores() {
    // Preenche o dropdown com os fornecedores fixos
    const fornecedores = [
        {id: 1, nome: "Redragon"},
        {id: 2, nome: "JBL"},
        {id: 3, nome: "Amvox"},
        {id: 4, nome: "Aiwa"},
        {id: 5, nome: "LG"},
        {id: 6, nome: "Logitech"}
    ];

    const select = document.getElementById('fornecedoresSelecionado');

    // Limpa opções existentes (exceto a primeira)
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Adiciona os fornecedores
    fornecedores.forEach(fornecedor => {
        const option = document.createElement('option');
        option.value = fornecedor.id;
        option.textContent = fornecedor.nome;
        select.appendChild(option);
    });
}
async function listarProdutos() {
    try {
        const response = await fetch('/produtos');

        if (response.ok) {
            const produtos = await response.json();

            const tabela = document.getElementById('tabela-clientes');
            tabela.innerHTML = ''; // Limpa a tabela antes de preencher

            produtos.forEach(produto => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${produto.id}</td>
                    <td>${produto.nome}</td>
                    <td>${produto.preco.toFixed(2)}</td>
                    <td>${produto.quantidade_estoque}</td>
                `;
                tabela.appendChild(linha);
            });
        } else {
            alert('Erro ao listar produtos.');
        }
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        alert('Erro ao listar produtos.');
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

    if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});