var url = new URL(window.location.href);
const code = url.searchParams.get("code");

if (code) {
  chrome.runtime.sendMessage(
    {
      type: "fetch-token",
      params: {
        code: code
      },
    }, () => {
      setTimeout(window.close, 1000);
    });
}
