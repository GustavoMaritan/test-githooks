const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const rgxDescricao = /[0-9]{1,} ((problems|problem) \()[0-9]{1,} (errors|error), [0-9]{1,} ((warnings|warning)\))/g;
const rgxMessage = /[0-9]{1,}:[0-9]{1,}( ){1,}(error|errors)( ){2}/;
let _logName = `./logs/log-${new Date().getTime()}.json`, error;
const colors = require('colors');
const config = { cwd: process.cwd(), detached: false, shell: true };

(() => {
    let ls = spawnSync('npm', ['run', 'eslint'], config);

    if (execute(ls.stdout.toString())) {
        spawnSync('git', ['add', '.'], config);
        return success();
    }

    config.cwd = path.join(process.cwd(), '.bin');
    spawnSync('node', ['format.js', _logName], config);

    throw ` 
${colors.red('Pré commit error...')}
${error.errors} erros encontrados, verifique ${colors.yellow(_logName)}
para mais informações.
    `;
})();

function success() {
    console.log(``);
    console.log(colors.green(`Pré commit ok...`));
    console.log(``);
}

function execute(data) {
    if (!rgxDescricao.test(data)) return true;

    let messages = `${data}`.split('\n');
    let descricao = messages.find(x => rgxDescricao.test(x));

    error = {
        errors: +/[0-9]{1,} (errors|error)/.exec(descricao)[0].split(' ')[0],
        warnings: +/[0-9]{1,} (warnings|warning)/.exec(descricao)[0].split(' ')[0],
        files: []
    };

    let insert;
    for (let i = 0; i < messages.length; i++) {
        const x = messages[i];

        if (x.includes('>')) continue;

        if (x.includes(process.cwd())) {
            insert = {
                filename: x.replace(process.cwd(), ''),
                messages: []
            };
            continue;
        }
        else if (!x) {
            if (insert)
                error.files.push(JSON.parse(JSON.stringify(insert)));
            insert = null;
            continue;
        }

        if (!insert || !rgxMessage.test(x)) continue;

        let values = x.split('error');
        let texts = values[1].trim().split(' ');
        let errorName = texts.pop();
        insert.messages.push({
            key: values[0].trim(),
            message: texts.join(' ').trim(),
            name: errorName.trim()
        });
    }

    if (!fs.existsSync('./logs')) fs.mkdirSync('./logs');
    fs.writeFileSync(_logName, JSON.stringify(error, undefined, 4));

    return false;
}