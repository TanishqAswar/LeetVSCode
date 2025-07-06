/// <reference types="chrome" />

// Background script
console.log('LeetVSCode background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('LeetVSCode extension installed');
});