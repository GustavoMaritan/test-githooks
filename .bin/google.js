const download = require('download');

async function traducao(sourceText) {
  let text = await download(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en-US&tl=pt-br&dt=t&q=${encodeURI(sourceText)}`);//" + 
  text = text.toString();
  return text ? JSON.parse(text) : null;
}

module.exports = {
  traducao
};
