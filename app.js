let projetos = JSON.parse(localStorage.getItem('projetos')) || [];
let ordens = JSON.parse(localStorage.getItem('ordens')) || [];

atualizarProjetosSelect();
atualizarLista();

document.getElementById('formProjeto').addEventListener('submit', function (e) {
  e.preventDefault();

  const nome = document.getElementById('nomeProjeto').value;
  const inicio = document.getElementById('dataInicio').value;
  const fim = document.getElementById('dataFim').value;

  const projeto = { id: Date.now(), nome, inicio, fim };
  projetos.push(projeto);

  salvarProjetos();          
  atualizarProjetosSelect(); 
  this.reset();
});

document.getElementById('formOrdem').addEventListener('submit', function (e) {
  e.preventDefault();

  const projetoId = document.getElementById('projetoSelect').value;
  const projeto = projetos.find(p => p.id == projetoId);

  if (!projeto) {
    alert('Selecione um projeto válido!');
    return;
  }

  const prestador = document.getElementById('prestador').value;
  const gestor = document.getElementById('gestor').value;
  const dataHora = document.getElementById('dataHora').value;
  const atividade = document.getElementById('atividade').value;
  const observacao = document.getElementById('observacao').value;
  const duracao = document.getElementById('duracao').value;
  const valor = document.getElementById('valor').value;

  const ordem = {
    projeto: projeto.nome,
    prestador,
    gestor,
    dataHora,
    atividade,
    observacao,
    duracao,
    valor,
    status: "Pendente"
  };

  ordens.push(ordem);
  salvarOrdens();  
  atualizarLista();
  this.reset();
});

function salvarProjetos() {
  localStorage.setItem('projetos', JSON.stringify(projetos));
}

projetos.push(projeto);
salvarProjetos();

function salvarOrdens() {
  localStorage.setItem('ordens', JSON.stringify(ordens));
}

function formatarDataHoraBrasileira(dataHoraInput) {
  const data = new Date(dataHoraInput);
  const opcoes = {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  return data.toLocaleString('pt-BR', opcoes);
}

function atualizarProjetosSelect() {
  const select = document.getElementById('projetoSelect');
  select.innerHTML = '<option value="" disabled selected>Selecione um projeto</option>';
  projetos.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.nome;
    select.appendChild(option);
  });
}

function atualizarLista() {
  const tbody = document.getElementById('listaOrdens');
  tbody.innerHTML = '';

  ordens.forEach((ordem, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ordem.projeto}</td>
      <td>${ordem.prestador}</td>
      <td>${ordem.gestor}</td>
      <td>${formatarDataHoraBrasileira(ordem.dataHora)}</td>
      <td>${ordem.atividade}</td>
      <td>${ordem.observacao}</td>
      <td>${ordem.duracao}</td>
      <td>${ordem.valor}</td>
      <strong>${ordem.status}</strong><br>
      ${ordem.status === 'Pendente' ? `
        <button onclick="aprovarOrdem(${index})">Aprovar</button>
        <button onclick="reprovarOrdem(${index})">Reprovar</button>
      ` : ''}
    </td>
    `;
    tbody.appendChild(tr);
  });
}

function removerOrdem(index) {
  ordens.splice(index, 1);
  salvarOrdens();
  atualizarLista();
}

function aprovarOrdem(index) {
  if (confirm("Deseja aprovar esta ordem?")) {
    ordens[index].status = "Aprovado";
    salvarOrdens();
    atualizarLista();
  }
}

function reprovarOrdem(index) {
  if (confirm("Deseja reprovar esta ordem?")) {
    ordens[index].status = "Reprovado";
    salvarOrdens();
    atualizarLista();
  }
}

function limparOrdens() {
  if (confirm("Tem certeza que deseja apagar TODAS as ordens de serviço?")) {
    ordens = [];
    salvarOrdens();
    atualizarLista();
  }
}

function gerarRelatorio() {
  const aprovadas = ordens.filter(o => o.status === 'Aprovado');

  if (aprovadas.length === 0) {
    document.getElementById('resultadoRelatorio').innerHTML = "<p>Nenhuma ordem aprovada encontrada.</p>";
    return;
  }

  let totalHoras = 0;
  let totalValor = 0;

  function converterHoraParaDecimal(horaStr) {
    const [h, m] = horaStr.split(':').map(Number);
    return h + m / 60;
  }

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Projeto</th>
        <th>Prestador</th>
        <th>Data/Hora</th>
        <th>Atividade</th>
        <th>Duração (h)</th>
        <th>Valor (R$)</th>
      </tr>
    </thead>
    <tbody>
      ${aprovadas.map(o => {
        const horas = converterHoraParaDecimal(o.duracao);
        const valor = parseFloat(o.valor);

        totalHoras += horas;
        totalValor += valor;

        return `
          <tr>
            <td>${o.projeto}</td>
            <td>${o.prestador}</td>
            <td>${formatarDataHoraBrasileira(o.dataHora)}</td>
            <td>${o.atividade}</td>
            <td>${horas.toFixed(2)}</td>
            <td>R$ ${valor.toFixed(2)}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4"><strong>Total</strong></td>
        <td><strong>${totalHoras.toFixed(2)} h</strong></td>
        <td><strong>R$ ${totalValor.toFixed(2)}</strong></td>
      </tr>
    </tfoot>
  `;

  const resultadoDiv = document.getElementById('resultadoRelatorio');
  resultadoDiv.innerHTML = '';
  resultadoDiv.appendChild(table);
}


