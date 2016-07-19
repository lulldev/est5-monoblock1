// todo to jquery
var LoadTemplate = function(element, template, data){
    this.el = $(element);
    // Store template name and data.
    this.tempName = template;
    this.data = data || null;

    // You can change this to path of your template folder.
    this.folderPath = 'templates/';
};

/**
 * Отрисовка шаблона
 * @param reset (bool) - true - очистить селектор, в который помещается шаблон. false - append в шаблон
 * @param callback
 */
LoadTemplate.prototype.create = function(reset, callback){
    var req = new XMLHttpRequest();
    var that = this;

    // Define parameters for request.
    req.open('get', this.folderPath + this.tempName + '.hbs', true);

    if (reset == undefined) {
        reset = false;
    }
    // Wait for request to complete.
    req.onreadystatechange = function(){
        if (req.readyState == 4 && req.status == 200){
            //Compile HB template, add data (if defined) and place in parent element.
            var compiled = Handlebars.compile($(req.response).html());
            if (reset) {
                that.el.empty();
            }
            that.el.append(compiled(that.data));
            // Execute callback function
            if (callback !== undefined) {
                callback();
            }
        }
    };
    // Send request.
    req.send();
};

LoadTemplate.prototype.createAndWait = function(callback){
    var req = new XMLHttpRequest();
    var that = this;

    // Define parameters for request.
    req.open('get', this.folderPath + this.tempName + '.handlebars', true);

    // Wait for request to complete.
    req.onreadystatechange = function(){
        if (req.readyState == 4 && req.status == 200){
            //Compile HB template, but wait..
            var compiled = Handlebars.compile(req.response);

            // Execute callback function and parse variables.
            callback(compiled, that.el);
        }
    };

    // Send request.
    req.send();
};