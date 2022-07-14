const {Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
let client;


const init = () =>{
    client = new Client({
        puppeteer: {
            args: [
                '--no-sandbox'
            ],
        },
        authStrategy: new LocalAuth()
    });
    client.on('qr', (qr) => {
        qrcode.generate(qr, {small: true});
    });
    client.on('ready', () => {
        console.log('El Cliente esta listo!');
        listen();
    });
    client.initialize();
}

//Funcion que retorna la mension de todos los integrantes de un chat en especifico
const mention = async (chat, author) => {
    const obj = {
        text : '',
        mentions : [],
        isAdmin : false
    }
    for(let participant of chat.participants) {
        const contact = await client.getContactById(participant.id._serialized);
        obj.mentions.push(contact);
        obj.text += `@${participant.id.user} `;
        if(participant.id._serialized === author && participant.isAdmin){
            obj.isAdmin = true;
        }
    }
    return obj;
}

const listen = async () => {
    client.on('message_create', async msg => {
        const chat = await msg.getChat();
        const author = await msg.author;
        const body = msg.body.toLowerCase();

        if(/\B(\!todos)\b/gi.test(body)){
            if(chat.isGroup){
                const obj = await mention(chat, author);

                if(obj.isAdmin || msg._data.id.fromMe){
                    const text = obj.text;
                    const mentions = obj.mentions;
                    await msg.reply(text, undefined, {mentions: mentions})          
                }else{
                    msg.reply("usted no posee los permisos para ejecutar este comando");
                }
            }             
        }        
    });
}
init();




