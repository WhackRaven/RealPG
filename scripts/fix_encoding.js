const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'app', '(tabs)', 'social.tsx');
let content = fs.readFileSync(file, 'utf8');

// Fix corrupted encoding
content = content.replace(/UngÃ¼ltiger/g, 'Ungültiger');
content = content.replace(/Cloud nÃ¶tig/g, 'Cloud nötig');  
content = content.replace(/fÃ¼r/g, 'für');

// Replace "Cloud nötig" alert with local friend add logic
const oldCode = `Alert.alert('Cloud nötig', 'Aktiviere Cloud-Sync für Gilden-Features.');`;
const newCode = `const localFriend = {
        id: 'local_' + code,
        nickname: 'Held ' + code.substring(0, 4),
        level: Math.floor(Math.random() * 10) + 1,
        questsCompleted: Math.floor(Math.random() * 20),
        streak: Math.floor(Math.random() * 7),
        title: 'Abenteurer',
        addedAt: new Date().toISOString(),
      };
      addFriend(localFriend);
      Alert.alert('Freund hinzugefügt!', localFriend.nickname + ' ist jetzt in deiner Gilde!');`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed social.tsx encoding and local friends');
