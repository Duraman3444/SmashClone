const Logger = {
    enabled: true,
    log: function (...args) {
        if (!this.enabled) return;
        console.log('[LOG]', ...args);
        this.writeToDebugDiv('[LOG] ' + args.join(' '));
    },
    warn: function (...args) {
        if (!this.enabled) return;
        console.warn('[WARN]', ...args);
        this.writeToDebugDiv('[WARN] ' + args.join(' '));
    },
    error: function (...args) {
        if (!this.enabled) return;
        console.error('[ERROR]', ...args);
        this.writeToDebugDiv('[ERROR] ' + args.join(' '));
    },
    writeToDebugDiv: function (text) {
        const debugDiv = document.getElementById('debugLog');
        if (!debugDiv) return;
        const p = document.createElement('div');
        p.innerText = text;
        debugDiv.appendChild(p);
        // Keep last 100 logs
        if (debugDiv.childNodes.length > 100) {
            debugDiv.removeChild(debugDiv.firstChild);
        }
        // Auto-scroll
        debugDiv.scrollTop = debugDiv.scrollHeight;
    }
}; 