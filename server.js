// Carrega as informações dos arquivos .json em variáveis globais
var config = require("./config/config.json");
var pedidos = require("./pedidos/pedidos.json");
var pedidos_debug = require("./pedidos/pedidos-debug.json");
var DEBUG = config.debug;
var DEBUGC = config.debug_console;
var DEBUGD = config.debug_data;

// Carrega bibliotecas
var net = require('net');
var fs = require('fs');
var os = require('os');

// Detecta quais endereços IP estão disponíveis no servidor
var net_interfaces = os.networkInterfaces();
var ip = [];
for(var i in net_interfaces) {
    for(var j in net_interfaces[i]) {
        var info = net_interfaces[i][j];
        if(info.family === "IPv4"){
            ip.push(info.address);
        }
    }
}

// End of Line - Determina o(s) caracter(es) de quebra de linha baseado no O.S. onde servidor rodará
//var eol = os.EOL;

// Abre comunicação TCP socket com novo cliente
net.createServer(function (socket) {
    socket.setEncoding("utf8");
    var address = socket.remoteAddress;

    // Remove formatação IPv6 forçada dos clientes Java
    if(socket.remoteFamily === 'IPv6'){
        address = address.replace(/.*:/g,''); // Utilizado Regular Expression
    }

    socket.name = address + "-" + socket.remotePort;
    console.log(socket.name + " conectado.");

    // Variáveis de controle
    var end = false;
    var count_test = 0;
    var isAvailable = true; // Controla se pedido está disponível
    var time_ini = 0;
    var time_fim = 0;
    var data_pedido = [];
    //----------------------------------

    // Funções auxiliares
    var envia = function(data){
        socket.write(data + "\n");
    }
    var cancela = function(){
        pedidos.pedido.push(data_pedido); // Pedido cancelado é devolvido ao repositório de pedidos disponíveis
        isAvailable = true;
        envia("cancelado");
    }
    //----------------------------------

    // Função responsável por manipular dados do cliente
    socket.on('data', function(data){
        data = data.replace(/\n|\r/g,''); // Remove \r ou \n da data (RegEx)
        if(DEBUGD) console.log(data);
        if(data == "pedido" && isAvailable){
            if(DEBUG){
                // Modo Debug - Força loop infinito na coleta de pedidos do arquivo pedidos/pedidos-debug.json
                data_pedido = pedidos_debug.pedido[count_test];
                count_test++;
                if(count_test >= pedidos_debug.pedido.length) count_test=0;
            }
            else{
                // Retira primeiro pedido do repositório de pedidos (fila)
                data_pedido = pedidos.pedido.splice(0, 1)[0];
            }
            if(data_pedido == undefined){
                envia("esgotado");
                socket.end();
                return;
            }

            envia(data_pedido[1]); // tipo
            envia(data_pedido[2]); // cor
            envia(data_pedido[3]); // qtd

            time_ini = Date.now();

            isAvailable = false;
        }
        else if(data == "cancela" && !isAvailable){
            cancela();
            return;
        }

        // Registra entrega de pedido, sendo informadas as máquinas alocadas durante produção do pedido.
        else if(data.toString().search("maquinas") !== -1 && !isAvailable){
            time_fim = Date.now();

            data = data.split("-");
            var mg = parseInt(data[1]);
            var mp = parseInt(data[2]);
            var mc = parseInt(data[3]);
            var mm = parseInt(data[4]);
            if(DEBUGC){
                console.log("\n");
                console.log("----------PEDIDO----------")
                console.log("Tipo: " + data_pedido[1]);
                console.log("Cor: " + data_pedido[2]);
                console.log("Qtd: " + data_pedido[3]);
                console.log("----------STATUS----------")
                console.log("MG: " + mg);
                console.log("MP: " + mp);
                console.log("MC: " + mc);
                console.log("MM: " + mm);
                console.log("Tempo: " + (time_fim-time_ini) + " ms");
                console.log("--------------------------")
                if(!DEBUG) console.log("Pedidos restantes: " + pedidos.pedido.length);
            }
            isAvailable = true;
            envia("ok");
            return;
        }
        else if(!isAvailable){
            envia("aguardando");
        }
        else envia("pedido");
    });

    socket.on('end', function(){
        if(end) return;
        end = true;
        if(!isAvailable) cancela();
        console.log(socket.name + " desconectado.");
    });

    socket.on('error', function(error){
        console.log("Socket error: " + error);
        socket.emit('end');
    });

}).listen(config.port);

process.on('uncaughtException', function(error) {
    console.log("Process error: " + error);
    console.log(error.stack);
});

console.log("Endereço(s) IP do servidor:" + ip);
console.log("Aplicação escutando na porta " + config.port + "\n");
