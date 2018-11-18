const google = require('./google');
const fs = require('fs');

(async () => {
    //process.argv[2] = './logs/log-1542582328167.json';
    let json = fs.readFileSync(process.argv[2], 'utf8');

    if (!json) return;

    json = JSON.parse(json);

    for (let i = 0; i < json.files.length; i++) {
        const file = json.files[i];

        for (let j = 0; j < file.messages.length; j++) {
            let item = file.messages[j];
            item.messageBr = await google.traducao(item.message);
            item.messageBr = item.messageBr[0][0][0];

            let _items = Object.keys(item);
            let $items = {};
            _items.sort().forEach(x => {
                $items[x] = item[x];
            });
            item = $items;
        }
    }
    fs.writeFileSync(process.argv[2], JSON.stringify(json, undefined, 4));
})();
