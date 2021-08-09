import { BaseModel } from './BaseModel';
import { Endpoint } from './Endpoint';
import { Variable } from './Variable';

export interface ActionOptions {
  forceBackground: boolean;
  forceAllForeground: boolean;
  enableCallbackAction: boolean;
  // TODO What's in there?
  assign: object;
}

export class Action extends BaseModel {
  public applicationId!: string;

  public callbacks!: string;

  public confirmationMessage!: string | null;

  public createdAt!: Date;

  public description!: string | null;

  public endpoint!: Endpoint | null;

  public endpointId!: string | null;

  public helpText!: string | null;

  public id!: string;

  public schedule!: string | null;

  public updatedAt!: Date;

  public useNewRuntime!: boolean;

  public variables!: Variable[] | null;
}
