# CC4641 - Servidor
Servidor de testes para aula CC4641 da universidade FEI.
### Request/Response
| Request   | Response |
|:--------------:|:--------|
|`pedido`|Responde Tipo, Cor e Quantidade se houver pedido disponível, se não, responde `esgotado`.|
|`cancela`|`cancelado`|
|`maquinas-mg-mp-mc-mm`|`ok`|
| `*` | Responde `aguardando` se o pedido já foi solicitado. Caso o pedido não foi solicitado, responde `pedido` se enviar qualquer solicitação que o servidor não reconheça.|

### Exemplos de solicitação

#### Solicitação de pedido e entrega de dados:

    Cliente : "pedido"
    Servidor: "2"
    Servidor: "p"
    Servidor: "10"
    Cliente : "maquinas-1-2-1-1"
    Servidor: "ok"

#### Solicitação de pedido e cancelamento de pedido:

    Cliente : "pedido"
    Servidor: "2"
    Servidor: "p"
    Servidor: "10"
    Cliente : "cancela"
    Servidor: "cancelado"

#### Solicitação de pedido 2x seguidas:

    Cliente : "pedido"
    Servidor: "2"
    Servidor: "p"
    Servidor: "10"
    Cliente : "pedido"
    Servidor: "aguardando"
    Cliente : "foo"
    Servidor: "aguardando"

#### Solicitação não reconhecida:

    Cliente : "foo"
    Servidor: "pedido"
    Cliente : "bar"
    Servidor: "pedido"
