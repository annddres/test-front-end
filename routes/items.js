var express = require('express');
var request = require('request');
var router = express.Router();

// Proxy Api Items
var proxyItems = function (resource, callback) {
  var apiUrl = 'http://localhost:' + process.env.PORT + '/api/items';
  request(apiUrl + resource, function (err, res, body) {
    if (!err && res.statusCode == 200) {
        callback(JSON.parse(body));
    }
  });
}

// Resultados (Buscador)
router.post('/', (req, res) => {
  var text = req.body.txtBusqueda;
  proxyItems('?search=' + text, function(data) {
    data.title = 'Buscar: ' + text;
    res.render('items', data);
  });
});

// Resultados (URL)
router.get('/', (req, res) => {  
  var text = req.query.search;
  proxyItems('?search=' + text, function(data) {
    data.title = 'Buscar: ' + text;
    res.render('items', data);
  });
});

// Detalle
router.get('/:id', (req, res) => {
  var id = req.params.id;
  proxyItems('/' + id, function(data) {
    data.title = data.item.title;
    res.render('item', data);
  });
});

module.exports = router;