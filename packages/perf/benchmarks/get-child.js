export const init = function () {
  const nbrOfChilds = 3;
  const depth = 3;

  function fill(parents, i = 0) {
    if (i >= depth) {
      return;
    }

    for (const parent of parents) {
      let childs = [];
      for (let j = 0; j < nbrOfChilds; j++) {
        const child = document.createElement("div");
        parent.append(child);
        if (i === depth - 1) {
          child.textContent = j;
        }
        childs.push(child);
      }
      fill(childs, i + 1);
    }
  }

  const container = document.createElement("div");
  fill([container]);

  const target = container.lastElementChild.children[1].lastElementChild;
  target.id = "target";
  target.className = "target";
  target.setAttribute("data-target", "true");

  document.body.append(container);
  return { container };
};

// prettier-ignore
export const tests = {
direct: function ({ container }) {
  const el = container.lastElementChild.children[1].lastElementChild;
},
byId: function ({ container }) {
  const el = document.getElementById('target')
},
queryByAttribute: function ({ container }) {
  const el = container.querySelector('[data-target]')
},
queryByClass: function ({ container }) {
  const el = container.querySelector('.target')
},
queryById: function ({ container }) {
  const el = container.querySelector('#target')
},
byClass: function ({ container }) {
  const el = container.getElementsByClassName('target')[0]
},
};
