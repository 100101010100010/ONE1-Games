import { getFavicon, rAlert } from "./utils.mjs";
import { getUV, search } from "./prxy.mjs";

const { span, iframe, button, img } = van.tags;
const {
  tags: { "ion-icon": ionIcon },
} = van;

var tabs = [];
var selectedTab = null;

const urlInput = document.getElementById("url-input");
const tabList = document.getElementById("tab-list");
const tabView = document.getElementById("tab-view");

// Basic Controls
document.getElementById("page-back").onclick = () => selectedTab?.view.contentWindow.history.back();
document.getElementById("page-forward").onclick = () => selectedTab?.view.contentWindow.history.forward();
document.getElementById("page-refresh").onclick = () => selectedTab?.view.contentWindow.location.reload();
document.getElementById("new-tab").onclick = () => addTab("duckduckgo.com");

document.getElementById("url-form").onsubmit = (e) => {
  e.preventDefault();
  if (selectedTab) navigate(selectedTab, urlInput.value);
};

async function navigate(tab, link) {
  const url = await getUV(link);
  tab.url = search(link);
  tab.proxiedUrl = url;
  tab.view.src = url;
  urlInput.value = tab.url;
}

function focusTab(tab) {
  if (selectedTab) {
    selectedTab.view.style.display = "none";
    const oldIdx = tabs.indexOf(selectedTab);
    if (tabList.children[oldIdx]) tabList.children[oldIdx].classList.remove("selectedTab");
  }
  selectedTab = tab;
  tab.view.style.display = "block";
  urlInput.value = tab.url;
  const newIdx = tabs.indexOf(tab);
  if (tabList.children[newIdx]) tabList.children[newIdx].classList.add("selectedTab");
}

async function addTab(link) {
  // 1. Convert link to Proxy URL
  let url = await getUV(link);
  
  let tab = {
    url: search(link),
    proxiedUrl: url,
    view: iframe({ src: url, class: "tab-frame", style: "display: none;" })
  };

  // 2. Create the Tab Button
  tab.item = button({
      class: "tab-item",
      onclick: () => focusTab(tab),
    },
    span(tab.url.substring(0, 20) + "..."),
    ionIcon({
      name: "close-outline",
      onclick: (e) => { e.stopPropagation(); closeTab(tab); }
    })
  );

  tabs.push(tab);
  tabList.appendChild(tab.item);
  tabView.appendChild(tab.view);
  
  focusTab(tab);
}

function closeTab(tab) {
  const index = tabs.indexOf(tab);
  if (index > -1) {
    tab.view.remove();
    tab.item.remove();
    tabs.splice(index, 1);
    if (tabs.length > 0) focusTab(tabs[Math.max(0, index - 1)]);
    else addTab("duckduckgo.com");
  }
}

// --- THE STARTUP LOGIC ---
// This is the only part that cares about the homepage search
const startBrowser = () => {
    const query = localStorage.getItem('autoSearchQuery');
    if (query) {
        localStorage.removeItem('autoSearchQuery'); // Clear it immediately
        addTab(query);
    } else {
        addTab("duckduckgo.com");
    }
};

startBrowser();
