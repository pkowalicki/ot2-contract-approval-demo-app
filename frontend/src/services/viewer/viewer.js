import axios from "axios";

const useScript = (id, scriptContent) => {
    let existingScript = document.getElementById(id);

    if (!existingScript) {
        console.log('Adding new script with id:', id);
        let script = document.createElement('script');
        script.id = id;
        script.appendChild(document.createTextNode(scriptContent));
        document.body.appendChild(script);
    }
}

const useStyle = (id, styleContent) => {
    let existingStyle = document.getElementById(id);

    if (!existingStyle) {
        let style = document.createElement('style');
        style.id = id;
        style.appendChild(document.createTextNode(styleContent));
        document.getElementsByTagName("head")[0].appendChild(style);
    }
}

const loadViewerResource = (viewer, viewerResourcePath, viewerResourceId, type) => {
    console.log('Loading viewer resource for path: ', viewerResourcePath);
    axios({
        method: 'get',
        url: '/api/viewer/' + viewer + viewerResourcePath
    }).then(res => {
        console.log('Resource body: ', res.data);

        if (type === 'js') useScript(viewerResourceId, res.data);
        if (type === 'css') useStyle(viewerResourceId, res.data);
    }).catch(error => {
        let errorMessage = 'Could not load viewer resource: ';
        if (error.response != null && error.response.data != null) {
            errorMessage += error.response.data.exception;
        } else {
            errorMessage += error.message;
        }
        console.log(errorMessage);
    });
}

const loadViewerBootstrap = (viewer, callback) => {
    axios({
        method: 'get',
        url: '/api/viewer/' + viewer + '/loader'
    }).then(res => {
        console.log('Boot script body: ', res.data);

        document.addEventListener('afterscriptexecute', (event) => {
            if (event.target.id === 'viewer-' + viewer + '-boot-script') {
                console.log('Boot script executed. Loading additional resources.');
                callback();
            }
        });

        useScript('viewer-' + viewer + '-boot-script', res.data);
    }).catch(error => {
        let errorMessage = 'Could not get viewer: ';
        if (error.response != null && error.response.data != null) {
            errorMessage += error.response.data.exception;
        } else {
            errorMessage += error.message;
        }
        console.log(errorMessage);
    });
}

export const loadViewer = (viewer) => {
    loadViewerBootstrap(viewer, () => {
        let i = 1;
        window['cssFiles'].forEach(resourcePath => {
            loadViewerResource(viewer, resourcePath, viewer + '-css-' + i, 'css');
            i++;
        });

        i = 1;
        window['jsFiles'].forEach(resourcePath => {
            loadViewerResource(viewer, resourcePath, viewer + '-js-' + i,'js');
            i++;
        });
    });
}
