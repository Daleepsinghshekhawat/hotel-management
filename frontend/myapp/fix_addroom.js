const fs = require('fs');
const file = 'src/Admin/AddRoom.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports and hooks
content = content.replace(
    'import { useLocation } from "react-router-dom";',
    'import { useLocation } from "react-router-dom";\nimport { useTheme } from "../context/ThemeContext";'
);

content = content.replace(
    'const AddRoom = () => {\n    const location = useLocation();',
    'const AddRoom = () => {\n    const { theme } = useTheme();\n    const isDark = theme === "dark";\n    const styles = getStyles(isDark);\n    const location = useLocation();'
);

// 2. Update styles object to getStyles function
content = content.replace(
    'const styles = {',
    'const getStyles = (isDark) => ({'
);

content = content.replace(
    /background: "#ffffff",\s+borderRadius: "16px",/g,
    'background: isDark ? "#1e293b" : "#ffffff",\n        borderRadius: "16px",'
);

content = content.replace(
    /border: "1px solid #e2e8f0",\s+fontFamily:/g,
    'border: 1px solid , \n        fontFamily:'
);

content = content.replace(
    /background: "#f8fafc",\s+borderRadius: "12px",\s+border: "1px solid #e2e8f0",/g,
    'background: isDark ? "#0f172a" : "#f8fafc",\n        borderRadius: "12px",\n        border: 1px solid , '
);

content = content.replace(
    /border: "1px solid #cbd5e1",\s+borderRadius: "8px",\s+fontSize: "14px",\s+color: "#1e293b",\s+backgroundColor: "#f8fafc",/g,
    'border: 1px solid , \n        borderRadius: "8px",\n        fontSize: "14px",\n        color: isDark ? "#f1f5f9" : "#1e293b",\n        backgroundColor: isDark ? "#0f172a" : "#f8fafc", '
);

content = content.replace(
    '};\n\nexport default AddRoom;',
    '});\n\nexport default AddRoom;'
);

// 3. Regex replacements for the style block
content = content.replace(/color: #0f172a;/g, "color: \\;");
content = content.replace(/border-bottom: 2px solid #f1f5f9;/g, "border-bottom: 2px solid \\;");
content = content.replace(/color: #1e293b;/g, "color: \\;");
content = content.replace(/background: #e2e8f0;/g, "background: \\;");
content = content.replace(/color: #475569;/g, "color: \\;");
content = content.replace(/background-color: #ffffff !important;/g, "background-color: \\ !important;");
content = content.replace(/color: #334155;/g, "color: \\;");
content = content.replace(/background: #ffffff;/g, "background: \\;");
content = content.replace(/border: 1px solid #e2e8f0;/g, "border: 1px solid \\;");
content = content.replace(/border-color: #cbd5e1;/g, "border-color: \\;");
content = content.replace(/background: #f8fafc;/g, "background: \\;");
content = content.replace(/border: 2px dashed #cbd5e1;/g, "border: 2px dashed \\;");
content = content.replace(/color: #64748b;/g, "color: \\;");
content = content.replace(/background: #f1f5f9;/g, "background: \\;");

fs.writeFileSync(file, content);
console.log('Done!');
