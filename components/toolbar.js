const Toolbar = {
    init: function() {
        document.querySelectorAll('.toolbar.movable').forEach((toolbar, index) => {
            if (toolbar.dataset.initialized) return;
            toolbar.dataset.initialized = 'true';
            const id = `toolbar-${index}`;
            const savedPos = localStorage.getItem(id);
            if (savedPos) {
                const pos = JSON.parse(savedPos);
                toolbar.style.left = pos.left;
                toolbar.style.top = pos.top;
            }

            toolbar.addEventListener('mousedown', (e) => {
                let shiftX = e.clientX - toolbar.getBoundingClientRect().left;
                let shiftY = e.clientY - toolbar.getBoundingClientRect().top;

                function moveAt(pageX, pageY) {
                    toolbar.style.left = pageX - shiftX + 'px';
                    toolbar.style.top = pageY - shiftY + 'px';
                }

                function onMouseMove(e) {
                    moveAt(e.pageX, e.pageY);
                }

                document.addEventListener('mousemove', onMouseMove);

                toolbar.onmouseup = function() {
                    document.removeEventListener('mousemove', onMouseMove);
                    localStorage.setItem(id, JSON.stringify({
                        left: toolbar.style.left,
                        top: toolbar.style.top
                    }));
                    toolbar.onmouseup = null;
                };
            });
            toolbar.ondragstart = () => false;
        });
    }
};

window.Toolbar = Toolbar;
