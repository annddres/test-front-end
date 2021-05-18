const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'pug'); // Template engine
app.use(express.urlencoded({ extended: true })); // Middleware (form data post)
app.use(express.static(path.join(__dirname, 'public'))); // Static content

// Routes
var searchRouter = require('./routes/search');
var itemsRouter = require('./routes/items');
var apiItemsRouter = require('./api/items');

app.use('/', searchRouter); // Buscador
app.use('/items', itemsRouter); // Pagina resultados/detalle
app.use('/api/items', apiItemsRouter); // Endpoints (API)

process.env.PORT = 8000;
app.listen(process.env.PORT, () => { console.log('App listening!'); });

module.exports = app;