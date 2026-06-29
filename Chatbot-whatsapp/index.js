const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');

const client = new Client({
    authStrategy: new LocalAuth()
});

// O SEU número para onde o bot vai mandar as notificações de respostas
const NUMERO_PARA_AVISOS = '5527988995395@c.us'; 

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code acima.');
});

client.on('ready', () => {
    console.log('Bot da Mara Pimenta Nails ONLINE!');
});

// --- BASE DE DADOS LIMPA (Apenas o teste real) ---
const agenda = [
    // Se a mensagem não chegar, apague o primeiro '9' depois do 27.
    { nome: 'Mãe (Teste)', telefone: '5527997069670@c.us', diaSemana: 2 } 
];

// --- FUNÇÃO PARA ENVIAR LEMBRETES COM PROTEÇÃO ---
function enviarLembretesAmanha() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const diaSemanaAmanha = amanha.getDay();

    console.log(`Verificando clientes para o dia da semana: ${diaSemanaAmanha}`);

    const clientesDeAmanha = agenda.filter(c => c.diaSemana === diaSemanaAmanha);

    if (clientesDeAmanha.length === 0) {
        console.log("Nenhuma cliente agendada para amanhã.");
        return;
    }

    clientesDeAmanha.forEach(cliente => {
        const msg = `Olá, ${cliente.nome}! Aqui é da Mara Pimenta Nails. ✨\nPassando para confirmar seu horário de amanhã. Qual esmalte você está pensando em usar? Assim já separo o material aqui! 💅`;
        
        // A trava de segurança: se der erro num número, ele apenas avisa e continua.
        client.sendMessage(cliente.telefone, msg)
            .then(() => {
                console.log(`✅ Sucesso! Lembrete enviado para: ${cliente.nome}`);
            })
            .catch(erro => {
                console.log(`❌ Falha ao enviar para ${cliente.nome}. O número não existe no banco do WhatsApp.`);
            });
    });
}

// AGENDAMENTO: Roda todo dia às 20:00
cron.schedule('00 20 * * *', () => {
    enviarLembretesAmanha();
});

// --- LÓGICA DE RESPOSTA ---
client.on('message', async (msg) => {
    const chat = await msg.getChat();
    
    if (!msg.fromMe && !chat.isGroup) {
        const contato = await msg.getContact();
        const nomeContato = contato.pushname || 'Cliente';
        
        const avisoParaMae = `📢 *RESPOSTA DE CLIENTE*\n\nA cliente *${nomeContato}* respondeu:\n"${msg.body}"`;
        
        client.sendMessage(NUMERO_PARA_AVISOS, avisoParaMae);
    }
});

client.initialize();
