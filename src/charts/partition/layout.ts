const treemapDice = (parent, x0, y0, x1, y1) => {
  const nodes = parent.children;
  let  node;
  let  i = -1;
  const  n = nodes.length;
  const  sum = nodes.reduce((_sum, _n) => _sum + Math.abs(_n.value), 0);
  const  k = (x1 - x0) / sum;

  while (++i < n) {
    node = nodes[i];
    node.y0 = y0;
    node.y1 = y1;
    node.x0 = x0;
    node.x1 = x0 += Math.abs(node.value) * k;
  }
};

const roundNode = node => {
  node.x0 = Math.round(node.x0);
  node.y0 = Math.round(node.y0);
  node.x1 = Math.round(node.x1);
  node.y1 = Math.round(node.y1);
};

const partition = () => {
  let dx = 1;
  let dy = 1;
  let padding = 0;
  let round = false;

  // tslint:disable-next-line:no-shadowed-variable
  const positionNode = (dy, n) => {
    return (node) => {
      if (node.children) {
        treemapDice(
          node,
          node.x0,
          dy * ((node.depth + 1) / n),
          node.x1,
          dy * ((node.depth + 2) / n)
        );
      }
      let x0 = node.x0;
      let y0 = node.y0;
      let x1 = node.x1 - padding;
      let y1 = node.y1 - padding;
      if (x1 < x0) x0 = x1 = (x0 + x1) / 2;
      if (y1 < y0) y0 = y1 = (y0 + y1) / 2;
      node.x0 = x0;
      node.y0 = y0;
      node.x1 = x1;
      node.y1 = y1;
    };
  };

  // tslint:disable-next-line:no-shadowed-variable
  const partition: any = (root) => {
    const n = root.height + 1;
    root.x0 = root.y0 = padding;
    root.x1 = dx;
    root.y1 = dy / n;
    root.eachBefore(positionNode(dy, n));
    if (round) root.eachBefore(roundNode);
    return root;
  };

  partition.round = (x) => {
    // eslint-disable-next-line
    return x ? ((round = !!x), partition) : round;
  };

  partition.size = (x) => {
    // eslint-disable-next-line
    return x ? ((dx = +x[0]), (dy = +x[1]), partition) : [dx, dy];
  };

  partition.padding = (x) => {
    // eslint-disable-next-line
    return x ? ((padding = +x), partition) : padding;
  };

  return partition;
};

export default partition;
