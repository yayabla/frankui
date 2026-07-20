/* Working Tree Component Javascript */

const WorkingTree = {
    init: function() {
        document.querySelectorAll('.working-tree').forEach(tree => {
            if (tree.dataset.initialized) return;
            tree.dataset.initialized = 'true';

            tree.querySelectorAll('.stage-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    header.classList.toggle('expanded');
                    const substages = header.nextElementSibling;
                    if (substages && substages.classList.contains('substages')) {
                        substages.style.display = header.classList.contains('expanded') ? 'block' : 'none';
                    }
                });
            });
        });
    }
};

window.WorkingTree = WorkingTree;
