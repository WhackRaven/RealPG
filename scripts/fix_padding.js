const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app', '(tabs)', 'social.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix social header paddingTop (SafeAreaView handles it now)
content = content.replace(/header: \{ paddingHorizontal: 20, paddingTop: 50,/g, 'header: { paddingHorizontal: 20, paddingTop: 12,');

// Fix main tab index header padding too
const mainFile = path.join(__dirname, '..', 'app', '(tabs)', 'index.tsx');
let mainContent = fs.readFileSync(mainFile, 'utf8');
mainContent = mainContent.replace(/paddingTop: 60, paddingBottom: 20/g, 'paddingTop: 12, paddingBottom: 16');
fs.writeFileSync(mainFile, mainContent, 'utf8');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed header paddings for consistent spacing');
