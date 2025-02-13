import config from "../../config";
import BaseRouter from "./base/BaseRoutes";

export function getTokenRoutes(){
    switch(config.chainName){
        case "base":
            return BaseRouter;
        default:
            return BaseRouter;
    }
}