/**
 * @name ResizeChannels
 * @authorLink https://github.com/PhilipFV
 * @website https://github.philipv.tech/
 * @source https://github.com/PhilipFV/BetterDiscordStuff/
 * @updateUrl https://raw.githubusercontent.com/PhilipFV/BetterDiscordStuff/main/plugins/ResizeChannels/ResizeChannels.plugin.js
 * @version 0.1.11
 */

 const config = {
    "info": {
        "name": "ResizeChannels",
        "authors": [{
            "name": "Güztaf",
            "discord_id": "455031571930546177",
            "github_username": "PhilipFV"
        }],
        "version": "0.1.11",
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
        cursor: ew-resize;
        z-index: 1001;
    }

    .sidebar-1tnWFu{
        margin-right: 0 !important;
    }

    .channel-1Shao0 {
        max-width: none;
    }

    .container-YkUktl .flex-2S1XBF {
        background-color: var(--background-secondary-alt);
        z-index: 0;
    }

    .avatarWrapper-1B9FTW {
        margin-right: auto;
        width: 100%;
    }

    .withTagAsButton-OsgQ9L {
        min-width: 0;
    }
    
    .bannerImg-2PzH6z, .bannerImage-ubW8K- {
        width: 100%;
    }
    `;

    //Settings and imports
	const { Settings } = { ...Library, ...BdApi };
	const { SettingPanel, Switch, Textbox } = Settings;

	//default settings
	const defaultSettings = {
        defaultWidth: 240,
        maxWidth: 674,
        minWidth: 112,
        roundBorders: true,
        borderRadius: 8,
	};

    var settings = defaultSettings;

    var channelListClass = '.sidebar-1tnWFu';
    var friendsTabClass = '.container-2cd8Mz';
    var nitroTabClass = '.applicationStore-2nk7Lo';
    var chatContainerClass = '.chat-2ZfjoI';

    function GetResizeObjects() {
        // inline because closing/opening thread clears class list
        const containerChat = document.querySelector(`${chatContainerClass}, ${friendsTabClass}, ${nitroTabClass}`);
        if (containerChat && settings.roundBorders) { containerChat.style.borderTopLeftRadius = `${settings.borderRadius}px`; containerChat.style.borderBottomLeftRadius = `${settings.borderRadius}px`;}

        const channelList = document.querySelector(channelListClass);
        if(settings.roundBorders) {
            channelList.style.borderTopRightRadius = `${settings.borderRadius}px`;
            channelList.style.borderBottomRightRadius = `${settings.borderRadius}px`;
        }
        if (!document.querySelector(".ResizableChannels-Slider-Handle")) addReziseHandleRight(channelList);
    }

    function addReziseHandleRight(target) {
        target.style.width = `${settings.defaultWidth}px`;
        var handle = document.createElement("div");
        handle.classList.add("ResizableChannels-Slider-Handle");
        handle.classList.add("resizeHandle-PBRzPC");
        // target.appendChild(handle);
        target.after(handle);
        var offset = 0;
        handle.addEventListener("mousedown", (e) => {
            offset = e.clientX - e.target.getBoundingClientRect().x;
            document.addEventListener("mousemove", resize, true);
            handle.addEventListener("dblclick", toggleVisibility, true);
        });
        handle.addEventListener("mouseup", (e) => document.removeEventListener("mousemove", resize, true));

        function toggleVisibility(e) {
            var newWidth = 0;
            if (target.style.width === "0px")
            {
                handle.style.cursor = "ew-resize";
                newWidth = settings.defaultWidth;
                AddStyle();
            } else {
                handle.style.cursor = "e-resize";
                handle.style.marginRight = "-8px";
                RemoveStyle();
            }
            target.style.width = `${newWidth}px`;
        }

        function resize(e) {
            handle.removeEventListener("dblclick", toggleVisibility, true);
            if (e.buttons != 1) {
                document.removeEventListener("mousemove", resize, true);
                return;
            }
            var potentialWidth = e.clientX - target.getBoundingClientRect().left - offset; // mouse position
            var width = Math.min(Math.max(potentialWidth, settings.minWidth), settings.maxWidth);
            if (width <= settings.minWidth) {
                if (potentialWidth <= settings.minWidth * 0.1) { // snap width to zero if the mouse is at less than 10% of the minimum width
                    width = 0;
                    handle.style.marginRight = "-8px";
                    RemoveStyle();
                } else {
                    handle.style.marginRight = "0";
                    width = settings.minWidth;
                    AddStyle();
                }
            }
            else {
                handle.style.marginRight = "0";
                AddStyle()
            }
            target.style.width = `${width}px`;
            if (width == 0) handle.style.cursor = "e-resize";
            else if (width == settings.maxWidth) handle.style.cursor = "w-resize";
            else handle.style.cursor = "ew-resize";
        }

        var style = true;
        var containerChat;

        function RemoveStyle() {
            if (!style) return;
            style = false;
            containerChat = document.querySelector(`${chatContainerClass}, ${friendsTabClass}, ${nitroTabClass}`);
            if (containerChat) containerChat.removeAttribute("style");
        }

        function AddStyle() {
            if(style) return;
            style = true;
            if(settings.roundBorders) {
                containerChat = document.querySelector(`${chatContainerClass}, ${friendsTabClass}, ${nitroTabClass}`);
                if (containerChat) {
                    containerChat.style.borderTopLeftRadius = `${settings.borderRadius}px`; containerChat.style.borderBottomLeftRadius = `${settings.borderRadius}px`;
                }
            }
            handle.style.marginRight = "0px";
        }
    }

    function UpdateStyle() {
        const containerChat = document.querySelector(`${chatContainerClass}, ${friendsTabClass}, ${nitroTabClass}`);
        const channelList = document.querySelector(channelListClass);
        if (!containerChat) return;
        if(settings.roundBorders) {
            if (containerChat) {
                containerChat.style.borderTopLeftRadius = `${settings.borderRadius}px`; containerChat.style.borderBottomLeftRadius = `${settings.borderRadius}px`
            }
            if (channelList) {
                channelList.style.borderTopRightRadius = `${settings.borderRadius}px`;
                channelList.style.borderBottomRightRadius = `${settings.borderRadius}px`;
            }
            return;
        }
        if (containerChat) containerChat.removeAttribute("style");
        if (channelList) channelList.removeAttribute("style");
    }

    return class template extends Plugin {
        onStart() {
			settings = this.loadSettings(defaultSettings);

            BdApi.injectCSS(config.info.name, customCSS);
            GetResizeObjects();
        }
        getSettingsPanel() {
			//build the settings pannel
            var resetValues = document.createElement("button");
            resetValues.classList = "button-f2h6uQ lookFilled-yCfaCM colorBrand-I6CyqQ sizeMedium-2bFIHr .marginBottom20-315RVT";
            resetValues.style = "width: 100%";
            resetValues.innerText = "Default Settings";
            resetValues.addEventListener("click", () => {
                // Set default settings
                settings = defaultSettings;
                this.saveSettings(settings);
                UpdateStyle();
                // Close settings panel (very ugly)
                settingsPannel.parentNode.parentNode.parentNode.lastChild.lastChild.click()
            });

            const settingsPannel = SettingPanel.build(() => this.saveSettings(settings),
                new Textbox("Default Width", "", settings.defaultWidth, (i) => {
                    settings.defaultWidth = parseInt(i.replace(/[^0-9]/g, '')) || defaultSettings.defaultWidth;
                }),
                new Textbox("Maximum Width", "", settings.maxWidth, (i) => {
                    settings.maxWidth = parseInt(i.replace(/[^0-9]/g, '')) || defaultSettings.maxWidth;
                }),
                new Textbox("Minimum Width", "This option is intended to fix custom themes.", settings.minWidth, (i) => {
                    settings.minWidth = parseInt(i.replace(/[^0-9]/g, '')) || defaultSettings.minWidth;
                }),
                new Switch( "Rounded Corners", "Disable this if you are using a theme that rounds the channel list and chat corners.", settings.roundBorders, (i) => {
                    settings.roundBorders = i;
                    UpdateStyle();
                }),
                new Textbox("Corner Radious", "How rounded the corners should be.", settings.borderRadius, (i) => {
                    settings.borderRadius = parseInt(i.replace(/[^0-9]/g, '')) || defaultSettings.borderRadius;
                    UpdateStyle();
                }),
                resetValues,
            );
			return  settingsPannel;
		}
        onSwitch() {
            GetResizeObjects();
        };
        onStop() {
            BdApi.clearCSS(config.info.name);

            const containerChat = document.querySelector(`${chatContainerClass}, ${friendsTabClass}, ${nitroTabClass}`);
            if(containerChat) {
                containerChat.style.removeProperty("border-top-left-radius"); containerChat.style.removeProperty("border-bottom-left-radius");
            }
            const containerChatHome = document.querySelector(chatContainerClass);
            if(containerChatHome) {
                containerChatHome.style.removeProperty("border-top-left-radius"); containerChatHome.style.removeProperty("border-bottom-left-radius");
            }
            const handles = document.querySelectorAll(".ResizableChannels-Slider-Handle");
            for (const h of handles) {
                h.parentNode.removeChild(h)
            };
            document.querySelector(channelListClass).style.width = `${settings.defaultWidth}px`;
        }
    }
})(global.ZeresPluginLibrary.buildPlugin(config));
