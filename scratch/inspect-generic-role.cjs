const fs = require('fs');
const content = fs.readFileSync('tulja-motors/lib/components/RoleDashboardClient.tsx', 'utf8');

const lines = content.split('\n');
console.log(lines.slice(1850, 1950).join('\n'));

