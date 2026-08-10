const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'Admin');
const filesToUpdate = [
  'Hotels.jsx',
  'ActiveBookings.jsx',
  'BookingHistory.jsx',
  'AdminUsersAndOwners.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has useOutletContext
  if (content.includes('useOutletContext')) {
    console.log(`Skipping ${file}`);
    return;
  }

  // 1. Add import
  if (content.includes('react-router-dom')) {
    content = content.replace('import { useNavigate } from "react-router-dom";', 'import { useNavigate, useOutletContext } from "react-router-dom";');
    content = content.replace('import { Link } from "react-router-dom";', 'import { Link, useOutletContext } from "react-router-dom";');
  } else {
    // just add it below react
    content = content.replace('import React', 'import { useOutletContext } from "react-router-dom";\nimport React');
  }

  // 2. Add isDark inside component
  const componentMatch = content.match(/export default function \w+\(\) \{|const \w+ = \(\) => \{/);
  if (componentMatch) {
    const componentStr = componentMatch[0];
    content = content.replace(
      componentStr,
      `${componentStr}\n  const { theme } = useOutletContext() || { theme: "light" };\n  const isDark = theme !== "dark";`
    );
  }

  // 3. Replace background: "#fff" and background: "#ffffff"
  content = content.replace(/background:\s*["']#fff["']/g, 'background: isDark ? "#ffffff" : "#1e293b"');
  content = content.replace(/background:\s*["']#ffffff["']/g, 'background: isDark ? "#ffffff" : "#1e293b"');
  
  // 4. Replace text color "#0f172a" or "#000" to be responsive
  content = content.replace(/color:\s*["']#0f172a["']/g, 'color: isDark ? "#0f172a" : "#f8fafc"');
  content = content.replace(/color:\s*["']#334155["']/g, 'color: isDark ? "#334155" : "#f1f5f9"');
  content = content.replace(/color:\s*["']#64748b["']/g, 'color: isDark ? "#64748b" : "#94a3b8"');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
