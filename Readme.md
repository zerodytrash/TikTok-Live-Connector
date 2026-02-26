
zerodytrash
/
TikTok-Live-Conector
Público
Biblioteca Node.js para recibir eventos de transmisión en vivo (comentarios, regalos, etc.) en tiempo real desde TikTok LIVE.

discord.gg/uthtmvdpy8
Licencia
 licencia MIT
 405 estrellas 103 tenedores 
Código
Asuntos
18
Solicitudes de extracción
Comportamiento
Proyectos
Seguridad
Perspectivas
zerodytrash/TikTok-Live-Conector
Última confirmación
@zerodytrash
zerodytrash
…
el 22 oct 2022
Estadísticas de Git
archivos
LÉAME.md
TikTok-Live-Conector
Una biblioteca de Node.js para recibir eventos de transmisión en vivo, como comentarios y obsequios en tiempo real desde TikTok LIVE al conectarse al servicio interno de transmisión WebCast de TikTok. El paquete incluye un contenedor que se conecta al servicio WebCast usando solo el nombre de usuario ( uniqueId). Esto le permite conectarse a su propio chat en vivo, así como al chat en vivo de otros transmisores. No se requieren credenciales. Además de los comentarios de chat , otros eventos como miembros que se unen , obsequios , suscripciones , espectadores , seguidores , acciones compartidas , preguntas , me gusta y batallas .puede ser rastreado. También puede enviar mensajes automáticos al chat proporcionando su ID de sesión.

Proyecto de ejemplo: https://tiktok-chat-reader.zerody.one/
¿Prefieres otros lenguajes de programación?

Reescritura de Python : TikTokLive por @isaackogan
Ve a reescribir: GoTikTokLive por @Davincible
Reescritura de C# : TikTokLiveSharp por @sebheron
NOTA: Esta no es una API oficial. Es un proyecto de ingeniería inversa.

NOTA: Esta biblioteca JavaScript está diseñada para usarse en entornos Node.js. Si desea procesar o mostrar los datos en el navegador (del lado del cliente), debe transferir los datos del entorno Node.js al navegador. Un buen enfoque para esto es usar Socket.IO o un marco de comunicación de baja latencia diferente. Puede encontrar un proyecto de ejemplo completo aquí: TikTok-Chat-Reader

ACTUALIZACIÓN :
debido a un cambio por parte de TikTok, las versiones anteriores a la v0.9.23 ya no son funcionales. Si está utilizando una de estas versiones, actualice a la última versión con el npm updatecomando.

Descripción general
Empezando
Parámetros y opciones
Métodos
Eventos
Ejemplos
contribuyendo
Empezando
Instale el paquete a través de NPM
npm i tiktok-live-connector
Crea tu primera conexión de chat
const { WebcastPushConnection } = require('tiktok-live-connector');

// Username of someone who is currently live
let tiktokUsername = "officialgeilegisela";

// Create a new wrapper object and pass the username
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
})

// Define the events that you want to handle
// In this case we listen to chat messages (comments)
tiktokLiveConnection.on('chat', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

// And here we receive gifts sent to the streamer
tiktokLiveConnection.on('gift', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
})

// ...and more events described in the documentation below
Parámetros y opciones
Para crear un nuevo WebcastPushConnectionobjeto se requieren los siguientes parámetros.

WebcastPushConnection(uniqueId, [options])

Nombre del parámetro	Requerido	Descripción
Identificación única	Sí	El nombre de usuario único de la emisora. Puede encontrar este nombre en la URL.
Ejemplo: https://www.tiktok.com/@officialgeilegisela/live=>officialgeilegisela
opciones	No	Aquí puede establecer las siguientes propiedades de conexión opcionales. Si no especifica un valor, se utilizará el valor predeterminado.

processInitialData(predeterminado: true)
Defina si desea procesar los datos iniciales que incluyen mensajes antiguos de los últimos segundos.

fetchRoomInfoOnConnect(predeterminado: true)
Defina si desea obtener toda la información de la habitación en connect(). Si esta opción está habilitada, se impedirá la conexión a salas fuera de línea. Si está habilitado, el resultado de la conexión contiene la información de la habitación a través del roomInfoatributo. También puede recuperar manualmente la información de la habitación (incluso en un estado desconectado) usando la getRoomInfo()función.

enableExtendedGiftInfo(predeterminado: false)
Defina si desea recibir información ampliada sobre los obsequios, como el nombre del obsequio, el costo y las imágenes. Esta información se proporcionará en el evento de regalo .

