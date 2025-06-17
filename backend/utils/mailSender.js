const nodemail = require('nodemailer');

const transporter = nodemail.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // usar SSL
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS
    },
    tls: { rejectUnauthorized: false }
});

function sendEmail(destination, code) {

    const mailOption = {
        from: 'nexus.service.luminus@gmail.com',
        to: `${destination}`,
        subject: 'Codigo de verificação LUMINUS APP',
        text: `Codigo de recuperacao solicitado, insira: ${code}`
    }

    transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            console.log('erro ao enviar email: ', error)
        } else {
            console.log('email enviado com sucesso: ', info.response)
        }
    })
}

module.exports = {sendEmail}