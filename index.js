const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const albumRoutes = require('./routes/album.routes');
const fileUpload =  require('express-fileupload');
const port = 3000;

const flash = require('connect-flash');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/phototheque');

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(fileUpload());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

app.get('/', (req, res) => {

    res.redirect('album');
 
});

app.use('/',albumRoutes);

app.use((req, res) => {
    res.status(404).send("Erreur 404 Page non trouvée");
});
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500);
    res.send('Erreur interne du serveur');
});


app.listen(port, () => {
    console.log(`Server running at ${port}`);
});