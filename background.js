// Load data.json from extension directory when installed
chrome.runtime.onInstalled.addListener(function() {
  fetch(chrome.runtime.getURL('data.json'))
    .then(response => response.json())
    .then(data => {
      chrome.storage.local.set({formData: data});
      console.log('Default data loaded from data.json');
    })
    .catch(error => {
      console.error('Error loading data.json:', error);
    });
});