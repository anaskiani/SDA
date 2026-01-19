// Script to add main.js to all EJS views
// This ensures consistent JavaScript loading across all pages

const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '..', 'views');

function addScriptToFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if script already exists
    if (content.includes('/js/main.js')) {
        return false;
    }
    
    // Add script before closing </head> tag
    if (content.includes('</head>')) {
        content = content.replace('</head>', '    <script src="/js/main.js" defer></script>\n</head>');
        
        // Add flash message divs after <body> tag
        if (content.includes('<body>')) {
            const flashMessages = `    <% if (success) { %>
    <div data-success="<%= success %>" style="display: none;"></div>
    <% } %>
    <% if (error) { %>
    <div data-error="<%= error %>" style="display: none;"></div>
    <% } %>
`;
            content = content.replace('<body>', '<body>\n' + flashMessages);
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    
    return false;
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.ejs')) {
            const updated = addScriptToFile(filePath);
            if (updated) {
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

console.log('Adding main.js script to all EJS views...');
processDirectory(viewsDir);
console.log('Done!');