enableWebsocketUpgrade(predeterminado: true)
Defina si desea utilizar una conexión WebSocket en lugar de solicitar un sondeo si TikTok lo ofrece.

requestPollingIntervalMs(predeterminado: 1000)
Solicitar intervalo de sondeo si no se utiliza WebSocket.

sessionId(predeterminado: null)
Aquí puede especificar el ID de sesión actual de su cuenta de TikTok ( valor de cookie de ID de sesión) si desea enviar mensajes de chat automatizados a través de la sendMessage()función. Consulte Ejemplo

clientParams (predeterminado: {})
Parámetros de cliente personalizados para la API de Webcast.

requestHeaders(predeterminado: {})
Encabezados de solicitud personalizados pasados ​​a axios .

websocketHeaders(predeterminado: {})
Encabezados websocket personalizados pasados ​​a websocket.client .

requestOptions(predeterminado: {})
Opciones de solicitud personalizadas pasadas a axios . Aquí puede especificar un httpsAgentpara usar un proxy y un timeoutvalor. Ver Ejemplo .

websocketOptions(predeterminado: {})
Opciones personalizadas de websocket pasadas a websocket.client . Aquí puede especificar un agentpara usar un proxy y un timeoutvalor. Ver Ejemplo .
Opciones de ejemplo:

let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
    processInitialData: false,
    enableExtendedGiftInfo: true,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 2000,
    clientParams: {
        "app_language": "en-US",
        "device_platform": "web"
    },
    requestHeaders: {
        "headerName": "headerValue"
    },
    websocketHeaders: {
        "headerName": "headerValue"
    },
    requestOptions: {
        timeout: 10000
    },
    websocketOptions: {
        timeout: 10000
    }
});
Métodos
Un WebcastPushConnectionobjeto contiene los siguientes métodos.

Nombre del método	Descripción
conectar	Se conecta al chat de transmisión en vivo.
Devuelve un Promiseque se resolverá cuando la conexión se establezca correctamente.
desconectar	Desconecta la conexión.
obtenerEstado	Obtiene el estado de conexión actual, incluida la información de la habitación en caché (ver más abajo).
getRoomInfo	Obtiene la información actual de la sala de la API de TikTok, incluida la información del transmisor, el estado de la sala y las estadísticas.
Devuelve un Promiseque se resolverá cuando se complete la solicitud de la API.
Nota: Puede llamar a esta función incluso si no está conectado.
Ejemplo
obtenerregalosdisponibles	Obtiene una lista de todos los obsequios disponibles, incluido el nombre del obsequio, la URL de la imagen, el costo del diamante y mucha otra información.
Devuelve un Promiseproblema que se resolverá cuando se hayan recuperado todos los obsequios disponibles de la API.
Nota: Puede llamar a esta función incluso si no está conectado.
Ejemplo
enviar mensaje
(text, [sessionId])	Envía un mensaje de chat a la sala en vivo actual utilizando la cookie de sesión proporcionada (especificada en las opciones del constructor o a través del segundo parámetro de función).
Devuelve un Promiseque se resolverá cuando el mensaje de chat se haya enviado a la API.

ADVERTENCIA: El uso de esta función es bajo su propio riesgo. Los mensajes de spam pueden provocar la suspensión de su cuenta de TikTok. ¡Ten cuidado!
Ejemplo
Eventos
Un WebcastPushConnectionobjeto tiene los siguientes eventos que se pueden manejar a través de.on(eventName, eventHandler)

Eventos de control:

conectado
desconectado
streamEnd
datos sin procesar
websocketConectado
error
Eventos de mensaje:

miembro
chat
regalo
usuario de la habitación
como
social
ser emocionado
sobre
preguntaNuevo
linkMicBattle
linkMicArmies
en vivoIntro
suscribir
Eventos personalizados:

seguir
Cuota



Eventos de control
connected
Se activa cuando la conexión se establece correctamente.

tiktokLiveConnection.on('connected', state => {
    console.log('Hurray! Connected!', state);
})
⚡Mostrar estructura de datos

disconnected
Se activa cuando la conexión se desconecta. En ese caso, puede connect()volver a llamar para tener una lógica de reconexión. Tenga en cuenta que debe esperar un poco antes de intentar una reconexión para evitar una tasa limitada.

tiktokLiveConnection.on('disconnected', () => {
    console.log('Disconnected :(');
})

streamEnd
Se activa cuando el host finaliza la transmisión en vivo. También activará el disconnectedevento.

