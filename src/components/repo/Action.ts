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

export interface Action extends BaseModel {
  applicationId: string;

  callbacks: string;

  confirmationMessage: string | null;

  createdAt: Date;

  description: string | null;

  endpoint: Endpoint | null;

  endpointId: string | null;

  helpText: string | null;

  id: string;

  schedule: string | null;

  updatedAt: Date;

  useNewRuntime: boolean;

  variables: Variable[] | null;
}
