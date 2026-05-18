const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');

const startStr = "case 'logs': {";
const endStr = "case 'configuracoes': {";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) +
    `case 'logs': {
        return <LogsTab logs={logs} />;
      }
      
      ` + content.substring(endIndex);
      
  content = newContent;
  content = content.replace(
    "import { PagamentosTab } from '../components/tabs/PagamentosTab';",
    "import { PagamentosTab } from '../components/tabs/PagamentosTab';\nimport { LogsTab } from '../components/tabs/LogsTab';"
  );
  fs.writeFileSync('app/page.tsx', content, 'utf-8');
  console.log("Replaced successfully!");
} else {
  console.log("Failed to find indices!");
}
