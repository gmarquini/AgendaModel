require('dotenv').config(); //senhas
const express = require('express');
const app = express();
const mongoose = require('mongoose'); //Modela a base de dados (retorna uma Promise)

mongoose.connect(process.env.CONNECTIONSTRING)
    .then(() => {
        app.emit('pronto');
    })
    .catch(e => console.log(e));

const session = require('express-session'); // Gerenciar sessões de usuário no servidor.
const MongoStore = require('connect-mongo'); // Falar que as sessões são salvas em base de dados.
const flash = require('connect-flash'); // Mensagens auto-destrutivas. São salvas em sessão.
const routes = require('./routes'); //Rotas da aplicação.
const path = require('path'); //Trabalhar com caminhos.
const helmet = require('helmet'); // Segurança recomendada.
const csrf = require('csurf'); // Segurança por Tokiens
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware');

app.use(helmet());
app.use(express.urlencoded({ extended: true })); //Postar formulários para dentro da aplicação.
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public'))); //Todos os arquivos estáticos que vão ser acessados diretamente.

//Configurações de Sessão:
const sessionOptions = session({
    secret: 'kjhasdj jdksjkhdjqwe jkjqejj321412 jkk k1234 kl5325',
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
});
app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views')); //Arquivos renderizados na tela.
app.set('view engine', 'ejs'); //Engine usada para renderizar HTML podendo rodar JS dentro.

app.use(csrf());
//Nossos próprios middlewares
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

app.on('pronto', () => {
    app.listen(3000, () => {
        console.log('Acessar http://localhost:3000');
        console.log('servidor executando na porta 3000');
    });
});

