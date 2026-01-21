import { useParams, Link } from 'react-router-dom';
import { useReceipt, useCustomerReceipts } from '@/hooks/useReceipts';
import { PrintReceipt } from '@/components/PrintReceipt';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Printer } from 'lucide-react';
import { useRef } from 'react';

export default function PrintReceiptPage() {
  const printRef = useRef<HTMLDivElement | null>(null);

  const { id } = useParams<{ id: string }>();
  const { data: receipt, isLoading: receiptLoading } = useReceipt(id);

  const { data: customerReceipts, isLoading: customerReceiptsLoading } =
    useCustomerReceipts(
      receipt?.customer_phone,
      receipt?.received_date
    );

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=900,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>A5 Receipt Print</title>
          <style>
            @page {
              size: A5 landscape;
              margin: 6mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: white;
            }

            .print-container {
              width: 100%;
              height: auto;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            table, th, td {
              border: 1px solid #000;
            }

            th, td {
              padding: 3px;
              font-size: 10.5px;
            }

            h1, h2, h3, p {
              margin: 2px 0;
            }

            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const isLoading = receiptLoading || customerReceiptsLoading;

  const receiptsToShow =
    customerReceipts && customerReceipts.length > 0
      ? customerReceipts
      : receipt
      ? [receipt]
      : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-96 max-w-2xl mx-auto" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Receipt not found</p>
          <Button variant="outline" asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Action Bar */}
      <div className="bg-card border-b border-border p-4 no-print">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to={`/receipt/${receipt.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Receipt
            </Link>
          </Button>

          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print A5
          </Button>
        </div>
      </div>

      {/* A5 Preview */}
      <div className="p-6 flex justify-center">
        <div
          ref={printRef}
          style={{
            width: '210mm',
            height: '148mm',
            background: 'white',
            padding: '6mm',
          }}
        >
          <PrintReceipt receipts={receiptsToShow} />
        </div>
      </div>
    </div>
  );
}
