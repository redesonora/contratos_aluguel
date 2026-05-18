const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

const startStr = "case 'contratos': {";
const endStr = "case 'pagamentos': {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) +
    `case 'contratos': {
        return (
          <ContratosTab
            contratos={contratos}
            pagamentos={pagamentos}
            can={can}
            handleSendEmailNotification={handleSendEmailNotification}
            handleFinishContract={handleFinishContract}
            handleToggleArchive={handleToggleArchive}
            setSelectedContractForFinance={setSelectedContractForFinance}
            setFinanceModalOpen={setFinanceModalOpen}
            selectedTemplateIdx={selectedTemplateIdx}
            contractTemplates={contractTemplates}
          />
        );
      }
      
      ` + content.substring(endIndex);
      
  content = newContent;
  content = content.replace(
    "import { InquilinosTab } from '../components/tabs/InquilinosTab';",
    "import { InquilinosTab } from '../components/tabs/InquilinosTab';\nimport { ContratosTab } from '../components/tabs/ContratosTab';"
  );
  fs.writeFileSync('app/page.tsx', content, 'utf-8');
  console.log("Replaced successfully!");
} else {
  console.log("Failed to find indices!");
}
