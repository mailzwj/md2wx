(() => {
    require.config({
        paths: {
            'vs': 'libs/vs'
        }
    });

    let tipsTimer;
    const showTips = (node, str) => {
        if (tipsTimer) {
            clearTimeout(tipsTimer);
        }
        node.innerHTML = str || '';
        node.classList.add('show');
        tipsTimer = setTimeout(() => {
            node.innerHTML = '';
            node.classList.remove('show');
        }, 1500);
    };

    require(['vs/editor/editor.main', 'vs/editor/editor.main.nls.zh-cn'], function() {
        const eNode = document.querySelector('#J_Editor');
        const pNode = document.querySelector('#J_Preview');
        const tNode = document.querySelector('#J_Tips');
        const cNode = document.querySelector('#J_Copyer');
        const sNode = document.querySelector('#J_SelectFile');
        const mw = document.querySelector('#J_MenuWrap');
        const mc = document.querySelector('#J_MenuCtl');
        const ms = mw.querySelectorAll('.J_Menu');
        const editor = monaco.editor.create(eNode, {
            language: 'markdown',
            lineNumbers: 'on',
            theme: 'vs',
            fontSize: 14,
            minimap: {
                enabled: false
            },
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            quickSuggestions: false
        });

        editor.focus();

        let typeTimer;
        let fetching;
        editor.onKeyUp(function(ev) {
            if (typeTimer) {
                clearTimeout(typeTimer);
            }
            if (fetching) {
                return;
            }
            typeTimer = setTimeout(() => {
                fetching = true;
                fetch('/prev', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({md: editor.getValue()})
                }).then(res => {
                    fetching = false;
                    return res.json();
                }).then(data => {
                    pNode.innerHTML = data ? (data.html || '') : '';
                });
            }, 500);
        });

        sNode.addEventListener('change', () => {
            const files = sNode.files || [];
            if (files.length) {
                const file = files[0];
                // console.log(file);
                if (file.name.match(/\.(md|markdown)$/)) {
                    const reader = new FileReader();
                    reader.addEventListener('load', (ev) => {
                        const target = ev.target;
                        // console.log(target.result);
                        editor.setValue(target.result);
                        ms[1].click();
                    });
                    reader.readAsText(file);
                } else {
                    showTips(tNode, '仅支持导入markdown文件');
                }
            }
            sNode.value = '';
        }, false);

        mc.addEventListener('click', () => {
            if (mw.classList.contains('expand')) {
                mw.classList.remove('expand');
            } else {
                mw.classList.add('expand');
            }
        }, false);

        ms[0].addEventListener('click', () => {
            const sels = window.getSelection();
            const range = document.createRange();
            sels.removeAllRanges();
            range.selectNode(pNode);
            sels.addRange(range);
            document.execCommand('copy');
            sels.removeAllRanges();
            showTips(tNode, '复制成功');
        }, false);

        ms[1].addEventListener('click', () => {
            if (typeTimer) {
                clearTimeout(typeTimer);
                typeTimer = null;
            }
            if (fetching) {
                showTips(tNode, '正在编译，请稍候...');
                return;
            }
            fetching = true;
            fetch('/prev', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({md: editor.getValue()})
            }).then(res => {
                fetching = false;
                return res.json();
            }).then(data => {
                pNode.innerHTML = data ? (data.html || '') : '';
                showTips(tNode, '编译成功');
            });
        }, false);

        ms[2].addEventListener('click', () => {
            // showTips(tNode, '【待开发】存储为图片');
            location.href = '/pic';
        }, false);

        ms[3].addEventListener('click', () => {
            location.href = '/save/md';
        }, false);

        ms[4].addEventListener('click', () => {
            // showTips(tNode, '【待开发】导入md文件');
            sNode.click();
        }, false);

        ms[5].addEventListener('click', () => {
            location.href = '/save/html';
        }, false);

        ms[6].addEventListener('click', () => {
            cNode.value = editor.getValue();
            cNode.focus();
            cNode.select();
            document.execCommand('copy');
            cNode.value = '';
            editor.focus();
            showTips(tNode, '源代码复制成功');
        }, false);
    });
})();
