import { Users } from "./types";

function generateBackupName() {
  return `networkify-${new Date().toISOString()}.json`;
}

export function exportData(data: { users: Users }) {
  const blob = new Blob([JSON.stringify(data)], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `networkify-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export const loadFromExport = new Promise((resolve, reject) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data.users);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsText(file);
  };
  input.click();
});
