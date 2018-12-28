(() => {
    require.config({
        paths: {
            'vs': 'libs/vs'
        }
    });
    require(['vs/editor/editor.main', 'vs/editor/editor.main.nls.zh-cn'], function() {
        const eNode = document.querySelector('#J_Editor');
        const pNode = document.querySelector('#J_Preview');
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
    });
    
    
})();