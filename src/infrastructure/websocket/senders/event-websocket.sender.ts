import * as streamingProto from "../../../contracts/proto/streaming";
import * as guesteauProto from "../../../contracts/proto/gusteau";
import EventWebsocketsRegistry from "../registers/event-websockets.registry";
import WebsocketSender from "./websocket.sender";
import SocketEncoding from "../enums/socket-encoding";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";
import logger from "@shared/logger";

export class EventWebsocketSender extends WebsocketSender {
    constructor(
        private readonly eventWebsocketsRegistry: EventWebsocketsRegistry,
    ) {
        super();
    }

    send(eventObject: guesteauProto.EventObject) {
        // logger.error(new Error().stack);
        logger.log(eventObject);
        // logger.log(new BattleId(eventObject.id));
        const ws = this.eventWebsocketsRegistry.getProfileSocket(new ProfileId(eventObject.profileId));

        // logger.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!----------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

        // logger.log(sockets?.size);

        if (!ws) {
            return;
        }

        const streamResponse = streamingProto.EventResponse.create({event: eventObject})

        const context = this.eventWebsocketsRegistry.getSocketContext(ws);
        this.writeStream(ws, streamResponse, context?.encoding ?? SocketEncoding.PROTOBUF);
        // logger.log('----');
        // logger.log(streamResponse);
        // logger.log('------------------------------------------------------------------------------------------------------------');
    }
}

export default EventWebsocketSender;


