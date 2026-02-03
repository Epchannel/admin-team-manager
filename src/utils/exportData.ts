import { AdminAccount } from '@/types/admin';

export function exportToCSV(accounts: AdminAccount[], type: 'admins' | 'users') {
  let csvContent = '';
  let filename = '';

  if (type === 'admins') {
    filename = 'admin_accounts.csv';
    csvContent = 'ID,Name,Email,Team Name,Status,Members Count,Created At\n';
    
    accounts.forEach(acc => {
      csvContent += `"${acc.id}","${acc.name}","${acc.email}","${acc.teamName}","${acc.status}",${acc.members.length},"${acc.createdAt}"\n`;
    });
  } else {
    filename = 'all_users.csv';
    csvContent = 'ID,Name,Email,Role,Admin,Admin Email,Team,Join Date\n';
    
    accounts.forEach(acc => {
      acc.members.forEach(member => {
        csvContent += `"${member.id}","${member.name}","${member.email}","${member.role}","${acc.name}","${acc.email}","${acc.teamName}","${member.addedAt}"\n`;
      });
    });
  }

  downloadFile(csvContent, filename, 'text/csv');
}

export function exportToJSON(accounts: AdminAccount[]) {
  const jsonContent = JSON.stringify(accounts, null, 2);
  downloadFile(jsonContent, 'admin_accounts.json', 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
