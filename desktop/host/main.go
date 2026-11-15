package main

import (
	"os/exec"

	"github.com/jchv/go-webview2"
)

const startURL = "https://test.olxp.cc/"

func main() {
	w := webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     false,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:  "候选考试",
			Width:  1200,
			Height: 860,
			IconId: 1,
			Center: true,
		},
	})
	if w == nil {
		openInBrowser()
		return
	}
	defer w.Destroy()
	w.SetSize(900, 640, webview2.HintMin)
	showLoadingIn(uintptr(w.Window()))
	_ = w.Bind("examReady", func() {
		closeLoading()
	})
	w.Init(`document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a');if(a&&a.target==='_blank'&&a.href){e.preventDefault();location.href=a.href;}},true);`)
	w.Init(`if(location.hostname==='test.olxp.cc'){window.addEventListener('load',function(){if(window.examReady){examReady();}})}`)
	w.Navigate(startURL)
	w.Run()
}

func openInBrowser() {
	_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", startURL).Start()
}
