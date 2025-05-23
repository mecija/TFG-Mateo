/**
 * OpenAPI definition
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { OrderProductDTO } from './orderProductDTO';


export interface OrderEdit { 
    creationTime?: string;
    deliveryTime?: string;
    orderId?: number;
    clientId?: number;
    orderStatus?: string;
    amount?: number;
    deliveryAddress?: string;
    productos?: Array<OrderProductDTO>;
}

