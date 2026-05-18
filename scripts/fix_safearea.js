const fs = require('fs');
const path = require('path');

// Fix main dashboard SafeAreaView
const mainFile = path.join(__dirname, '..', 'app', '(tabs)', 'index.tsx');
let content = fs.readFileSync(mainFile, 'utf8');

// Replace SafeAreaView import from react-native with safe-area-context
content = content.replace(
  "    SafeAreaView,\n",
  ""
);
content = content.replace(
  "} from 'react-native';",
  "} from 'react-native';\nimport { SafeAreaView } from 'react-native-safe-area-context';"
);

fs.writeFileSync(mainFile, content, 'utf8');
console.log('Fixed main dashboard SafeAreaView import');