tiktokLiveConnection.on('streamEnd', (actionId) => {
    if (actionId === 3) {
        console.log('Stream ended by user');
    }
    if (actionId === 4) {
        console.log('Stream ended by platform moderator (ban)');
    }
})

rawData
Se activa cada vez que llega un mensaje de webcast codificado en protobuf. Puede deserializar el objeto binario según el caso de uso con protobufjs .

tiktokLiveConnection.on('rawData', (messageTypeName, binary) => {
    console.log(messageTypeName, binary);
})

websocketConnected
Se activará tan pronto como se establezca una conexión websocket. Se pasa el objeto de cliente websocket.

tiktokLiveConnection.on('websocketConnected', websocketClient => {
    console.log("Websocket:", websocketClient.connection);
})

error
Evento de error general. Deberías encargarte de esto.

tiktokLiveConnection.on('error', err => {
    console.error('Error!', err);
})

Eventos de mensaje
member
Se activa cada vez que un nuevo espectador se une a la transmisión en vivo.

tiktokLiveConnection.on('member', data => {
    console.log(`${data.uniqueId} joins the stream!`);
})
⚡Mostrar estructura de datos

chat
Se activa cada vez que llega un nuevo comentario de chat.

tiktokLiveConnection.on('chat', data => {
    console.log(`${data.uniqueId} writes: ${data.comment}`);
})
⚡Mostrar estructura de datos

gift
Se activa cada vez que llega un regalo. Recibirá información adicional a través del extendedGiftInfoatributo cuando habilite la enableExtendedGiftInfoopción.

NOTA: Los usuarios tienen la capacidad de enviar regalos en una racha. Esto aumenta el repeatCountvalor hasta que el usuario finaliza la racha. Durante este tiempo, se activan una y otra vez nuevos eventos de regalo con un repeatCountvalor incrementado. Cabe señalar que después del final de la racha, se activa otro evento de regalo, que señala el final de la racha a través de repeatEnd: true. Esto se aplica sólo a los regalos con giftType: 1. Esto significa que incluso si el usuario envía un regalo solo una vez giftType, 1recibirás el evento dos veces. Una vez con repeatEnd: falsey una vez con repeatEnd: true. Por lo tanto, el evento debe manejarse de la siguiente manera:

tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) {
        // Streak in progress => show only temporary
        console.log(`${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount}`);
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log(`${data.uniqueId} has sent gift ${data.giftName} x${data.repeatCount}`);
    }
})
⚡Mostrar estructura de datos

roomUser
Se activa cada vez que llega un mensaje de estadísticas. Este mensaje actualmente contiene el recuento de espectadores y una lista de los principales obsequiadores.

tiktokLiveConnection.on('roomUser', data => {
    console.log(`Viewer Count: ${data.viewerCount}`);
})
⚡Mostrar estructura de datos

like
Se activa cuando un espectador envía Me gusta al transmisor. Para transmisiones con muchos espectadores, TikTok no siempre activa este evento.

tiktokLiveConnection.on('like', data => {
    console.log(`${data.uniqueId} sent ${data.likeCount} likes, total likes: ${data.totalLikeCount}`);
})
⚡Mostrar estructura de datos

social
Se activa cada vez que alguien comparte la transmisión o sigue al anfitrión.

tiktokLiveConnection.on('social', data => {
    console.log('social event data:', data);
})
⚡Mostrar estructura de datos

emote
Se activa cada vez que un suscriptor envía un emoticón (pegatina).

tiktokLiveConnection.on('emote', data => {
    console.log('emote received', data);
})
⚡Mostrar estructura de datos

envelope
Se activa cada vez que alguien envía un cofre del tesoro.

tiktokLiveConnection.on('envelope', data => {
    console.log('envelope received', data);
})
⚡Mostrar estructura de datos

questionNew
Se activa cada vez que alguien hace una nueva pregunta a través de la función de preguntas.

tiktokLiveConnection.on('questionNew', data => {
    console.log(`${data.uniqueId} asks ${data.questionText}`);
})
⚡Mostrar estructura de datos

linkMicBattle
Se activa cada vez que comienza una batalla.

tiktokLiveConnection.on('linkMicBattle', (data) => {
    console.log(`New Battle: ${data.battleUsers[0].uniqueId} VS ${data.battleUsers[1].uniqueId}`);
})
⚡Mostrar estructura de datos

linkMicArmies
Se activa cada vez que un participante de la batalla recibe puntos. Contiene el estado actual de la batalla y el ejército que apoyó al grupo.

