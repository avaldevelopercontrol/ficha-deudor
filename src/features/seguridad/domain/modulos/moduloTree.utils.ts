interface ModuloTreeNode {
  idModulo: number;
  idPadre: number;
}

export type ModuloChildrenIndex<
  TNode extends ModuloTreeNode,
> = ReadonlyMap<number, readonly TNode[]>;

/**
 * Indexa la jerarquía una sola vez para evitar recorrer la colección completa
 * por cada padre al buscar descendientes o propagar cambios.
 */
export const buildModuloChildrenIndex = <
  TNode extends ModuloTreeNode,
>(
  nodes: Iterable<TNode>
): ModuloChildrenIndex<TNode> => {
  const childrenByParent = new Map<
    number,
    TNode[]
  >();

  for (const node of nodes) {
    const siblings =
      childrenByParent.get(node.idPadre) ?? [];

    siblings.push(node);
    childrenByParent.set(
      node.idPadre,
      siblings
    );
  }

  return childrenByParent;
};

export const getModuloDescendantsFromIndex = <
  TNode extends ModuloTreeNode,
>(
  moduloId: number,
  childrenByParent: ModuloChildrenIndex<TNode>
): TNode[] => {
  const descendants: TNode[] = [];
  const visitedIds = new Set<number>([
    moduloId,
  ]);
  const pendingParentIds = [
    moduloId,
  ];

  for (
    let index = 0;
    index < pendingParentIds.length;
    index += 1
  ) {
    const parentId = pendingParentIds[index];

    if (parentId === undefined) {
      continue;
    }

    const children =
      childrenByParent.get(parentId) ?? [];

    children.forEach((child) => {
      if (visitedIds.has(child.idModulo)) {
        return;
      }

      visitedIds.add(child.idModulo);
      descendants.push(child);
      pendingParentIds.push(child.idModulo);
    });
  }

  return descendants;
};

export const getModuloDescendantIds = <
  TNode extends ModuloTreeNode,
>(
  moduloId: number,
  nodes: Iterable<TNode>
): Set<number> =>
  new Set(
    getModuloDescendantsFromIndex(
      moduloId,
      buildModuloChildrenIndex(nodes)
    ).map((node) => node.idModulo)
  );
