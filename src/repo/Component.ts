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

export class Component extends BaseModel {
  public id!: string;

  public applicationId!: string;

  public index!: number;

  public jsx!: string;

  public partialId!: string | null;

  public partialReferenceId!: string | null;

  public parentId!: string | null;

  public styles!: string;

  public componentStyleReference!: ComponentStyleReference;

  public componentBlueprintId!: string;

  public options!: ComponentOption[] | null;

  // TODO: Remove when working on PAGE-51
  public oldOptions!: ComponentOption[];

  public descendants!: string[];

  public sourceInteractions!: ComponentInteraction[];

  public targetInteractions!: ComponentInteraction[];
}