tiktokLiveConnection.on('linkMicArmies', (data) => {
    console.log('linkMicArmies', data);
})
⚡Mostrar estructura de datos

liveIntro
Se activa cuando aparece un mensaje de introducción en vivo.

tiktokLiveConnection.on('liveIntro', (msg) => {
    console.log(msg);
})
⚡Mostrar estructura de datos

subscribe
Se activa cuando un usuario crea una suscripción.

tiktokLiveConnection.on('subscribe', (data) => {
    console.log(data.uniqueId, "subscribed!");
})
⚡Mostrar estructura de datos

Eventos personalizados
Estos eventos se basan en eventos de mensajes.

follow
Se activa cuando un usuario sigue al transmisor. Basado en socialevento.

tiktokLiveConnection.on('follow', (data) => {
    console.log(data.uniqueId, "followed!");
})
⚡Mostrar estructura de datos

share
Se activa cuando un usuario comparte la transmisión. Basado en socialevento.

tiktokLiveConnection.on('share', (data) => {
    console.log(data.uniqueId, "shared the stream!");
})
⚡Mostrar estructura de datos

Ejemplos
Recuperar información de la habitación
let tiktokLiveConnection = new WebcastPushConnection('@username');

tiktokLiveConnection.getRoomInfo().then(roomInfo => {
    console.log(roomInfo);
    console.log(`Stream started timestamp: ${roomInfo.create_time}, Streamer bio: ${roomInfo.owner.bio_description}`);
    console.log(`HLS URL: ${roomInfo.stream_url.hls_pull_url}`); // Can be played or recorded with e.g. VLC
}).catch(err => {
    console.error(err);
})
Recuperar regalos disponibles
let tiktokLiveConnection = new WebcastPushConnection('@username');

tiktokLiveConnection.getAvailableGifts().then(giftList => {
    console.log(giftList);
    giftList.forEach(gift => {
        console.log(`id: ${gift.id}, name: ${gift.name}, cost: ${gift.diamond_count}`)
    });
}).catch(err => {
    console.error(err);
})
Enviar mensajes de chat
Puede enviar mensajes de chat a través de la sendMessage()función para responder automáticamente a los comandos de chat, por ejemplo. Para ello, debe proporcionar su ID de sesión.

Para obtener el ID de sesión de su cuenta, abra TikTok en su navegador web y asegúrese de haber iniciado sesión, luego presione F12 para abrir las herramientas de desarrollo. Cambie a la pestaña Aplicación y seleccione Cookies en el lado izquierdo. Luego tome el valor de la cookie con el nombre sessionid.

ADVERTENCIA: El uso de esta función es bajo su propio riesgo. Los mensajes de spam pueden provocar la suspensión de su cuenta de TikTok. ¡Ten cuidado!

let tiktokLiveConnection = new WebcastPushConnection('@username', {
    sessionId: 'f7fbba3a57e48dd1ecd0b7b72cb27e6f' // Replace this with the Session ID of your TikTok account
});

tiktokLiveConnection.connect().catch(err => console.log(err));

tiktokLiveConnection.on('chat', data => {
    if (data.comment.toLowerCase() === '!dice') {
        let diceResult = Math.ceil(Math.random() * 6);
        tiktokLiveConnection.sendMessage(`@${data.uniqueId} you rolled a ${diceResult}`).catch(err => console.error(err));
    }
})
Conectar a través de proxy
proxy - agent admite http, httpsy proxies:socks4socks5

npm i proxy-agent
Puede especificar si desea utilizar un proxy para solicitudes https, websockets o ambos:

const { WebcastPushConnection } = require('tiktok-live-connector');
const ProxyAgent = require('proxy-agent');

let tiktokLiveConnection = new WebcastPushConnection('@username', {
    requestOptions: {
        httpsAgent: new ProxyAgent('https://username:password@host:port'),
        timeout: 10000 // 10 seconds
    },
    websocketOptions: {
        agent: new ProxyAgent('https://username:password@host:port'),
        timeout: 10000 // 10 seconds
    }
});

// Connect as usual
contribuyendo
¡Tus mejoras son bienvenidas! Siéntase libre de abrir un problema o una solicitud de extracción .

Lanzamientos 7
v1.0.2
Último
el 22 oct 2022
+ 6 lanzamientos
Patrocine este proyecto
ko_fi
ko-fi.com/zerody _
patrón
patreon.com/zerody _
https://www.paypal.me/dalixz
