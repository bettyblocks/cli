import { BaseModel } from './BaseModel';
import { ComponentInteraction } from './ComponentInteraction';

export interface Component extends BaseModel {
  id: string;

  applicationId: string;

  index: number;

  jsx: string;

  partialId: string | null;

  partialReferenceId: string | null;

  parentId: string | null;

  styles: string;

  componentBlueprintId: string;

  descendants: string[];

  sourceInteractions: ComponentInteraction[];

  targetInteractions: ComponentInteraction[];
}
