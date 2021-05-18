var express = require('express');
var request = require('request');
var router = express.Router();

var author = { name: "Andres", lastname: "Jimenez" }; // Firma

// Metodo parte decimal de un numero
Number.prototype.decimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1] * 1 || 0;
}

// Proxy Api MercadoLibre
var proxyML = function (resource, callback) {
    var apiUrl = "https://api.mercadolibre.com";
    request(apiUrl + resource, function (err, res, body) {
      if (!err && res.statusCode == 200) {
          callback(JSON.parse(body));
      }
    });
}

// Endpoint Busqueda Productos
router.get('/', (req, res) => {
    
    var text = req.query.search;
    proxyML("/sites/MLA/search?q=" + text, function(results) {

        // Cambio de Formato (Solo 4 Productos)
        var items = [];
        var l = (results.paging.total > 4) ? 4 : results.paging.total;
        for(var n = 0; n < l; n++) {
            var result = results.results[n];
            items.push({
                id: result.id,
                title: result.title,
                price: {
                    currency: result.currency_id,
                    amount: result.price,
                    decimals: result.price.decimals()
                },
                picture: result.thumbnail,
                condition: result.condition,
                free_shipping: result.shipping.free_shipping,
                location: result.address.state_name
            });
        };

        // Lista de Categorias
        var cv = results.available_filters.find(f => f.id="category").values;
        var categories = cv.map(v => v.name);
        
        // Categoria con mayor resultados
        var max = Math.max.apply(Math, cv.map(function(v) { return v.results; }));
        var category = cv.find(v => v.results=max).name;

        // Respuesta
        res.send({
            author: author,
            categories: categories,
            items: items,
            category: category
        });

    });

  });

// Endpoint Detalle Producto
router.get('/:id', (req, res) => {
   
    var id = req.params.id;
    proxyML("/items/" + id, function(result) {
        proxyML("/items/" + id + "/description", function(description) {
            proxyML("/categories/" + result.category_id, function(category) {

                // Cambio de Formato
                var item = {
                    id: result.id,
                    title: result.title,
                    price: {
                        currency: result.currency_id,
                        amount: result.price,
                        decimals: result.price.decimals()
                    },
                    picture: result.thumbnail,
                    condition: result.condition,
                    free_shipping: result.shipping.free_shipping,
                    sold_quantity: result.sold_quantity,
                    description: description.plain_text
                }

                // Respuesta
                res.send({
                    author: author,
                    item: item,
                    category: category.name
                });

            });
        });
    });

 });
 
 module.exports = router;