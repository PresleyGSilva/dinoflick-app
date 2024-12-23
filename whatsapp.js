const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');

let client;
let responses = []; // Armazena as mensagens configuradas

exports.startClient = (mainWindow) => {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: true },
    });

    // Carrega mensagens configuradas de um arquivo JSON
    const loadResponses = () => {
        const configPath = path.join(__dirname, 'config.json');
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            responses = JSON.parse(configData).responses || [];
        } else {
            console.error('Arquivo config.json não encontrado.');
        }
    };

    loadResponses();

    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
        mainWindow.webContents.send('qr-code', qr);
    });

    client.on('ready', () => {
        console.log('WhatsApp está pronto!');
        mainWindow.webContents.send('status', 'Conectado');
    });

    client.on('message', (msg) => {
        console.log(`Mensagem recebida: ${msg.body}`); // Log para debug

        const normalizedMessage = msg.body.toLowerCase().trim();

        responses.forEach((response) => {
            const normalizedTrigger = response.trigger.toLowerCase().trim();

            if (normalizedMessage.includes(normalizedTrigger)) {
                console.log(`Gatilho encontrado: ${response.trigger}`); // Log do gatilho correspondente

                if (response.type === 'text') {
                    msg.reply(response.message); // Responde com o texto associado
                }
                // Caso precise adicionar suporte a áudios ou outros tipos, pode ser expandido aqui
            }
        });
    });

    client.initialize();
};
