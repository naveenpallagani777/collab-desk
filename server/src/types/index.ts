import "express-session";
import type { UtilsService } from "./utils.types";
import type { } from "../validators/auth.validator";

declare module "express-session" {
	interface SessionData {
		userId?: string;
		workspaceId?: string;
	}
}


export interface ServicesContainer {
  crudService: { bindModel: (...args: unknown[]) => unknown };
  utilsService: UtilsService;
  authService: any; // Replace 'any' with the actual type of authService when defined
}

export type {
  PlainObject,
  QueryStringValue,
  QueryStringObject,
  QueryLike,
  ApiFeaturesLike,
  CustomAppErrorConstructor,
} from "./utils.types";
