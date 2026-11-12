export function exportarParaCSV(dados, nomeArquivo) {
  if (!dados || dados.length === 0) {
    alert('Não há dados para exportar.');
    return;
  }

  const cabecalhos = Object.keys(dados[0]);
  const linhas = dados.map(linha => {
    return cabecalhos.map(campo => {
      let valor = linha[campo] === null || linha[campo] === undefined ? '' : linha[campo];
      valor = String(valor).replace(/"/g, '""');
      return `"${valor}"`;
    }).join(';');
  });

  const conteudo = [cabecalhos.join(';'), ...linhas].join('\n');
  const blob = new Blob(["\ufeff" + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${nomeArquivo}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}