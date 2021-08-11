import { BaseModel } from './BaseModel';
import { ComponentInteraction } from './ComponentInteraction';
import { ComponentOption } from './ComponentOption';
import { ComponentStyleReference } from './ComponentStyleReference';

/*
 * Return new blob options when available, otherwise fallback to old options
 *
 * TODO: remove this function when working on PAGE-51
 */
export function resolveOptions(
  componentId: string,
  options: Component['options'],
  oldOptions: Component['oldOptions'],
): ComponentOption[] {
  if (!options || options.length <= 0) {
    return oldOptions || [];
  }

  return options.map(o => ({ ...o, componentId } as ComponentOption));
}

export interface Component extends BaseModel {
  id: string;

  applicationId: string;

  index: number;

  jsx: string;

  partialId: string | null;

  partialReferenceId: string | null;

  parentId: string | null;

  styles: string;

  componentStyleReference: ComponentStyleReference;

  componentBlueprintId: string;

  options: ComponentOption[] | null;

  // TODO: Remove when working on PAGE-51
  oldOptions: ComponentOption[];

  descendants: string[];

  sourceInteractions: ComponentInteraction[];

  targetInteractions: ComponentInteraction[];
}
