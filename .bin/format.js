const google = require('./google');
const fs = require('fs');
const path = require('path');

(async () => {
    //process.argv[2] = './logs/log-1542624976129.json';
    let dir = path.join(process.cwd(), process.argv[2]);
    let json = fs.readFileSync(dir, 'utf8');

    if (!json) return;

    json = JSON.parse(json);

    for (let i = 0; i < json.files.length; i++) {
        const file = json.files[i];

        for (let j = 0; j < file.messages.length; j++) {
            let item = file.messages[j];
            item.messageBr = await google.traducao(item.message);
            item.messageBr = item.messageBr[0][0][0];
        }
    }

    while (true) { }

    fs.writeFileSync(dir, JSON.stringify(json, undefined, 4));
})();
