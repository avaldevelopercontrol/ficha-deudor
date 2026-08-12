import type { FeedbackMessageVariant } from '../components/ui/FeedbackMessage';

export type OperationFeedback = {
  variant: FeedbackMessageVariant;
  title: string;
  message: string;
};

export type OperationSuccessAction =
  | 'create'
  | 'update'
  | 'assign';

export type OperationEntityGender =
  | 'masculine'
  | 'feminine';

export type OperationEntityNumber =
  | 'singular'
  | 'plural';

export type OperationSuccessContext =
  | 'list'
  | 'record';

export interface OperationFeedbackEntity {
  label: string;
  gender: OperationEntityGender;
  number?: OperationEntityNumber;
}

export interface BuildOperationSuccessFeedbackParams {
  entity: OperationFeedbackEntity;
  action: OperationSuccessAction;
  context?: OperationSuccessContext;
  message?: string;
}

const lowerFirst = (value: string): string => {
  if (!value) return value;

  return `${value.charAt(0).toLocaleLowerCase('es')}${value.slice(1)}`;
};

const getGrammar = ({
  gender,
  number = 'singular',
}: OperationFeedbackEntity) => {
  const isPlural = number === 'plural';
  const isFeminine = gender === 'feminine';

  if (isPlural && isFeminine) {
    return {
      article: 'Las',
      genitiveArticle: 'de las',
      newAdjective: 'nuevas',
      registered: 'registradas',
      updated: 'actualizadas',
      assigned: 'asignadas',
      beAvailable: 'se encuentran',
      saved: 'se guardaron',
      assignedVerb: 'se asignaron',
    };
  }

  if (isPlural) {
    return {
      article: 'Los',
      genitiveArticle: 'de los',
      newAdjective: 'nuevos',
      registered: 'registrados',
      updated: 'actualizados',
      assigned: 'asignados',
      beAvailable: 'se encuentran',
      saved: 'se guardaron',
      assignedVerb: 'se asignaron',
    };
  }

  if (isFeminine) {
    return {
      article: 'La',
      genitiveArticle: 'de la',
      newAdjective: 'nueva',
      registered: 'registrada',
      updated: 'actualizada',
      assigned: 'asignada',
      beAvailable: 'se encuentra',
      saved: 'se guardó',
      assignedVerb: 'se asignó',
    };
  }

  return {
    article: 'El',
    genitiveArticle: 'del',
    newAdjective: 'nuevo',
    registered: 'registrado',
    updated: 'actualizado',
    assigned: 'asignado',
    beAvailable: 'se encuentra',
    saved: 'se guardó',
    assignedVerb: 'se asignó',
  };
};

export const buildOperationSuccessFeedback = ({
  entity,
  action,
  context = 'list',
  message,
}: BuildOperationSuccessFeedbackParams): OperationFeedback => {
  const grammar = getGrammar(entity);
  const entityLabel = entity.label.trim();
  const entityLabelLower = lowerFirst(entityLabel);

  if (action === 'update') {
    return {
      variant: 'success',
      title: `${entityLabel} ${grammar.updated} correctamente`,
      message:
        message ??
        `Los cambios ${grammar.genitiveArticle} ${entityLabelLower} se guardaron correctamente.`,
    };
  }

  if (action === 'assign') {
    return {
      variant: 'success',
      title: `${entityLabel} ${grammar.assigned} correctamente`,
      message:
        message ??
        `${grammar.article} ${entityLabelLower} ${grammar.assignedVerb} correctamente.`,
    };
  }

  const defaultCreateMessage =
    context === 'list'
      ? `${grammar.article} ${grammar.newAdjective} ${entityLabelLower} ya ${grammar.beAvailable} disponible${entity.number === 'plural' ? 's' : ''} en el listado.`
      : `${grammar.article} ${grammar.newAdjective} ${entityLabelLower} ${grammar.saved} correctamente.`;

  return {
    variant: 'success',
    title: `${entityLabel} ${grammar.registered} correctamente`,
    message: message ?? defaultCreateMessage,
  };
};
