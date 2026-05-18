const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

const startStr = "case 'pagamentos': {";
const endStr = "case 'usuarios': {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) +
    `case 'pagamentos': {
        return (
          <PagamentosTab
            pagamentos={pagamentos}
            paymentSearch={paymentSearch}
            setPaymentSearch={setPaymentSearch}
            paymentStatusFilter={paymentStatusFilter}
            setPaymentStatusFilter={setPaymentStatusFilter}
            paymentMonthFilter={paymentMonthFilter}
            setPaymentMonthFilter={setPaymentMonthFilter}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            formatarMoeda={formatarMoeda}
            StatusPagamento={StatusPagamento}
            handleSendEmailNotification={handleSendEmailNotification}
            openReceiptModal={openReceiptModal}
          />
        );
      }
      
      ` + content.substring(endIndex);
      
  content = newContent;
  content = content.replace(
    "import { ContratosTab } from '../components/tabs/ContratosTab';",
    "import { ContratosTab } from '../components/tabs/ContratosTab';\nimport { PagamentosTab } from '../components/tabs/PagamentosTab';"
  );
  fs.writeFileSync('app/page.tsx', content, 'utf-8');
  console.log("Replaced successfully!");
} else {
  console.log("Failed to find indices!");
}
