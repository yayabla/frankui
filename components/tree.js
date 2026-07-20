const Tree = {
    init: function() {
        document.querySelectorAll('[data-role="tree"]').forEach(tree => {
            if (tree.dataset.initialized) return;
            tree.dataset.initialized = 'true';
            tree.querySelectorAll('.tree-node').forEach(node => {
                node.addEventListener('click', (e) => {
                    e.stopPropagation();
                    node.classList.toggle('expanded');
                });
            });
        });
    },

    addNode: function(parent, title) {
        const li = document.createElement('li');
        li.innerHTML = `<div class="tree-node">${title}</div><ul class="tree-children"></ul>`;
        li.querySelector('.tree-node').addEventListener('click', (e) => {
            e.stopPropagation();
            li.querySelector('.tree-node').classList.toggle('expanded');
        });
        
        let childrenUl = parent.querySelector('.tree-children');
        if (!childrenUl) {
            childrenUl = document.createElement('ul');
            childrenUl.className = 'tree-children';
            parent.appendChild(childrenUl);
        }
        childrenUl.appendChild(li);
        return li;
    }
};

window.Tree = Tree;
