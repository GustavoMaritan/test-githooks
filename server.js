const { spawn } = require('child_process');
const fs = require('fs');
const google = require('./google');
const rgxDescricao = /[0-9]{1,} ((problems|problem) \()[0-9]{1,} (errors|error), [0-9]{1,} ((warnings|warning)\))/g;
const rgxMessage = /[0-9]{1,}:[0-9]{1,}( ){1,}(error|errors)( ){2}/;
let yyy = false;

(async () => {
    let ls = spawn('npm', ['run', 'eslint'], {
        cwd: process.cwd(),
        detached: true,
        shell: true
    });

    ls.stdout.on('data', async (data) => {
        await execute(data);
    });

    ls.on('exit', (code) => {
        //if (!code) return console.log('Pré Commit OK');
    });
})();

process.on('uncaughtException', (err) => {
    // console.log(err);
    throw 'EXITAOSO 1';
});

process.on('unhandledRejection', (err) => {
    //console.log(err);
    throw 'EXITAOSO 2';
});

async function execute(data) {
    if (!rgxDescricao.test(data)) return true;

    let messages = `${data}`.split('\n');
    let descricao = messages.find(x => rgxDescricao.test(x));

    let error = {
        errors: +/[0-9]{1,} (errors|error)/.exec(descricao)[0].split(' ')[0],
        warnings: +/[0-9]{1,} (warnings|warning)/.exec(descricao)[0].split(' ')[0],
        files: []
    };

    let insert;
    for (let i = 0; i < messages.length; i++) {
        const x = messages[i];
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
        let trad = await google.traducao(texts.join(' ').trim());
        insert.messages.push({
            key: values[0].trim(),
            message: texts.join(' ').trim(),
            messageBr: trad[0][0][0],
            name: errorName.trim()
        });
    }

    if (!fs.existsSync('./logs'))
        fs.mkdirSync('./logs');
    let logName = `./logs/log-${new Date().getTime()}.json`;
    fs.writeFileSync(logName, JSON.stringify(error, undefined, 4));
    yyy = true;
}