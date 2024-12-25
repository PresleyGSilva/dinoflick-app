const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
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
        // Gera o QR Code em base64
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Erro ao gerar o QR Code:', err);
                return;
            }

            console.log('QR Code gerado com sucesso!');
            console.log(url); // Veja a URL base64 gerada para o QR Code

            // Envia o QR Code base64 para o frontend
            mainWindow.webContents.send('qr-code', url);
        });
    });

    client.on('ready', () => {
        console.log('WhatsApp está pronto!');
        mainWindow.webContents.send('status', 'Conectado'); // Envia status para o frontend
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
                } else if (response.type === 'audio') {
                    // Caminho completo do arquivo de áudio
                    const audioPath = path.join(__dirname, 'audios', response.fileName);

                    // Verifica se o arquivo de áudio existe
                    if (fs.existsSync(audioPath)) {
                        // Cria o objeto de mídia para enviar
                        const audio = MessageMedia.fromFilePath(audioPath);

                        // Envia o áudio
                        client.sendMessage(msg.from, audio).then(() => {
                            console.log('Áudio enviado com sucesso!');
                        }).catch((err) => {
                            console.error('Erro ao enviar áudio:', err);
                        });
                    } else {
                        console.error(`Arquivo de áudio não encontrado: ${audioPath}`);
                        msg.reply('Desculpe, o arquivo de áudio não está disponível.');
                    }
                }
            }
        });
    });

    client.initialize();
};
