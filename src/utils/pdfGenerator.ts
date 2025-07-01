import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SalesData, Commission, PaymentStatus, Salesperson } from '../types';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const addHeaderFooter = (doc: jsPDF, title: string) => {
    const pageCount = (doc as any).internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Header
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(title, pageWidth / 2, 22, { align: 'center' });
        doc.setFontSize(10);
        doc.text('CommTrack Inc.', 14, 22);
        
        // Footer
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.getHeight() - 10);
    }
};


export const generateInvoicePdf = (salesData: SalesData) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const today = new Date().toISOString().split('T')[0];

    const unpaidCommissions = salesData.commissionHistory.filter(c => c.status === PaymentStatus.Unpaid);

    doc.setFontSize(12);
    doc.text('Bill To:', 14, 40);
    doc.text(salesData.name, 14, 46);
    doc.text(salesData.email, 14, 52);

    doc.text(`Invoice #: INV-${Date.now()}`, 196, 40, { align: 'right' });
    doc.text(`Date: ${today}`, 196, 46, { align: 'right' });

    const tableColumn = ["Entry Date", "Revenue", "Commission Rate", "Amount"];
    const tableRows: (string|number)[][] = [];

    unpaidCommissions.forEach(c => {
        const commissionAmount = c.revenue * (c.commissionRate / 100);
        tableRows.push([c.entryDate, formatCurrency(c.revenue), `${c.commissionRate}%`, formatCurrency(commissionAmount)]);
    });

    const baseCommissionsSubtotal = unpaidCommissions.reduce((sum, c) => sum + (c.revenue * (c.commissionRate / 100)), 0);

    doc.autoTable({
        startY: 60,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });

    let finalY = (doc as any).lastAutoTable.finalY || 80;
    
    doc.setFontSize(10);
    doc.text(`Base Commissions Subtotal: ${formatCurrency(baseCommissionsSubtotal)}`, 196, finalY + 10, { align: 'right' });
    doc.text(`Rappel Bonus (Last 12mo): ${formatCurrency(salesData.rappelBonus)}`, 196, finalY + 16, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Due: ${formatCurrency(salesData.balance)}`, 196, finalY + 24, { align: 'right' });

    addHeaderFooter(doc, 'Commission Invoice');
    doc.save(`Invoice-${salesData.name.replace(' ', '_')}-${today}.pdf`);
};

export const generateReceiptPdf = (commission: Commission, salesperson: Salesperson) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const today = new Date().toISOString().split('T')[0];
    const commissionAmount = commission.revenue * (commission.commissionRate / 100);
    
    doc.setFontSize(12);
    doc.text('Paid To:', 14, 40);
    doc.text(salesperson.name, 14, 46);
    doc.text(salesperson.email, 14, 52);

    doc.text(`Receipt #: RCPT-${Date.now()}`, 196, 40, { align: 'right' });
    doc.text(`Payment Date: ${commission.paymentDate || today}`, 196, 46, { align: 'right' });
    
    doc.autoTable({
        startY: 60,
        head: [["Description", "Amount"]],
        body: [
            ['Commission for revenue of ' + formatCurrency(commission.revenue), formatCurrency(commissionAmount)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 160, 133] },
    });
    
    let finalY = (doc as any).lastAutoTable.finalY || 80;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Paid: ${formatCurrency(commissionAmount)}`, 196, finalY + 10, { align: 'right' });

    addHeaderFooter(doc, 'Payment Receipt');
    doc.save(`Receipt-${commission.id}-${today}.pdf`);
};