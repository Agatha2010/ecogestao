import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportarParaPDF(titulo, colunas, dados, nomeArquivo) {
  if (!dados || dados.length === 0) {
    alert('Não há dados para exportar.');
    return;
  }

  const doc = new jsPDF();

  // Cabeçalho verde
  doc.setFillColor(30, 86, 49);
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EcoGestão', 14, 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gestão Ambiental', 14, 21);
  
  const dataGeracao = new Date().toLocaleString('pt-BR');
  doc.setFontSize(8);
  doc.text(`Gerado em: ${dataGeracao}`, 196, 21, { align: 'right' });

  // Título da página
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, 14, 38);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Total de registros: ${dados.length}`, 14, 44);

  // Tabela
  autoTable(doc, {
    startY: 50,
    head: [colunas],
    body: dados,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 86, 49],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      cellPadding: 4,
      overflow: 'linebreak'
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${doc.internal.getCurrentPageInfo().pageNumber} de ${pageCount}`,
        196, 
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      doc.text('EcoGestão - Sistema de Gestão Ambiental', 14, doc.internal.pageSize.height - 10);
    }
  });

  doc.save(`${nomeArquivo}.pdf`);
}