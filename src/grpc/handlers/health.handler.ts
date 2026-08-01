import * as grpc from '@grpc/grpc-js';
import * as healthProto from '../generated/common/health';
import * as emptyProto from '../generated/common/empty';
import * as heathService from '../../services/health.service';
import {callbackError} from './callback.error';
import logger from "@shared/logger";

export const check = async (
    call: grpc.ServerUnaryCall<emptyProto.Empty, healthProto.HealthReport>,
    callback: grpc.sendUnaryData<healthProto.HealthReport>
) => {
    try {
        const response = await heathService.check();

        callback(null, response);


    } catch (err: any) {
        logger.log(err);
        callbackError(callback, err);
    }
};

export const status = async (
    call: grpc.ServerUnaryCall<emptyProto.Empty, healthProto.ServiceStatus>,
    callback: grpc.sendUnaryData<healthProto.ServiceStatus>
) => {
    try {
        const response = await heathService.status();

        callback(null, response);

    } catch (err: any) {
        logger.log(err);
        callbackError(callback, err);
    }
};

export const livez = async (
    call: grpc.ServerUnaryCall<emptyProto.Empty, healthProto.LiveStatus>,
    callback: grpc.sendUnaryData<healthProto.LiveStatus>
) => {
    try {
        const response = await heathService.livez();

        callback(null, response);

    } catch (err: any) {
        logger.log(err);
        callbackError(callback, err);
    }
};

export const readyz = async (
    call: grpc.ServerUnaryCall<emptyProto.Empty, healthProto.ReadyStatus>,
    callback: grpc.sendUnaryData<healthProto.ReadyStatus>
) => {
    try {
        const response = await heathService.readyz();

        callback(null, response);

    } catch (err: any) {
        logger.log(err);
        callbackError(callback, err);
    }
};
