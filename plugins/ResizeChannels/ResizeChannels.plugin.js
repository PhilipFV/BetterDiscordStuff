/**
 * @name ResizeChannels
 * @authorLink https://github.com/PhilipFV
 * @website https://github.philipv.tech/
 * @source https://github.com/PhilipFV/BetterDiscordStuff/
 * @updateUrl https://raw.githubusercontent.com/PhilipFV/BetterDiscordStuff/main/plugins/ResizeChannels/ResizeChannels.plugin.js
 */

 const config = {
    "info": {
        "name": "ResizeChannels",
        "authors": [{
            "name": "Güztaf",
            "discord_id": "455031571930546177",
            "github_username": "PhilipFV"
        }],
        "version": "0.1.4",
        "description": "Resize channel list by clicking and draging and toggle hide with double click.",
        "github_raw": "https://raw.githubusercontent.com/PhilipFV/BetterDiscordStuff/main/plugins/ResizeChannels/ResizeChannels.plugin.js"
    },
}

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() { this._config = config; }
    getName() { return config.info.name; }
    getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
    getDescription() { return config.info.description; }
    getVersion() { return config.info.version; }
    load() {
        BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
            confirmText: "Download Now",
            cancelText: "Cancel",
            onConfirm: () => {
                require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async(error, response, body) => {
                    if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                });
            }
        });
    }
    start() {}
    stop() {}
} : (([Plugin, Library]) => {
    const customCSS = `
    .ResizableChannels-Slider-Handle {
        position: absolute;
        margin-left: 240px;
        height: 100%;
        border-left: solid 4px transparent;
        transition-property: border-color;
        transition-duration: 250ms;
        transition-delay: 0ms;
        width: 8px;
        cursor: ew-resize;
        z-index: 1000;
    }
    
    .ResizableChannels-Slider-Handle:hover {
        transition-delay: 200ms;
        border-color: var(--brand-experiment-560);
    }
    
    .ResizableChannels-Slider-Handle:active {
        transition-delay: 0ms;
        border-color: var(--brand-experiment);
    }
    
    .channel-1Shao0 {
        max-width: none;
    }
    
    .bannerImg-2PzH6z, .bannerImage-ubW8K- {
        width: 100%;
    }`;

    function GetResizeObjects() {
        const channelList = document.getElementsByClassName("sidebar-1tnWFu")[0];
        if (document.getElementsByClassName("ResizableChannels-Slider-Handle").length == 0) addReziseHandleRight(channelList);
    }

    function addReziseHandleRight(target) {
        var handle = document.createElement("div");
        handle.classList.add("ResizableChannels-Slider-Handle");
        target.appendChild(handle);
        var offset = 0;
        handle.addEventListener("mousedown", (e) => {
            offset = e.clientX - e.target.getBoundingClientRect().x;
            document.addEventListener("mousemove", resize, true);
            handle.addEventListener("dblclick", toggleVisibility, true);
        });
        handle.addEventListener("mouseup", (e) => document.removeEventListener("mousemove", resize, true));

        function toggleVisibility(e) {
            var newWidth = 0;
            if (target.style.width == "0px") newWidth = 240;
            target.style.width = `${newWidth}px`;
            handle.style.marginLeft = `${newWidth}px`;
            document.removeEventListener("mousemove", resize, true);
        }

        function resize(e) {
            handle.removeEventListener("dblclick", toggleVisibility, true);
            if (e.buttons != 1) {
                document.removeEventListener("mousemove", resize, true);
                return;
            }
            var width = Math.min(Math.max(e.clientX - target.getBoundingClientRect().left, 0), 500) - offset;
            if (width <= 10) width = 0;
            target.style.width = `${width}px`;
            handle.style.marginLeft = `${width}px`;
            if (width == 0) handle.style.cursor = "e-resize"
            else if (width == 500) handle.style.cursor = "w-resize"
            else handle.style.cursor = "ew-resize"
        }
    }

    return class template extends Plugin {
        onStart() {
            BdApi.injectCSS(config.info.name, customCSS);
            GetResizeObjects();
        }
        onSwitch() {
            GetResizeObjects();
        };
        onStop() {
            BdApi.clearCSS(config.info.name);
            const handles = document.getElementsByClassName("ResizableChannels-Slider-Handle");
            for (const h of handles) { h.parentNode.removeChild(h) };
            const channelList = document.getElementsByClassName("sidebar-1tnWFu");
            for (const r of channelList) r.style.width = `240px`;
        }
    }
})(global.ZeresPluginLibrary.buildPlugin(config));